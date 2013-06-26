console.log("persistent-harmony tests");

var module = require("./persistent-harmony.js");
var PH = module.PHProxy;

var tests = [
	["get field", function(cb){
		var o = {a:1};
		var proxy = PH(o);
		cb(o.a === proxy.a);
	}],
	["set field", function(cb){
		var o = {a:1};
		var proxy = PH(o);
		proxy.a = 2;
		cb(o.a === 2 && 2 === proxy.a);
	}],
	["delete field", function(cb){
		var o = {a:1};
		var proxy = PH(o);
		delete proxy.a;
		cb(proxy.a === undefined && o.a === undefined);
	}],
	["Object.keys()", function(cb){
		var o = {a:1};
		var proxy = PH(o);
		var k1 = Object.keys(o), k2 = Object.keys(proxy);
		cb(k1.length === k2.length && k1[0] === k2[0]);
	}],
	["for(i in proxy)", function(cb){
		var o = {a:1};
		var proxy = PH(o);
		var fields = [];
		for (var i in proxy)
			fields.push(i);
		cb(fields.length === 1 && fields[0] === "a");
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