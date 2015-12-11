angular.module('common', [
  // Declare here all AngularJS dependencies that are shared by all modules.
  'supersonic'
]);

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

angular
  .module('common')
  .factory('Parse', function () {
  	Parse.initialize("s0bBxGQmofmKGs4hKvgURP4nDYQJmNFblcRUXXh2", "GKf1pBCOMnq8GVc9WuEcEuzSBMgnSU5NesxtnqCB","DTUPsbEoPmgeYlIYo7tnMuuWrclCwlTxlmRjjP4a");
    return Parse;
});

angular
  .module('common')
  .factory('ParseUtils', function() {
    var parseUtils = {};
    parseUtils.addSetterGetter = function(module, property) {
      Object.defineProperty(module.prototype, property, {
        get: function() {
          return this.get(property);
        },
        set: function(value) {
          this.set(property, value);
        }
      });
    };

    return parseUtils;
});
