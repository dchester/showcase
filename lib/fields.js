var controls = [
	{ name: 'string',     input: 'input',    validator: 'notEmpty', placeholder: '' },
	{ name: 'text',       input: 'textarea', validator: 'notEmpty', placeholder: '' },
	{ name: 'markdown',   input: 'textarea', validator: 'notEmpty', placeholder: '' },
	{ name: 'email',      input: 'input',    validator: 'isEmail',  placeholder: '' },
	{ name: 'ip_address', input: 'input',    validator: 'isIP',     placeholder: 'XXX.XXX.XXX.XXX' },
	{ name: 'url',        input: 'input',    validator: 'isUrl',    placeholder: '' },
	{ name: 'date',       input: 'input',    validator: 'isDate',   placeholder: 'YYYY-MM-DD' },
	{ name: 'number',     input: 'input',    validator: 'isNumber', placeholder: '' }
];

exports.controls = controls;
