module.exports = {
	name: 'display_order',
	template: 'display_order',
	validator: null,
	placeholder: '',
	inflate: function(field, item, models, callback) {
		callback(Number(item.data[field.name]) + -1 * Number(item.id));
	},
	deflate: function(field, item, models, callback) {
		var value = item.data[field.name];
		if (value == 'initial' || value == null) {
			callback(0);
		} else {
			callback(Number(value) - -1 * Number(item.id));
		}
	},
	preview: function(value) {
		value = value || 0;
		return '<span class="display-order" data-initial-value="' + value + '"><button type="button" class="up">&#xf062;</button><button type="button" class="dn">&#xf063;</button><span class="tooltip">Sort by this column to reorder</span></span>';
	}
};

