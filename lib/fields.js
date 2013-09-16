var controls = [
	{ name: 'string',     template: 'input', validator: 'notEmpty', placeholder: '' },
	{ name: 'text',       template: 'text',  validator: 'notEmpty', placeholder: '' },
	{ name: 'markdown',   template: 'markdown',  validator: 'notEmpty', placeholder: '' },
	{ name: 'email',      template: 'input', validator: 'isEmail',  placeholder: '' },
	{ name: 'ip_address', template: 'input', validator: 'isIP',     placeholder: 'XXX.XXX.XXX.XXX' },
	{ name: 'url',        template: 'input', validator: 'isUrl',    placeholder: '' },
	{ name: 'date',       template: 'input', validator: 'isDate',   placeholder: 'YYYY-MM-DD' },
	{ name: 'number',     template: 'input', validator: 'isNumber', placeholder: '' },
	{
		name: 'image',
		template: 'image',
		validator: null,
		placeholder: '',
		inflate: function(field, data, models, callback) {

			if (!data[field.name]) return callback(null);

			models.files.find({ where: { id: data[field.name].file_id } })
				.error(console.warn)
				.success(function(file) {
					var file = JSON.parse(JSON.stringify(file));
					file.url = "/files/" + file.path;
					file.file_id = file.id;
					delete file.id;
					callback(file);
				});
		}
	}
];

exports.controls = controls;
