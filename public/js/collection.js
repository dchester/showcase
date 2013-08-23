var InputPair = function(args) {

	this.source = args.source;
	this.target = args.target;

	this.transform = args.transform || function(str) {
		return str
			.toLowerCase()
			.replace(/(^\s+|\s+$)/g, '')
			.replace(/\s/g, '_');
	};

	if (!parseInt(this.target.getAttribute('data-autoupdate'))) return;

	this.source.addEventListener('keyup', function(e) {

		var transformedValue = this.transform(this.source.value);

		if (!this.target.getAttribute('data-dirty')) {
			this.target.value = transformedValue;
		}

	}.bind(this));

	this.target.addEventListener('keyup', function() {
		this.target.setAttribute('data-dirty', true);

	}.bind(this));
};

var InputReflector = function(args) {

	this.source = args.source;
	this.target = args.target;

	this.transform = args.transform || function(value) { return value };

	this.reflect = function(e) { this.target.textContent = this.transform(e.target.value); };

	this.target.innerText = this.transform(this.source.value);

	this.source.addEventListener('change', this.reflect.bind(this));
	this.source.addEventListener('keyup', this.reflect.bind(this));
};

var Collection = function(args) {

	this.initialize = function(args) {

		this.element = args.element;
		this.element.querySelector('#new_field')
			.addEventListener('click', function() {
				this.addFieldInputs({ show: true });
			}.bind(this));

		var source = this.element.querySelector("#row_template").innerHTML;
		this.template = swig.compile(source);
	};

	this.addFieldInputs = function(args) {

		args = args || {};

		var field = args.field;

		var fields = this.element.querySelector('#fields');
		var row = document.createElement('li');
		row.className = 'row';

		row.innerHTML = this.template({ field: field });
		fields.appendChild(row);

		var deleter = row.querySelector(".delete");
		deleter.addEventListener('click', function() {
			row.parentNode.removeChild(row);
		});

		new InputPair({
			source: row.querySelector('input[name=field_title]'),
			target: row.querySelector('input[name=field_name]')
		});

		new InputReflector({
			source: row.querySelector('.inputs .title'),
			target: row.querySelector('.labels .title')
		});

		new InputReflector({
			source: row.querySelector('.inputs .data_type'),
			target: row.querySelector('.labels .data_type')
		});

		new InputReflector({
			source: row.querySelector('.inputs .required'),
			target: row.querySelector('.labels .required'),
			transform: function(is_required) { return Number(is_required) ? 'required' : 'optional' }
		});

		var modal = row.querySelector('.overlay');

		row.querySelector('.settings').addEventListener('click', function(e) {
			modal.classList.add('visible');
		});

		modal.querySelector('button.save_fields').addEventListener('click', function(e) {
			modal.classList.remove('visible');
		});

		modal.querySelector('button.cancel_fields').addEventListener('click', function(e) {
			row.parentNode.removeChild(row);
			modal.classList.remove('visible');
		});

		if (args.show) {
			modal.classList.add('visible');
		}
	};

	this.initialize(args);
}

