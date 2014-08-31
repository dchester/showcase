var sort = {
	deserialize: function(serialized_sort) {
		if (!serialized_sort) return null;
		return serialized_sort
			.split(',')
			.map(function(s) {
				var comps = s.split(':');
				var field_name = comps[0];
				var order = comps[1] == 'desc' ? 'desc' : 'asc';
				return {
					field_name: field_name, 
					order: order
				};
			});
	},
	serialize: function(sort) {
		if (!sort) return '';
		if (!sort.length) return '';
		return sort
			.map(function(s) {
				var field_name = s.field_name;
				var order = s.order == 'desc' ? 'desc' : null;
				return [field_name, order].filter(function(f) { return f }).join(':');
			})
			.join(',');
	}
};

module.exports = sort;

