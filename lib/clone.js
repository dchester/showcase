module.exports = function(obj) {
	try {
		var clone = JSON.parse(JSON.stringify(obj));
		return clone;
	} catch(e) {
		console.warn("couldn't clone object: " + e.message);
		return null;
	}
}
