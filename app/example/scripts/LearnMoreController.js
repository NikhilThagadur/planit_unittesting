angular
  .module('example')
  .controller('LearnMoreController', function($scope, supersonic) {

    $scope.navbarTitle = "Learn More";

    $scope.mytest=function() {
        //var TestObject = Parse.Object.extend("TestObject");
        //var testObject = new TestObject();
        supersonic.logger.log("hey");

        var ItenaryParse = Parse.Object.extend("Itenary");
        var query = new Parse.Query(ItenaryParse);
        query.descending("title");
        supersonic.logger.log("hey22");
        query.find({
          success: function(results) {
            supersonic.logger.log("hey success");

            // Do something with the returned Parse.Object values
            
          },
          error: function(error) {
            supersonic.logger.log("hey error");

          }
        });




        
    }


  });
