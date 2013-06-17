var Deferrals = function() {
	this.queue = [];
	for (var i = 0; i < arguments.length; i++) {
		this.queue.push(arguments[i]);
	}
	this.run = function() {
		var deferral = this.queue.shift();
		deferral();
	};
};

module.exports = Deferrals;

