exports.parse = function (str, line, parser) {
	parser.on('*', function (token) {
		this.out.push(token.match);
	});
	return true;
};

exports.compile = function (compiler, args, content, parents, options) {
	return '(function () {\n' +
		'  var __o = _output;\n' +
		'  _output = "";\n' +
		compiler(content, parents, options, args.join('')) + ';\n' +
		'  __o += _ext.block ? _ext.block(_output) : _output;\n' +
		'  _output = __o;\n' +
		'})();\n';
};

exports.ends = true;
exports.block = true;

