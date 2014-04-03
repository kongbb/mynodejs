module.exports = function()
{
    var myCache = require("memory-cache");
	//var myCache = new NodeCache({stdTTL: 100, checkperiod: 120});

    function put(key, data){
		myCache.put(key, data, 1000);
	};

	function get(key){
		return myCache.get( key);
	};

	function del(key){
		myCache.del( key);
	}

    return {
        put: put,
        get: get,
        del: del
    };
}();