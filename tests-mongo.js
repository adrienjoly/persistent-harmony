console.log("persistent-harmony tests with MongoDB");

var MongoPH = require("./MongoPH.js").MongoPH;

new MongoPH({}).whenReady(function(mongoPH){
	console.log("MongoPH: ready!");
	var mymap = mongoPH.wrap("mymap");
	console.log("myapp", mymap);
	mymap.first = "coucou";
	console.log("myapp.first", mymap.first);
	delete mymap.first;
	console.log("myapp.first", mymap.first);
	console.log("myapp", mymap);
});
/*
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
	["***end of tests ***", function(cb){
		cb(true);
	}]
];

(function next(){
	var test = tests.shift();
	if (test) {
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
*/