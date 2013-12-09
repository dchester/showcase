Showcase.Collection = function(args) {

	this.initialize = function(args) {

		this.element = args.element;
		this.element.querySelector('#new_field')
			.addEventListener('click', function() {
				this.addFieldInputs({ show: true });
			}.bind(this));

		var source = this.element.querySelector("#row_template").innerHTML;
		this.template = swig.compile(source);

		this.element.addEventListener('submit', function(e) {
			if (!this.element.querySelector("input[name=field_title]")) {
				e.preventDefault();
				this.element.classList.add('error-no-fields');
			}
		}.bind(this));
	};

	this.addFieldInputs = function(args) {

		args = args || {};

		var field = args.field;

		this.element.classList.remove('error-no-fields');

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

		row.querySelector('.title').addEventListener('click', function(e) {
			modal.classList.add('visible');
		});

		row.querySelector('.settings').addEventListener('click', function(e) {
			modal.classList.add('visible');
		});

		modal.querySelector('button.save_fields').addEventListener('click', function(e) {
			modal.classList.remove('visible');
		});

		modal.querySelector('button.cancel_fields').addEventListener('click', function(e) {
			var field_id_input = row.querySelector('input[name=field_id]');
			if (!(field_id_input && field_id_input.value)) {
				row.parentNode.removeChild(row);
			}
			modal.classList.remove('visible');
		});

		if (args.show) {
			modal.classList.add('visible');
		}

	};

	this.initialize(args);
}

