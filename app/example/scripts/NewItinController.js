angular
  .module('example')
  .controller('NewItinController', function($scope,supersonic) {

    supersonic.ui.views.current.params.onValue( function (itineraryId) {
        supersonic.logger.log("newItinerary"); 
        $scope.itinId = itineraryId.id; 

    });
    
    supersonic.ui.views.current.whenVisible( function() {
        var itinerary = Parse.Object.extend("Itinerary"); 
        var query = new Parse.Query(itinerary); 
        query.equalTo("objectId",$scope.itinId);
        query.include("events"); 
        query.find({
                success: function(itin){
                   $scope.name = itin[0].get("title");  
                   $scope.events = itin[0].get("events"); 
        },
                error: function(error){
                 supersonic.logger.log(error); 
                  
                }
            }); 
    });

});
