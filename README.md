# persistent-harmony

A node.js wrapper class to create persistent javascript objects, relying on harmony proxies.

## Rationale / use case

I developed this module because:
- I was generating big hashmaps / associative arrays in node.js, indexing data computed from my MongoDB database
- I wanted to store the resulting javascript objects to my database so that I could load them back to memory, instead of re-computing the indices at every restart of my node.js app.
- I didn't want to update and query these indices using asynchronous mongodb calls, but use native javascript structures instead (sychronous and fast).

## Installation

	npm install persistent-harmony
	
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

