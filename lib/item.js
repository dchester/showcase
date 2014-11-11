var async = require('async');
var dreamer = require('dreamer').instance;
var models = dreamer.models;
var Collection = require('./collection.js');
var Fields = require('./fields.js');
var validators = require('validator').validators;
var ItemData = require('./item-data');
var escape = require('./escape');
var moment = require('moment');
var gx = require('gx');
var Status = require('./status');

var Item = function() {
	this.initialize.apply(this, arguments);
};

Item.prototype = {

	initialize: function*(properties) {

		if (!properties) return;	
		if (properties.id) this.id = properties.id;

		this.collection_id = properties.collection_id;
		this.create_time = properties.create_time || new Date();
		this.update_time = properties.update_time || new Date();
		this.status = properties.status || 'draft';
		this.key = properties.key;

		if (properties.save) {
			this._model_instance = properties;
		} else {
			this._new = true;
			this._model_instance = models.items.build(this);
		}

		this.collection = yield this._collection();
		this.data = yield this._data();

		this.user = yield this._user();
		this.updated_relative_time = moment(this.update_time).fromNow();

		return this;
	},

	save: function*(args) {

		var user_id = args.user_id;

		this._model_instance.status_id = Status.id(this.status);

		yield this._model_instance.save().complete(gx.resume);
		this.id = this._model_instance.id;

		yield this._saveData({ user_id: user_id });
		var item = yield Item.load({ id: this.id });

		var radio = dreamer.app.radio;
		radio.emit(this._new ? 'itemCreate' : 'itemUpdate', item);

		return item;
	},

	update: function(args) {

		var data = args.data;
		if (!data) throw new Error("`data` is required");

		var user_id = args.user_id;
		this.update_time = new Date();

		this._overlayData(data);
		this.data = this._normalizeData(this.data);

		if (args.status) {
			this.status = args.status;
		}
	},

	destroy: function*() {

		yield this._model_instance.destroy().complete(gx.resume);

		var radio = dreamer.app.radio;
		radio.emit('itemDestroy', this);
	},

	validate: function() {

		var data = this.data;
		var errors = {};

		this.collection.fields.forEach(function(field) {

			if (field.is_required) {
				if (typeof data[field.name] != 'object' && data[field.name] !== null) {
					if (data[field.name] === undefined || (!validators.notEmpty(data[field.name]))) {
						errors[field.name] = "Required";
						return;
					}
				}
			}

			if (data[field.name] !== undefined && data[field.name] !== '') {

				var validator = validators[field.control.validator];
				var is_valid = validator ? validator(data[field.name] || "") : true;

				if (!is_valid) {
					errors[field.name] = "Failed assertion: " + field.control.validator;
				}
			}
		});

		errors = Object.keys(errors).length ? errors : null;

		return errors;
	},

	revisions: function*() {

		var revisions = yield models.item_data_revisions.findAll({
			order: 'id desc',
			where: { item_id: this.id }
		}).complete(gx.resume);

		revisions = JSON.parse(JSON.stringify(revisions));

		var users = yield models.users.findAll().complete(gx.resume);

		revisions.forEach(function(revision) {
			var user = users
				.filter(function(u) { return u.id == revision.user_id; })
				.shift();
			revision.username = user.username || 'unknown';
			revision.data = revision.data.slice(0, 60);
			revision.relative_time = moment(revision.create_time).fromNow();
		});

		return revisions;
	},

	revision: function*(args) {

		var item_id = args.item_id;
		var revision_id = args.revision_id;

		var revision = yield models.item_data_revisions
			.find({ where: { id: revision_id } })
			.complete(gx.resume);

		var user = yield models.users
			.find({ where: { id: revision.user_id } })
			.complete(gx.resume);

		revision.username = user.username;
		revision.relative_time = moment(revision.create_time).fromNow();
	
		return revision;
	},

	_data: function*() {

		if (this.id) {

			var item_data = yield ItemData.find({ item_id: this.id });

			var data = {
				_raw: item_data.data,
				_user_id: item_data.user_id
			};

			this.collection.fields.forEach(function(field) {
				data[field.name] = item_data.data[field.id];
			}, this);

			return data;

		} else {
			return { data: {} };
		}
	},

	_collection: function*() {
		var collection_id = this.collection_id;
		return yield Collection.load({ id: collection_id, });
	},

	_user: function*() {

		var users = yield models.users
			.findAll()
			.complete(gx.resume);

		var user_id = this.data._user_id;

		var user = users
			.filter(function(user) { return user.id == user_id});

		if (user && user.length) return user[0];
		return 'unknown';
	},

	_saveData: function*(args) {

		var errors = this.validate();
		if (errors) throw new Error("invalid data: " + JSON.stringify(errors));

		var user_id = args.user_id;

		var storable_item_data = yield Item._deflate(this);

		var method = this._new ? 'create' : 'update';

		yield ItemData[method]({
			item: this,
			user_id: user_id,
			data: storable_item_data,
		});
	},

	_overlayData: function(data) {

		this.collection.fields.forEach(function(field) {
			if (field.name in data) {
				this.data[field.name] = data[field.name];
			}
		}, this);

		return null;
	},

	_normalizeData: function(data) {

		var normalized_data = {};

		this.collection.fields.forEach(function(field) {
			if (field.control.normalize) {
				normalized_data[field.name] = field.control.normalize(data[field.name]);
			} else {
				normalized_data[field.name] = data[field.name];
			}
		});

		return normalized_data;
	}
};

