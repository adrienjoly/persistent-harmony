console.log("persistent-harmony tests with MongoDB");

//var ph = require("./persistent-harmony.js");
var MongoPH = require("./MongoPH.js").MongoPH;

new MongoPH({}, function(mongoPH){
	console.log("MongoPH: ready!");
	var mymap = mongoPH.wrap("mymap");
	console.log("myapp", mymap);
	mymap.first = "coucou";
	console.log("myapp.first", mymap.first);
	delete mymap.first;
	console.log("myapp.first", mymap.first);
	console.log("myapp", mymap);
	setInterval(function(){
		// for some reason, this call requires getOwnPropertyDescriptor to be set
		console.log("myapp", mymap);
	}, 2000);
});
