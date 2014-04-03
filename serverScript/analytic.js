module.exports = function()
{
    var constants = require('./constants.js');
    var fileAdmin = require('./fileAdmin.js');
    var cacheAdmin = require('./cacheAdmin.js');
    
    function compare(a, b)
    {
      return a.date > b.date ? -1 : 1;
    }

    function initPersonalData()
    {
        var data = fileAdmin.readPersonalFile();
        var originalData = new Array();
        var recordStrings = data.split("\n");
        for(var i = 1; i < recordStrings.length; i++){
          if(recordStrings[i] == ""){
            continue;
          }
          var temp = recordStrings[i].split("\t");
          var record = {
            category : temp[0],
            date : temp[1],
            amount : parseFloat(temp[2])
          };
          originalData.push(record);
        }

        originalData = originalData.sort(compare);
        cacheAdmin.del(constants.personalDataKey);
        cacheAdmin.put(constants.personalDataKey, originalData);
    }

    function initCompanyData()
    {
        var data = fileAdmin.readCompanyFile();
        var originalData = new Array();
        var recordStrings = data.split("\n");
        for(var i = 1; i < recordStrings.length; i++){
          if(recordStrings[i] == ""){
            continue;
          }
          var temp = recordStrings[i].split("\t");
          var record = {
            category : temp[0],
            date : temp[1],
            amount : parseFloat(temp[2]),
            GST : isNaN(parseFloat(temp[3])) ? 0 : parseFloat(temp[3]),
          };
          originalData.push(record);
        }

        originalData = originalData.sort(function(a,b){return compare(a,b);});
        cacheAdmin.del(constants.companyDataKey);
        cacheAdmin.put(constants.companyDataKey, originalData);
    }

    function getCachedData(isPersonal){
        var originalData;
        if(isPersonal){
          originalData = cacheAdmin.get(constants.personalDataKey);
          if(originalData == null){
            initPersonalData();
          }
          return cacheAdmin.get(constants.personalDataKey);
        }
        else{
          originalData = cacheAdmin.get(constants.companyDataKey);
          if(originalData == null){
            initCompanyData();
          }
          return cacheAdmin.get(constants.companyDataKey);
        }
    }

    function getAllCategories(isPersonal, isIncome){
        var originalData = getCachedData(isPersonal);
        var arr = new Array();
        
        originalData.forEach(function(item){
          var temp = item.category;
          if(isIncome && item.amount > 0){
            if(arr.indexOf(temp) === -1){
              arr.push(temp);
            }
          }
          if(!isIncome && item.amount < 0){
            if(arr.indexOf(temp) === -1){
              arr.push(temp);
            }
          }
        });
        return arr;
    }

    function isCategory(input, category){
      return input == category || input.indexOf(category + "-") == 0;
    }

    function getRootCategories(isPersonal, isIncome){
        var originalData = getCachedData(isPersonal);
        var arr = new Array();
        
        originalData.forEach(function(item){
          var temp = item.category.split("-")[0];
          if(isIncome && item.amount > 0){
            if(arr.indexOf(temp) === -1){
              arr.push(temp);
            }
          }
          if(!isIncome && item.amount < 0){
            if(arr.indexOf(temp) === -1){
              arr.push(temp);
            }
          }
        });
        return arr;
    }

    /*
    data = {
      personalIncomeCategories: [{
        name: '',
        subCategories: [],
      }
      ],
      personalOutcomeCategories: ...,
      allData: [
          {
            category: '',
            date: '',
            amount: '',
          }
        ]
    }
    */

    function getCategories(isPersonal, isIncome){
      var allCategories = getAllCategories(isPersonal, isIncome);
      var rootCategories = getRootCategories(isPersonal, isIncome);

      var categories = new Array();
      rootCategories.forEach(function(c){
        var subCategories = new Array();
        allCategories.forEach(function(subC){
          if(isCategory(subC, c) && subC != c){
            subCategories.push(subC);
          }
        });
        var t = {
          name: c,
          subCategories: subCategories,
        }
        categories.push(t);
      });

      return categories;
    }

    function getAllPersonalData(){
        return {
          personalIncomeCategories: getCategories(true, true),
          personalOutcomeCategories: getCategories(true, false),
          allData: cacheAdmin.get(constants.personalDataKey),
        };
    }

    function getAllCompanyData(){
        return {
          companyIncomeCategories: getCategories(false, true),
          companyOutcomeCategories: getCategories(false, false),
          allData: cacheAdmin.get(constants.companyDataKey),
        };
    }

    function getTestData(input){
      var result = new Array();
      if(!input.payload || !input instanceof Array){
        return error();
      }

      input.payload.forEach(function(item){
        var image = null;
        
        if(item.image && item.image.showImage){
          image = item.image.showImage;
        }
        
        var slug = "";
        if(item.slug && (typeof item.slug == 'string')){
          slug = item.slug;
        }
        
        var title = "";
        if(item.title && (typeof item.title == 'string')){
          title = item.title;
        }
        
        var count = 0;
        if(item.episodeCount && (typeof item.episodeCount == 'number')){
          count = item.episodeCount;
        }

        if(item.drm && count > 0){
          var show = {
            image: image,
            slug: slug,
            title: title
          }
          result.push(show);
        }
      });
      
      return {
        response: result
      };
    }

    function error(){
      return {"error": "Could not decode request: JSON parsing failed"};
    }

    return {
        getAllPersonalData: getAllPersonalData,
        getAllCompanyData: getAllCompanyData,
        getTestData: getTestData
    };
}();