Item.load = function*(args) {

	var criteria = {};

	if ('id' in args) {
		criteria.id = args.id;
	} else if ('key' in args) {
		criteria.key = args.key;
	} else {
		throw new Error("`key` or `id` is required");
	}

	var data = yield models.items
		.find({ where: criteria })
		.complete(gx.resume);

	data.status = Status.name(data.status_id);

	var item = yield new Item(data);

	if (!item) return;

	var inflated_item = yield Item._inflate(item);
	return inflated_item;
};

Item.all = function*(args) {

	var collection_id = args.collection_id;
	if (!collection_id) throw new Error("`collection_id` is required");

	var search = args.search;
	var criteria = args.criteria || {};
	var sort = args.sort;
	var per_page = args.per_page || 10;
	var page = args.page || 1;
	var offset = (page - 1) * per_page;
	var limit = per_page;

	var find_args = { where: { collection_id: collection_id }, order: 'id desc' };

	var manual_pagination = sort || search || criteria;

	if (!manual_pagination) {
		find_args.offset = offset;
		find_args.limit = limit;
	}

	models.items
		.findAll(find_args)
		.complete(gx.resume);

	models.items
		.count({ where: { collection_id: collection_id } })
		.complete(gx.resume);

	var items = yield null;
	var count = yield null;

	if (!items) return success([]);

	var collection = yield Collection.load({ id: collection_id, });
	var ids = items.map(function(i) { return i.id; });
	var items_data = yield ItemData.findAll({ item_ids: ids });
	items = JSON.parse(JSON.stringify(items));

	items.forEach(function(item) {

		var data = items_data[item.id];

		item.data = {};
		item.collection = collection;

		collection.fields.forEach(function(field) {
			item.data[field.name] = data[field.id];
		});

		item.status = Status.name(item.status_id);
	});

	for (var i=0; i<items.length; i++) {
		yield Item._inflate(items[i]);
	}

	if (criteria) {

		items = items.filter(function(item) {
			var failable;
			Object.keys(criteria).forEach(function(key) {
				if (key in item) {
					if(item[key] != criteria[key]) {
						failable = true;
					}
				} else if (key in item.data) {
					if (item.data[key] != criteria[key]) {
						failable = true;
					}
				} else {
					failable = true;
				}
			});
			return !failable;
		});
	}

	if (search) {
		var re = new RegExp("\\b" + search +  "\\b", "i");
		items = items.filter(function(item) {
			var passable;
			collection.fields.forEach(function(field) {
				if (re.test(item.data[field.name])) {
					passable = true;
				}
			});
			return passable;
		});
	}

	if (sort) {

		sort = Array.isArray(sort) ? sort : [sort];

		items.sort(function(a, b) {

			var comparison;
			sort.forEach(function(s) {

				if (comparison) return;

				var is_collection_field = collection.fields
					.filter(function(f) { return f.name == s.field_name })
					.length;

				var a_value = is_collection_field ? a.data[s.field_name] : a[s.field_name];
				var b_value = is_collection_field ? b.data[s.field_name] : b[s.field_name];

				comparison = a_value < b_value ? -1 : a_value > b_value ? 1 : 0;
				if (s.order === 'desc') comparison *= -1;
			});

			return comparison;
		});
	}

	if (manual_pagination) {
		var totalCount = items.length;
		items = items.splice(offset, limit);
		items.totalCount = totalCount;

	} else {
		items.totalCount = count;
	}

	items.page = page;
	items.per_page = per_page;

	items.collection = collection;
	return items;
};

