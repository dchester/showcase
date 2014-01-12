exports.html = function(input) {

	if (!input) return;

	var input = String(input);

	return input.replace(/&(?!amp;|lt;|gt;|quot;|#39;)/g, '&amp;')
	      .replace(/</g, '&lt;')
	      .replace(/>/g, '&gt;')
	      .replace(/"/g, '&quot;')
	      .replace(/'/g, '&#39;');

};
