angular
  .module('common')
  .factory('ItenaryParse', function(Parse, ParseUtils) {
    var request = Parse.Object.extend("Itenary", {
      // Instance methods
    }, {
      // Class methods
    });

    var properties = ['title','objectId'];
    for (var i = 0; i < properties.length; i++) {
      ParseUtils.addSetterGetter(request, properties[i]);
    }

    return request;
});