Item.create = function*(args) {

	var user_id = args.user_id;
	var item = yield Item.build(args);
	yield item.save({ user_id: user_id });
	item = yield Item.load({ id: item.id });

	return item;
};

Item.build = function*(args) {

	var collection_id = args.collection_id;
	if (!collection_id) throw new Error("`collection_id` is required");

	var status = args.status || 'draft';
	var data = args.data;

	var radio = dreamer.app.radio;
	var user_id = args.user_id;

	var collection = yield Collection.load({ id: collection_id });

	var properties = {
		collection_id: collection_id,
		status: status,
		data: data,
		key: data.key
	};

	var item = yield new Item(properties);
	item.update({ data: data });

	return item;
};

Item._deflate = function(item, callback) {
	var storable_item_data = {};
	async.forEach(item.collection.fields, function(field, callback) {
		if (field.name in item.data) {
			if (field.control.deflate) {
				field.control.deflate(field, item, models, function(value) {
					storable_item_data[field.id] = value;
					callback();
				});
			} else {
				storable_item_data[field.id] = item.data[field.name];
				callback();
			}
		}
	}, function() {
		callback(null, storable_item_data);
	});
};

Item._inflate = function(item, callback) {

	var collection = item.collection;

	async.forEach(collection.fields, function(field, callback) {

		if (field.control.inflate) {
			field.control.inflate(field, item, models, function(value) {
				item.data[field.name] = value;
				callback();
			});
		} else {
			callback();
		}

	}, function() {
		callback(null, item);
	});
};

Item._preview = function(item, collection) {

	collection.fields.forEach(function(field) {
		var preview = field.control.preview || escape.html;
		var value = item.data[field.name];
		item.data[field.name] = preview(item.data[field.name], field, item, collection);
	});

	return item;
};

Item.distill = function(item) {

	var distilled_item = {
		id: item.id,
		status: item.status || Status.name(item.status_id),
		create_time: item.create_time,
		update_time: item.update_time,
	};

	Object.keys(item.data).forEach(function(key) {
		if (key.match(/^_/)) return;
		var item_data = item.data[key];
		if ( item_data && typeof item_data == 'object' ) {
			delete item_data["_view_data"];
		}
		distilled_item[key] = item_data;
	});

	return distilled_item;
};

Item.restore = function*(args) {

	var revision_id = args.revision_id;
	var item_id = args.id;
	var success = args.success;
	var error = args.error || console.warn;
	var user_id = args.user_id;

	var item = yield Item.load({ id: item_id });

	var revision = yield models.item_data_revisions
		.find(revision_id)
		.complete(gx.resume);

	var data = JSON.parse(revision.data);

	yield ItemData.update({
		user_id: user_id,
		id: item_id,
		item: item,
		data: data
	});
};

Item = gx.gentrify(Item, { functions: false });
Item._inflate = gx.gentrify(Item._inflate);
Item._deflate = gx.gentrify(Item._deflate);

module.exports = Item;

