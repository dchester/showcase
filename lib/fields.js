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
		name: "select",
		template: "select",
		meta: function() {
			if (this.meta && this.meta.split) {
				this.options = [];
				var lines = this.meta.split(/\n/);
				lines.forEach(function(line) {
					var option = {};
					line = line.trim();
					var matches = line.match(/(.+?)( \[(\w+)\])?$/);
					if (matches) {
						var title = matches[1];
						var handle = matches[3];
						option.title = title;
						option.handle = handle === undefined ? title : handle;
					}
					this.options.push(option);
				}, this);
			}
		},
		meta_description: "Enter options each on their own line with optional handles in sqaure brackets following titles.  For example: 'Black and White [b_w]'",
		preview: function(value, field, item, entity) {
			var preview = field.options.filter(function(option) { return value == option.handle }).shift();
			return preview.title || value;
		}
	},
	{
		name: 'checkbox',
		template: 'checkbox',
		normalize: function(value) {
			return Array.isArray(value) ? value[value.length - 1] : value;
		},
		inflate: function(field, data, models, callback) {
			var value = data[field.name];
			return callback(Number(value) ? true : false);
		},
		preview: function(value) {
			return Number(value) ? "✔" : "";
		},
	},
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
