# persistent-harmony

A node.js wrapper class to create persistent javascript objects, relying on harmony proxies.

## Installation

	npm install persistent-harmon
	
## Usage

	var ph = require("persistent-harmony");
	new ph.MongoPH({/* default mongodb args */}, function(mongoPH){
		var mymap = mongoPH.wrap("mymap", {/* empty object instance */}, function(){
			console.log("mymap is now synchronized to its mongodb collection");
			mymap.first = "coucou"; // => stored as {_id:"first", v:"coucou"} in mongodb
			console.log("myapp", mymap);
		});
	});

## Don't forget to add the `--harmony-proxies` when starting node!

	node --harmony-proxies tests.js

