var Loader = function() {

	var templates = {};

	return {
		resolve: function(identifier) {
			return identifier;
		},
		load: function(identifier, callback) {
			if (callback) return callback(null, templates[identifier]);
			return templates[identifier];
		},
		set: function(identifier, template_contents) {
			templates[identifier] = template_contents;
		}
	};
};

module.exports = Loader;

