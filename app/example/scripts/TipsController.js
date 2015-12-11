angular
  .module('example')
  .controller('TipsController', function($scope,supersonic) {
    $scope.suggestion = null; 
    $scope.tips = []; 
    $scope.authors = [];
    
    var suggestionId = null;
    
    // steroids.view.setBackgroundImage("/icons/backgroundTeal.png");
    steroids.view.setBackgroundColor("#5cd6d6");
    
    supersonic.ui.views.current.params.onValue( function (passedSuggestion) {
        suggestionId = passedSuggestion.id; 
    });
    
        supersonic.ui.views.current.whenVisible(function() {
        var Suggestion = Parse.Object.extend("Suggestions"); 
        var query = new Parse.Query(Suggestion); 
         query.equalTo("objectId",suggestionId);
         query.include("tips"); 
         query.include("tips.author"); 
            query.find({
                success: function(suggestion){
                    supersonic.logger.log(suggestion); 
                   $scope.suggestion = suggestion[0]; 
                   $scope.tips = suggestion[0].get("tips"); 
                    
                },
                error: function(error){
                 supersonic.logger.log(error); 
                  
                }
            }); 
        }); 

});
