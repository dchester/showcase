var dreamer = require('dreamer');
var models = dreamer.instance.models;
var controls = require('./fields').controls;
var gx = require('gx');

var Collection = function() {
	this.initialize.apply(this, arguments);
};

Collection.prototype = {

	attributes: ['title', 'description', 'name', 'workspace_handle'],

	initialize: function*(properties) {

		if (!properties) return;
		if (properties.id) this.id = properties.id;

		this.title = properties.title;
		this.description = properties.description;
		this.name = properties.name;

		this.workspace_handle = properties.workspace_handle;
		this._data = properties.save ? properties : models.collections.build(this);
		this.fields = yield this._fields();

		return this;
	},

	save: function*() {

		this.attributes.forEach(function(key) {
			this._data[key] = this[key];
		}, this);

		yield this._data.save().complete(gx.resume);
		this.id = this._data.id;
	},

	update: function*(args) {

		var changed_fields = args.fields;

		this.attributes.forEach(function(key) {
			if (key in args) this[key] = args[key];
		}, this);

		yield this.save();

		if (!changed_fields) return;

		var changes = this._resolveFieldModifications({
			initial_fields: this.fields,
			changed_fields: changed_fields
		});

		yield this._updateFields({ changes: changes });
	},

	destroy: function*() {
		yield this._data.destroy().complete(gx.resume);
	},

	_fields: function*() {

		if (!this.id) return;

		var fields = yield models.collection_fields
			.findAll({ where: { collection_id: this.id } })
			.complete(gx.resume);

		fields = JSON.parse(JSON.stringify(fields));

		fields.forEach(function(field) {

			field.control = controls
				.filter(function(c) { return c.name == field.data_type; })
				.shift(); 

			if (!field.control) {
				console.warn("couldn't find control: " + field.data_type);
			}

			if (field.control.meta) field.control.meta.call(field);
		});

		fields.sort(function(a, b) { return a.index - b.index });

		return fields;
	},

	_resolveFieldModifications: function(args) {

		var initial_fields = args.initial_fields;
		var changed_fields = args.changed_fields;

		var changes = { additions: [], deletions: [], modifications: [] };

		changed_fields.forEach(function(field) {
			var match = initial_fields
				.filter(function(f) { return field.id && field.id == f.id; } )
				.shift();

			if (!match) changes.additions.push(field);
		});

		initial_fields.forEach(function(field) {

			var match = changed_fields
				.filter(function(f) { return field.id == f.id; } )
				.shift();

			if (!match) {
				changes.deletions.push(field);
			} else {
				Collection.field_attribute_names.forEach(function(name) {
					if (field[name] != match[name]) {
						field[name] = match[name];
						changes.modifications[field.id] = field;
					}
				});
			}
		});

		changes.modifications = Object.keys(changes.modifications)
			.map(function(k) { return changes.modifications[k] });

		return changes;
	},

	_createFields: function*(fields) {

		for (var i = 0; i < fields.length; i++) {

			var field_data = fields[i];
			field_data.collection_id = this.id;
			delete field_data.id;

			yield models.collection_fields
				.create(field_data)
				.complete(gx.resume);
		}
	},

	_updateFields: function*(args) {

		var changes = args.changes;

		for (var i = 0; i < changes.deletions.length; i++) {

			var deletion = changes.deletions[i];

			var field = yield models.collection_fields
				.find({ where: { id: deletion.id } })
				.complete(gx.resume);

			yield field.destroy().complete(gx.resume);
		}

		for (i = 0; i < changes.modifications.length; i++) {

			var modification = changes.modifications[i];

			var field = yield models.collection_fields
				.find({ where: { id: modification.id } })
				.complete(gx.resume);

			field.updateAttributes(modification)
			yield field.save().complete(gx.resume);
		}

		for (i = 0; i < changes.additions.length; i++) {

			var addition = changes.additions[i];

			delete addition.id;
			var field = models.collection_fields.build(addition);
			yield field.save().complete(gx.resume);
		}
	}
};

Collection.create = function*(args) {

	var fields = args.fields;
	var properties = {};

	Collection.prototype.attributes.forEach(function(key) {
		properties[key] = args[key]
	});

	var collection = yield new Collection(properties);

	yield collection.save();
	yield collection._createFields(fields);

	return collection;
};

Collection.load = function*(args) {

	var id = args.id;
	var name = args.name;

	var criteria = {};

	if (id) { criteria.id = id; }
	if (name) { criteria.name = name; }

	var data = yield models.collections
		.find({ where: criteria })
		.complete(gx.resume);

	var collection = yield new Collection(data);

	return collection;
};

Collection.all = function*(args) {

	var workspace_handle = args.workspace_handle;

	models.collections
		.findAll({ where: { workspace_handle: workspace_handle } })
		.complete(gx.resume);

	models.collection_fields.findAll().complete(gx.resume);

	var collections = yield null;
	var fields = yield null;

	collections = collections.map(function(c) { return c.values });

	var map = {};
	collections.forEach(function(c) { map[c.id] = c; });

	fields.forEach(function(field) {

		var collection = map[field.collection_id];
		if (!collection) return;

		collection.fields = collection.fields || [];
		collection.fields.push(field.values);
	});

	return collections;
};

Collection.itemCounts = function*(args) {

	var query = "select collection_id, count(*) as count from items group by 1";
	var rows = yield dreamer.instance.db.query(query).complete(gx.resume);

	var counts = {};
	rows.forEach(function(row) {
		counts[row.collection_id] = row.count;
	});

	return counts;
};

Collection.field_attribute_names = [ 'id', 'title', 'name', 'data_type', 'description', 'is_required', 'index', 'meta' ];

Collection = gx.class(Collection, { functions: false });

module.exports = Collection;

