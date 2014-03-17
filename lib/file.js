var fs = require('fs');
var dreamer = require('dreamer');
var models = dreamer.instance.models;
var gx = require('gx');
var mv = require('mv');
var path = require('path');
var sha1 = require('sha1');

var File = function() {
	this.initialize.apply(this, arguments);
};

File.prototype = {

	initialize: function*(properties) {

		if (properties.id) this.id = properties.id;

		if (!properties.path) throw new Error("we need a file path");
		if (!properties.size) throw new Error("we need a file size");
		if (!properties.original_filename) throw new Error("we need an original_filename");
		if (!properties.content_type) throw new Error("we need a content_type");

		this.item_id = properties.item_id;
		this.path = properties.path;
		this.url = properties.url;
		this.size = properties.size;
		this.original_filename = properties.original_filename;
		this.content_type = properties.content_type;
		this.storage_path = properties.storage_path;
		this.meta_json = '{}';
		this.description = '';

		this._model_instance = properties.save ? properties : models.files.build(this);

		return this;
	},

	store: function*() {

		var filename = this.name();
		var target_path = path.join(this.storage_path, 'files', filename);
		yield mv(this.path, target_path, gx.resume);
		this.path = target_path;
		this.url = '/files/' + filename;
	},

	retrieve: function(args) {

		var stream = fs.createReadStream(this.path);
		return stream;
	},

	save: function*() {

		File.mutable_attributes.forEach(function(key) {
			this._model_instance[key] = this[key];
		}, this);

		yield this._model_instance.save().complete(gx.resume);
		this.id = this._model_instance.id;
	},

	public_url: function() {
		return '/files/' + this.path;
	},

	name: function() {
		var filename = sha1(this.path + Math.random()) + '-' + this.original_filename;
		return filename;
	}
};

File.load = function*(args) {

	var id = args.id;

	var data = yield models.files
		.find({ where: { id: id }})
		.complete(gx.resume);

	var file = yield new File(data);
	return file;
};

File.create = function*(args) {

	var item_id = args.item_id;
	var original_filename = args.original_filename;
	var size = args.size;
	var path = args.source_path;
	var content_type = args.content_type;
	var storage_path = args.storage_path;

	if (!storage_path) throw new Error("we need a storage_path");

	var file = yield new File({
		item_id: item_id,
		size: size,
		original_filename: original_filename,
		path: path,
		content_type: content_type,
		storage_path: storage_path
	});
	
	yield file.store();
	yield file.save();

	return file;
};

File.mutable_attributes = ['description', 'meta_json', 'path', 'url'];

File.methods = function(methods) {
	['store', 'retrieve', 'name', 'public_url'].forEach(function(method_name) {
		if (methods[method_name]) {
			File.prototype[method_name] = gx.gentrify(methods[method_name]);
		}
	});
};

File = gx.class(File, { functions: false });

File.distill = function(file) {
	var distilled_file = JSON.parse(JSON.stringify(file));
	delete distilled_file._model_instance;
	return distilled_file;
}

module.exports = File;

