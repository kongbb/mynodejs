module.exports = function()
{
    var constants = require('./constants.js');
    var options = {encoding: 'utf8'};

    var fs = require('fs');
    var cache = require('./cacheAdmin.js');

    function readPersonalFile()
    {
        var content = fs.readFileSync(constants.personalDataFile, options);
        return content;
    }

    function readCompanyFile()
    {
        var content = fs.readFileSync(constants.companyDataFile, options);
        return content;
    }

    function appendPDataFile(data){
        fs.appendFileSync(constants.personalDataFile, data, options);
        if(cache.get(constants.personalDataKey) != null){
            cache.del(constants.personalDataKey);
        }
    }

    function appendCDataFile(data){
        fs.appendFileSync(constants.companyDataFile, data, options);
        if(cache.get(constants.companyDataKey) != null){
            cache.del(constants.companyDataKey);
        }
    }

    function getJsonp(){
        var content = fs.readFileSync(constants.testJsonp, options);
        return content;
    }

    return {
        readPersonalFile: readPersonalFile,
        readCompanyFile: readCompanyFile,
        appendPDataFile: appendPDataFile,
        appendCDataFile: appendCDataFile,
        getJsonp: getJsonp,
    };
}();