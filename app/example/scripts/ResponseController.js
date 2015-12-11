angular
  .module('example')
  .controller('ResponseController', function($scope, supersonic) {

    $scope.events = [];
    $scope.tips = [];
    $scope.itineraryId = null;
    $scope.listLimit = 2;       
    
     // steroids.view.setBackgroundImage("/icons/backgroundTeal.png");
    steroids.view.setBackgroundColor("#66d9ff");
    
    supersonic.ui.views.current.params.onValue(function(itinerary_id){
                                               $scope.itineraryId =itinerary_id.id;
                                               });

    
    supersonic.ui.views.current.whenVisible(function() {
        supersonic.logger.log("f1 called");
        
        var Itenary = Parse.Object.extend("Itinerary");
        var query = new Parse.Query(Itenary);
        //var iternaryIdstr="1AtJcYGjFs";
        
        query.equalTo("objectId", $scope.itineraryId);
        query.include("events");
        //query.include("events.suggestions");
        //query.include("events.suggestions.tips"); 
        query.find({
            success: function(itinerary) {
            supersonic.logger.log("iternary queried successfully");   
                
                $scope.itenary = itinerary[0];
                
                 var eventsObj=itinerary[0].get("events")
                     
                  $scope.events = eventsObj.sort(function(a,b){
                     a = new Date(a.get('time'));
                     b = new Date(b.get('time')); 
                      return a<b ? -1 : a>b ? 1 : 0;
                 });
                        
     },
        error: function(error) {
        supersonic.logger.log("query failed");
        }  
        });
        
        var tipq = new Parse.Query("Tip");
        tipq.equalTo("authorId",Parse.User.current().id);
        tipq.equalTo("author",Parse.User.current());
        tipq.equalTo("itineraryId",$scope.itineraryId);
        tipq.equalTo("published",false); 
        tipq.find({
            success: function(tipsArr){
                $scope.tips = tipsArr;
            },
            error: function(err){
            }
        });

    });
    
    $scope.giveResponse = function(eventId) {
        var view = new supersonic.ui.View("example#advisorinput");
        supersonic.ui.layers.push(view, {
            params: {
                    eventid: eventId,
                    itinid: $scope.itineraryId
                }
        });
        
    }

    $scope.saveSuggestion = function  (suggestionId) {
      var Suggestions = Parse.Object.extend("Suggestions");
      var suggestions = new Suggestions();
      $scope.sug_isSaved=false;
      
      
      var query = new Parse.Query(Suggestions);

      query.equalTo("objectId", suggestionId);

      query.find({
            success: function(sug) {
            supersonic.logger.log("found the sug"); 
            supersonic.logger.log(sug); 

            sug[0].set("isSaved",true);
            supersonic.logger.log("set isSaved");
            sug[0].save(null, {
              success: function(sug1) {
                supersonic.logger.log("sug saved ");
              }
            });           
      },
        error: function(error) {
        supersonic.logger.log("query fsdfba failed");
        }  
      });  
    }

    $scope.submitResponse = function(){ // set suggestions and tips as published
        var tip_query = new Parse.Query("Tip");
        tip_query.equalTo("authorId",Parse.User.current().id);    
        tip_query.equalTo("itineraryId", $scope.itineraryId);
        tip_query.equalTo("author", Parse.User.current()); 
        tip_query.find({
            success: function(currTips){
                for (var i = 0; i < currTips.length; i++){
                    var currTip = currTips[i];
                    currTip.set("published", true); 
                    currTip.save(); 
                }
            },
            error: function(err){
            }
        });
        
        var sugg_query = new Parse.Query("Suggestions");
        sugg_query.equalTo("authorId",Parse.User.current().id);   
        sugg_query.equalTo("itineraryId", $scope.itineraryId);
        sugg_query.equalTo("author", Parse.User.current()); 
        sugg_query.find({
            success: function(currSuggs){
                for (var i = 0; i < currSuggs.length; i++){
                    var currSugg = currSuggs[i];
                    currSugg.set("published", true); 
                    currSugg.save(); 
                }
            },
            error: function(err){
            }
        }); 
        
          var options = {
                  buttonLabel: "Close"
        };

        supersonic.ui.dialog.alert("Response successfully submitted!", options).then(function() {
            
            //var view = new supersonic.ui.View("example#feed");
                supersonic.ui.layers.pop();
                });
    }
});
