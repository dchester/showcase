var showcase = require('../index');

var config = {
	database: {
		dialect: "sqlite",
		storage: "/var/tmp/showcase.sqlite",
	},
	files: {
		tmp_path: "/var/tmp",
		storage_path: "/var/tmp",
	}
};

showcase.initialize(config);
showcase.run();

