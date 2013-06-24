var validators = require('validator').validators;

var fields = [
	{ name: 'string',     input: 'input',    validate: 'notEmpty', placeholder: '' },
	{ name: 'text',       input: 'textarea', validate: 'notEmpty', placeholder: '' },
	{ name: 'markdown',   input: 'textarea', validate: 'notEmpty', placeholder: '' },
	{ name: 'email',      input: 'input',    validate: 'isEmail',  placeholder: '' },
	{ name: 'ip_address', input: 'input',    validate: 'isIP',     placeholder: 'XXX.XXX.XXX.XXX' },
	{ name: 'url',        input: 'input',    validate: 'isUrl',    placeholder: '' },
	{ name: 'date',       input: 'input',    validate: 'isDate',   placeholder: 'YYYY-MM-DD' },
	{ name: 'number',     input: 'input',    validate: 'isNumber', placeholder: '' }
];

var Field = function() {

	this.validator = args.validator;
	this.required = args.required;

	this.input = args.input;
	

};

field = new Field('text');
field.render

field.validate(

