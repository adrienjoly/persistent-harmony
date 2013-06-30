/**
 * persistent-harmony proxy
 * author: adrien joly
 **/

try{
	Proxy;
}
catch(e) {
	console.error("[persistent-harmony] ERROR: Proxy class not found => please enable node's --harmony-proxies flag");
}

var ph = require("./lib/persistent-harmony.js");
exports.PHProxy = ph.PHProxy;
exports.LoggedPH = ph.LoggedPH;

try {
	var mongo = require("./lib/MongoPH.js");
	exports.MongoConnector = mongo.MongoConnector;
	exports.MongoPH = mongo.MongoPH;
}
catch (e) {
	console.log("[persistent-harmony] MongoDB module not found => skipping mongo connector");
}