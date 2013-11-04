module.exports = {
	name: 'image_list',
	template: 'image_list',
	validator: null,
	placeholder: '',
	preview: function(value) {

		try { var parsed_data = JSON.parse(value) } 
		catch (e) { return "" }

		return parsed_data.file_ids.length + " images";
		
	},
	inflate: function(field, data, models, callback) {

		if (!data[field.name]) return callback(null);

		try { var parsed_data = JSON.parse(data[field.name]); }
		catch (e) {
			console.log("couldn't parse image list data");
			return callback([]);
		}

		var file_ids = parsed_data.file_ids;

		models.files.findAll({ where: { id: file_ids } })
			.error(console.warn)
			.success(function(files) {

				files = JSON.parse(JSON.stringify(files));

				files.forEach(function(file) {
					file.url = "/files/" + file.path;
					file.file_id = file.id;
					delete file.id;
				});

				var sorted_files = [];

				file_ids.forEach(function(file_id) {
					var file = files.filter(function(f) { return f.file_id == file_id })[0];
					sorted_files.push(file);
				});

				callback(sorted_files);
			});
	}
};

