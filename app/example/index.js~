angular.module('example', [
  // Declare here all AngularJS dependencies that are shared by the example module.
  'supersonic'
])
.service("ParseService", function($q, supersonic){
this.find = function()
{
	var deferred= $q.defer();
	
	var query = new Parse.Query("Itinerary");
        query.notEqualTo("author", Parse.User.current());
        query.equalTo("published",true); 
        query.include("author");
        query.find({
            success: function (results) {
                supersonic.logger.log("feedcontroller successful query");
		deferred.resolve(results);
            
    },
    error: function (error) {
        alert("Error: " + error.code + " " + error.message);
	deferred.reject(error);
    }
});
	return deferred.promise;
}
});
