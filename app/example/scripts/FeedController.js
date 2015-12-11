angular
  .module('example')
  .controller('FeedController', function($scope, supersonic, ParseService) {
    $scope.ites = null;
    
     // steroids.view.setBackgroundImage("/icons/backgroundTeal.png");
    //steroids.view.setBackgroundColor("#66d9ff");

   // supersonic.ui.views.current.whenVisible(function() {
        
        supersonic.logger.log("feedcontroller");
	var promise = ParseService.find();
	promise.then(
	function(results){
		$scope.ites = results; 
		supersonic.logger.log($scope.ites); 
	},
	function(error){
	alert("Error: " + error.code + " " + error.message)
	$scope.error = error;
	});
        
       /* var query = new Parse.Query("Itinerary");
        query.notEqualTo("author", Parse.User.current());
        query.equalTo("published",true); 
        query.include("author");
        query.find({
            success: function (results) {
                supersonic.logger.log("feedcontroller successful query");
            $scope.ites = results;  
    },
    error: function (error) {
        alert("Error: " + error.code + " " + error.message);
    }
        
    });*/
        
        
 //});
    
});
