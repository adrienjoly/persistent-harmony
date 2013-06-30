# persistent-harmony

A node.js wrapper class to create persistent javascript objects, relying on harmony proxies.

## Installation

	npm install persistent-harmon
	
## Usage

Usage:
	var ph = require("persistent-harmony");
	var obj = new ph.PHProxy({});
	obj.a = "hello";
	console.log(obj["a"]);

To run tests:
	./run   (or)   node --harmony-proxies tests.js
