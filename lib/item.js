var async = require('async');
var dreamer = require('dreamer').instance;
var models = dreamer.models;
var Collection = require('./collection.js');
var Fields = require('./fields.js');
var validators = require('validator').validators;
var ItemData = require('./item-data');
var escape = require('./escape');
var moment = require('moment');
var bless = require('./genny-bless');

var Item = function() {
	this.initialize.apply(this, arguments);
};

Item.prototype = {

	initialize: function* (properties, resume) {

		if (!properties) return;	
		if (properties.id) this.id = properties.id;

		this.collection_id = properties.collection_id;
		this.create_time = properties.create_time || new Date();
		this.update_time = properties.update_time || new Date();
		this.status = properties.status || 'draft';

		if (properties.save) {
			this._model_instance = properties;
		} else {
			this._new = true;
			this._model_instance = models.items.build(this);
		}

		this.collection = yield this._collection(resume());
		this.data = yield this._data(resume());

		this.user = yield this._user(resume());
		this.updated_relative_time = moment(this.update_time).fromNow();

		return this;
	},

	save: function* (args, resume) {

		var user_id = args.user_id;

		yield this._model_instance.save().complete(resume());
		this.id = this._model_instance.id;

		yield this._saveData({ user_id: user_id }, resume());

		var item = yield Item.load({ id: this.id }, resume());

		var radio = dreamer.app.radio;
		radio.emit('itemUpdate', item);

		return item;
	},

	update: function(args) {

		var data = args.data;
		if (!data) throw new Error("`data` is required");

		var user_id = args.user_id;
		this.update_time = new Date();

		this._overlayData(data);
		this.data = this._normalizeData(this.data);
	},

	destroy: function* (resume) {

		yield this._model_instance.destroy().complete(resume());

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

			if (data[field.name] !== '') {

				var validator = validators[field.control.validator];
				var is_valid = validator ? validator(data[field.name]) : true;

				if (!is_valid) {
					errors[field.name] = "Failed assertion: " + field.control.validator;
				}
			}
		});

		return Object.keys(errors).length ? errors : null;
	},

	revisions: function* (resume) {

		var revisions = yield models.item_data_revisions.findAll({
			order: 'id desc',
			where: { item_id: this.id }
		}).complete(resume());

		revisions = JSON.parse(JSON.stringify(revisions));

		var users = yield models.users.findAll().complete(resume());

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

	revision: function* (args, resume) {

		var item_id = args.item_id;
		var revision_id = args.revision_id;

		var revision = yield models.item_data_revisions
			.find({ where: { id: revision_id } })
			.complete(resume());

		var user = yield models.users
			.find({ where: { id: revision.user_id } })
			.complete(resume());

		revision.username = user.username;
		revision.relative_time = moment(revision.create_time).fromNow();
	
		return revision;
	},

	_data: function* (resume) {

		if (this.id) {

			var item_data = yield ItemData.find({ item_id: this.id }, resume());

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

	_collection: function* (resume) {
		var collection_id = this.collection_id;
		return yield Collection.load({ id: collection_id, }, resume());
	},

	_user: function* (resume) {

		var users = yield models.users
			.findAll()
			.complete(resume());

		var user = users
			.filter(function(user) { return user.id == this.data.user_id; }.bind(this)) 
			.shift();

		if (user && user.length) return user[0].username
		return 'unknown';
	},

	_saveData: function* (args, resume) {

		var errors = this.validate();
		if (errors) throw new Error("invalid data: " + JSON.stringify(errors));

		var user_id = args.user_id;

		var storable_item_data = {};

		this.collection.fields.forEach(function(field) {
			if (field.name in this.data) {
				storable_item_data[field.id] = this.data[field.name];
			}
		}, this);

		var method = this._new ? 'create' : 'update';

		yield ItemData[method]({
			item: this,
			user_id: user_id,
			data: storable_item_data,
		}, resume());
	},

	_overlayData: function(data) {

		this.collection.fields.forEach(function(field) {
			if (field.name in data) {
				this.data[field.name] = data[field.name];
			}
		}, this);
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

Item.load = function* (args, resume) {

	var id = args.id;
	if (!id) throw new Error("`id` is required");

	var data = yield models.items
		.find({ where: { id: id } })
		.complete(resume());

	var item = yield new Item(data, resume());
	var inflated_item = yield Item._inflate(item, resume());

	return inflated_item;
};

Item.all = function* (args, resume) {

	var collection_id = args.collection_id;
	if (!collection_id) throw new Error("`collection_id` is required");

	var criteria = args.criteria || {};

	var per_page = args.per_page || 10;
	var page = args.page || 1;

	var offset = (page - 1) * per_page;
	var limit = per_page;

	var find_args = { where: { collection_id: collection_id }, order: 'id desc' };

	if (!criteria) {
		find_args.offset = offset;
		find_args.limit = limit;
	}

	models.items
		.findAll(find_args)
		.complete(resume());

	models.items
		.count({ where: { collection_id: collection_id } })
		.complete(resume());

	var items = yield resume;
	var count = yield resume;

	if (!items) return success([]);

	var collection = yield Collection.load({ id: collection_id, }, resume());

	var ids = items.map(function(i) { return i.id; });

	var items_data = yield ItemData.findAll({ item_ids: ids }, resume());

	items = JSON.parse(JSON.stringify(items));

	items.forEach(function(item) {

		var data = items_data[item.id];

		item.data = {};
		collection.fields.forEach(function(field) {
			item.data[field.name] = data[field.id];
		});
	});

	if (criteria) {

		items = items.filter(function(item) {
			var failable;
			Object.keys(criteria).forEach(function(key) {
				if (item.data[key] != criteria[key]) {
					failable = true;
				}
			});
			return !failable;
		});

		var totalCount = items.length;
		items = items.splice(offset, limit);
		items.totalCount = totalCount;

	} else {

		items.totalCount = count;
	}

	items.collection = collection;
	return items;
};

Item.create = function* (args, resume) {

	var user_id = args.user_id;

	var item = yield Item.build(args, resume());
	yield item.save({ user_id: user_id }, resume());

	item = yield Item.load({ id: item.id }, resume());

	return item;
};

Item.build = function* (args, resume) {

	var collection_id = args.collection_id;
	if (!collection_id) throw new Error("`collection_id` is required");

	var status = args.status || 'draft';
	var data = args.data;

	var radio = dreamer.app.radio;
	var user_id = args.user_id;

	var collection = yield Collection.load({ id: collection_id, }, resume());

	var properties = {
		collection_id: collection_id,
		status: status,
		data: data
	};

	var item = yield new Item(properties, resume());
	item.update({ data: data });

	return item;
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
		status: item.status,
		create_time: item.create_time,
		update_time: item.update_time,
	};

	Object.keys(item.data).forEach(function(key) {
		distilled_item[key] = item.data[key];
	});

	return distilled_item;
};

Item.restore = function* (args, resume) {

	var revision_id = args.revision_id;
	var item_id = args.id;
	var success = args.success;
	var error = args.error || console.warn;
	var user_id = args.user_id;

	var item = yield Item.load({ id: item_id }, resume());

	var revision = yield models.item_data_revisions
		.find(revision_id)
		.complete(resume());

	var data = JSON.parse(revision.data);

	yield ItemData.update({
		user_id: user_id,
		id: item_id,
		item: item,
		data: data
	}, resume());
};

bless(Item);
module.exports = Item;

