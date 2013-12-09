Showcase.namespace("Showcase.Form.Input");

Showcase.Form.Input.Pair = function(args) {

	this.source = args.source;
	this.target = args.target;

	this.transform = args.transform || function(str) {
		return str
			.toLowerCase()
			.replace(/(^\s+|\s+$)/g, '')
			.replace(/[^a-z]+/g, '_');
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

Showcase.Form.Input.Reflector = function(args) {

	this.source = args.source;
	this.target = args.target;

	this.transform = args.transform || function(value) { return value };

	this.reflect = function(e) { this.target.textContent = this.transform(e.target.value); };

	this.target.innerText = this.transform(this.source.value);

	this.source.addEventListener('change', this.reflect.bind(this));
	this.source.addEventListener('keyup', this.reflect.bind(this));
};


