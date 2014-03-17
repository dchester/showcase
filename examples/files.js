var path = require('path');
var mv = require('mv');
var showcase = require('../index');

var config = {
	database: {
		dialect: "sqlite",
		storage: "/var/tmp/showcase.sqlite",
	},
	files: {
		tmp_path: "/var/tmp",
		storage_path: "/var/tmp",
		store: function(callback) {
			var filename = this.name();
			var target_path = path.join(this.storage_path, 'files', filename);
			mv(this.path, target_path, function(err) {
				if (err) throw new Error(err);
				this.path = target_path;
				this.url = '/files/' + filename;
				callback();
			}.bind(this));
		}
	}
};

showcase.initialize(config);
showcase.run();

