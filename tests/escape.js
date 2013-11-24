var escape = require('../lib/escape');

exports.html = function(test) {
	var output = escape.html('<a href="/">home</a>');
	test.equal(output, '&lt;a href=&quot;/&quot;&gt;home&lt;/a&gt;');
	test.done();
};

exports.plain = function(test) {
	var output = escape.html('plain text');
	test.equal(output, 'plain text');
	test.done();
};

