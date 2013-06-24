var tamejs = require('tamejs').register();
var Dreamer = require('dreamer');
var express = require('express');
var app = express();

var dreamer = Dreamer.initialize({
	app: app,
	schema: "spec/schema.md",
});

var Entity = require('../lib/entity.tjs');

Entity.load({
	id: 8,
	success: function(entity) {
		console.log("entity", JSON.parse(JSON.stringify(entity)));
	}
});

