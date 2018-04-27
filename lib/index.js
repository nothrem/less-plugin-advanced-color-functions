"use strict";

function LessPluginVersion(options) {
	this.options = options;
}

LessPluginVersion.prototype = {
	install: function(less, pluginManager) {
		less.functions.functionRegistry.addMultiple(require("./functions")(less, this.options));
	},
	printUsage: function () {
		console.log('How to use:');
		console.log("less.plugins = [new (require('less-plugin-version'))({ root: 'www' })];");
		console.log(".logo { background-image: versioned('/img/logo.jpg'); }");
		console.log("Output when file './www/img/logo.jpg' exists:");
		console.log(".logo { background-image: url(/img/logo.jpg?1a2b3c4d); }");
		console.log("Output when file './www/img/logo.jpg' does not exist:");
		console.log(".logo { background-image: url(/img/logo.jpg?00000000); }");
	},
	setOptions: function(options) {
		this.options = options;
	},
	minVersion: [2, 5, 0]
};

module.exports = LessPluginVersion;
