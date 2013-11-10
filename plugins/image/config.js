module.exports = {
	name: 'image',
	template: 'image',
	validator: null,
	placeholder: '',
	preview: function(value) {

		try { var parsed_data = JSON.parse(value) } 
		catch (e) { return "" }

		return '<h4><i class="muted large icon-picture"></i></h4>';
	},
	inflate: function(field, data, models, callback) {

		if (!data[field.name]) return callback(null);

		try { var parsed_data = JSON.parse(data[field.name]); }
		catch (e) {
			console.log("couldn't parse image list data");
			return callback([]);
		}

		var file_id = parsed_data.file_id;

		models.files.find({ where: { id: file_id } })
			.error(console.warn)
			.success(function(file) {

				file = JSON.parse(JSON.stringify(file));

				file.url = "/files/" + file.path;
				file.file_id = file.id;
				delete file.id;
				delete file.path;
				delete file.entity_item_id;
				delete file.meta_json;
				delete file.description;

				callback(file);
			});
	}
};

