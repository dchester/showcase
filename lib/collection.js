var dreamer = require('dreamer');
var models = dreamer.instance.models;
var controls = require('./fields').controls;
var execute = require('genny').run;

var Collection = function(properties, callback) {

	var self = this;

	execute (function* (resume) {

		if (properties.id) self.id = properties.id;

		self.title = properties.title;
		self.description = properties.description;
		self.name = properties.name;
		self.workspace_handle = properties.workspace_handle;
		self._data = properties.save ? properties : models.collections.build(self);
		self.fields = yield self._fields(resume());

		callback(null, self);
	});
};

Collection.prototype = {

	attributes: ['title', 'description', 'name'],

	save: function(callback) {
		var self = this;
		execute (function* (resume) {
			self.attributes.forEach( function(key) {
				self._data[key] = self[key];
			});
			yield self._data.save().complete(resume());
			self.id = self._data.id;
			callback();
		});
	},

	update: function(args, callback) {
		var self = this;
		execute (function* (resume) {

			var changed_fields = args.fields;

			self.attributes.forEach( function(key) {
				if (key in args) self[key] = args[key];
			});

			yield self.save(resume());

			if (!changed_fields) return callback();

			var changes = self._resolveFieldModifications({
				initial_fields: self.fields,
				changed_fields: changed_fields
			});

			yield self._updateFields({ changes: changes }, resume());

			callback();
		});
	},

	destroy: function(args, callback) {
		var self = this;
		execute (function* (resume) {
			yield self._data.destroy().complete(resume());
			callback();
		});
	},

	_fields: function(callback) {
		var self = this;
		execute (function* (resume) {

			if (!self.id) return callback();

			var fields = yield models.collection_fields
				.findAll({ where: { collection_id: self.id } })
				.complete(resume());

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

			callback(null, fields);
		});
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
			.map(function(k) { return changes.modifications[k]; });

		return changes;
	},

	_updateFields: function(args, callback) {
		var self = this;
		execute (function* (resume) {

			var changes = args.changes;

			for (var i = 0; i < changes.deletions.length; i++) {

				var deletion = changes.deletions[i];

				var field = yield models.collection_fields
					.find({ where: { id: deletion.id } })
					.complete(resume());

				yield field.destroy().complete(resume());
			}

			for (i = 0; i < changes.modifications.length; i++) {

				var modification = changes.modifications[i];

				var field = yield models.collection_fields
					.find({ where: { id: modification.id } })
					.complete(resume());

				field.updateAttributes(modification)
				yield field.save().complete(resume());
			}

			for (i = 0; i < changes.additions.length; i++) {

				var addition = changes.additions[i];

				delete addition.id;
				var field = models.collection_fields.build(addition);
				yield field.save().complete(resume());
			}

			callback();
		});
	}
};

Collection.load = function(args, callback) {

	execute (function* (resume) {

		var id = args.id;
		var name = args.name;

		var criteria = {};

		if (id) { criteria.id = id; }
		if (name) { criteria.name = name; }

		var data = yield models.collections
			.find({ where: criteria })
			.complete(resume());

		var collection = yield new Collection(data, resume());

		console.log('calling back load', collection);

		callback(null, collection);
	});
};

Collection.all = function(args, callback) {

	execute (function* (resume) {

		var workspace_handle = args.workspace_handle;

		models.collections
			.findAll({ where: { workspace_handle: workspace_handle } })
			.complete(resume());

		models.collection_fields.findAll().complete(resume());

		var collections = yield resume;
		var fields = yield resume;

		collections = collections.map(function(c) { return c.values });

		var map = {};
		collections.forEach(function(c) { map[c.id] = c; });

		fields.forEach(function(field) {

			var collection = map[field.collection_id];
			if (!collection) return;

			collection.fields = collection.fields || [];
			collection.fields.push(field.values);
		});

		callback(null, collections);
	});
};

Collection.itemCounts = function(args, callback) {

	execute( function* (resume) {

		var query = "select collection_id, count(*) as count from items group by 1";
		var rows = yield dreamer.instance.db.query(query).complete(resume());

		var counts = {};
		rows.forEach(function(row) {
			counts[row.collection_id] = row.count;
		});

		callback(null, counts);
	});
};

Collection.field_attribute_names = [ 'id', 'title', 'name', 'data_type', 'description', 'is_required', 'index', 'meta' ];

module.exports = Collection;

