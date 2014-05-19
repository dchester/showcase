var controls = [
	{ name: 'string',     template: 'fields/input.html', validator: 'notEmpty', placeholder: '' },
	{ name: 'text',       template: 'fields/text.html',  validator: 'notEmpty', placeholder: '' },
	{ name: 'markdown',   template: 'fields/markdown.html',  validator: 'notEmpty', placeholder: '' },
	{ name: 'email',      template: 'fields/input.html', validator: 'isEmail',  placeholder: '' },
	{ name: 'ip_address', template: 'fields/input.html', validator: 'isIP',     placeholder: 'XXX.XXX.XXX.XXX' },
	{ name: 'url',        template: 'fields/input.html', validator: 'isUrl',    placeholder: '' },
	{ name: 'date',       template: 'fields/input.html', validator: 'isDate',   placeholder: 'YYYY-MM-DD' },
	{
		name: 'number',
		template: 'fields/input.html',
		validator: 'isNumeric',
		placeholder: '',
		inflate: function(field, item, models, callback) {
			callback(Number(item.data[field.name]));
		}
	},
	{
		name: "select",
		template: "fields/select.html",
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
		preview: function(value, field, item, collection) {
			var preview = field.options.filter(function(option) { return value == option.handle }).shift();
			return preview ? preview.title : value;
		}
	},
	{
		name: 'checkbox',
		template: 'fields/checkbox.html',
		normalize: function(value) {
			return Array.isArray(value) ? value[value.length - 1] : value;
		},
		inflate: function(field, item, models, callback) {
			var value = item.data[field.name];
			return callback(Number(value) ? true : false);
		},
		preview: function(value) {
			return Number(value) ? "✔" : "";
		},
	}
];

exports.controls = controls;

exports.register = function(control) {
	controls.push(control);
};
