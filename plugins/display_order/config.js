module.exports = {
	name: 'display_order',
	template: 'display_order',
	validator: null,
	placeholder: '',
	inflate: function(field, item, models, callback) {
		callback(Number(item.data[field.name]) + Number(item.id));
	},
	deflate: function(field, item, models, callback) {
		callback(Number(item.data[field.name]) - Number(item.id));
	},
	preview: function(value) {
		value = value || 0;
		return '<span class="display-order" data-initial-value="' + value + '"><span class="tooltip">Sort by this column to reorder</span></span>';
	}
};

