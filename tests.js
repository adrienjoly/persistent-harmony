console.log("persistent-harmony tests");

var module = require("./persistent-harmony.js");
var PH = module.LoggedPH; // ... or module.PHProxy;

var MONGO_ARGS = {};
var mongoPH = null; // to be initialized

var mongoTests = [
	["mongo lazy", function(cb){
		var mymap = mongoPH.wrap("mymap", {}, function(){
			console.log("mymap is now fully loaded from DB")
		});
		console.log("myapp", mymap);
		mymap.first = "coucou";
		console.log("myapp", mymap);
		delete mymap.first;
		console.log("myapp", mymap);
		setTimeout(function(){
			// for some reason, this call requires getOwnPropertyDescriptor to be set
			console.log("myapp", mymap);
			cb(true)
		}, 2000);
	}],
	["mongo async", function(cb){
		var mymap = mongoPH.wrap("mymap", {}, function(){
			// TODO: add one field in db
			console.log("mymap is now fully loaded from DB")
			console.log("myapp", mymap);
			mymap.first = "coucou";
			console.log("myapp", mymap);
			delete mymap.first;
			console.log("myapp", mymap);
			// TODO: chack that field is still there
			cb(true)
		});
	}],
];

var tests = [
	["typeof proxy", function(cb){
		var proxy = PH({});
		cb(typeof proxy === "object");
	}],
	["typeof new proxy", function(cb){
		var proxy = new PH({});
		cb(typeof proxy === "object");
	}],
	["get field", function(cb){
		var o = {a:1}, proxy = PH(o);
		cb(o.a === proxy.a);
	}],
	["set field", function(cb){
		var o = {a:1}, proxy = PH(o);
		proxy.a = 2;
		cb(o.a === 2 && 2 === proxy.a);
	}],
	["++field", function(cb){
		var o = {a:1}, proxy = PH(o);
		++proxy.a;
		cb(o.a === 2 && 2 === proxy.a);
	}],
	["field++", function(cb){
		var o = {a:1}, proxy = PH(o);
		proxy.a++;
		cb(o.a === 2 && 2 === proxy.a);
	}],
	["delete field", function(cb){
		var o = {a:1}, proxy = PH(o);
		delete proxy.a;
		cb(proxy.a === undefined && o.a === undefined);
	}],
	["Object.keys()", function(cb){
		var o = {a:1}, proxy = PH(o);
		var k1 = Object.keys(o), k2 = Object.keys(proxy);
		cb(k1.length === k2.length && k1[0] === k2[0]);
	}],
	["for(i in proxy)", function(cb){
		var o = {a:1}, proxy = PH(o), fields = [];
		for (var i in proxy)
			fields.push(i);
		cb(fields.length === 1 && fields[0] === "a");
	}],
	["sort", function(cb){
		var o = {a:[2,3,1]}, proxy = PH(o);
		proxy.a.sort();
		cb(proxy.a[0] === 1 && proxy.a[2] === 3);
	}],
	["*** loading mongo tests ***", function(cb){
		try {
			new require("./MongoPH.js").MongoPH(MONGO_ARGS, function(instance){
				mongoPH = instance;
				tests = tests.concat(mongoTests);
				cb(true);
			});
		}
		catch (e) {
			console.error(e);
			cb(false)
		}
	}]
];

(function next(){
	var test = tests.shift();
	if (!test)
		console.log("***end of tests ***");
	else {
		function check(r){
			console.log ("\t\t\t\t\t\t\t=>", !!r ? "ok" : "NOK");
			process.nextTick(next);
		}
		console.log(test[0], "...");
		try {
			test[1](check);
		}
		catch (e) {
			console.error("/!\\ exception:", e);
			check();
		}
	}
})();