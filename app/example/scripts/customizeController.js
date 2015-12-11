angular
  .module('example')
  .controller('customizeController', function($scope, supersonic) {

    $scope.events = [];
    $scope.itineraryId = null;
    
    // steroids.view.setBackgroundImage("/icons/backgroundTeal.png");
    steroids.view.setBackgroundColor("#5cd6d6");
              
    supersonic.ui.views.current.params.onValue(function(itinerary_id){
                                               $scope.itineraryId =itinerary_id.id;
                                               });
                                               
    $scope.updateEvent = function (eventId,isPublished){
        if (isPublished == false){
        var view = new supersonic.ui.View("example#updateEvent");       
                supersonic.ui.layers.push(view, {
                    params: {
                        id: eventId
                    }
                   });
        }
    }

    $scope.submitRequest = function() {
        var eventsQ = new Parse.Query("Events");
        eventsQ.equalTo("author",Parse.User.current());
        eventsQ.equalTo("itineraryId",$scope.itineraryId);
        eventsQ.find({
            success: function(allevents){
                for (var i = 0; i < allevents.length;i++){
                    var ev = allevents[i];
                    ev.set("published",true);
                    ev.save(); 
                }
            },
            error: function(errr){
            }
        });
         
        var queryit = new Parse.Query("Itinerary");
        queryit.equalTo("objectId", $scope.itineraryId); 
        queryit.find({
            success: function(itinerare) {

                itinerare[0].set("published",true);  
                itinerare[0].save(); 
                
                var options = {
                  buttonLabel: "Close"
                };

                supersonic.ui.dialog.alert("Itinerary successfully submitted!", options).then(function() {
                  window.open('getting-started.html','_self');
                //supersonic.ui.layers.pop();
                });
                
            },
            error: function(err) {
            }
        });

    }
    
    supersonic.ui.views.current.whenVisible(function() {
        
        supersonic.logger.log("f1 called");
        
        var Itenary = Parse.Object.extend("Itinerary");
        var query = new Parse.Query(Itenary);
        
        query.equalTo("objectId", $scope.itineraryId);
        query.include("events");
        query.include("events.suggestions");
        query.include("events.chosen");
       // query.include("events.suggestions.tips"); 
       // query.include("events.suggestions.tips.author"); 
        query.find({
            success: function(itinerary) {
            supersonic.logger.log("queried successfully");   
                
                $scope.itenary = itinerary[0];
                 var eventsObj=itinerary[0].get("events")
                     
                  $scope.events = eventsObj.sort(function(a,b){
                     a = new Date(a.get('time'));
                     b = new Date(b.get('time')); 
                      return a<b ? -1 : a>b ? 1 : 0;
                 });
  
                for (var i =0;i< $scope.events.length;i++){
                
                    $scope.events[i].set('listLimit',2).save();
                }     
     },
        error: function(error) {
        supersonic.logger.log("query failed");
        }  
        });

    }); 

    $scope.saveSuggestion = function  (suggestionId,eventId) {
      var Suggestions = Parse.Object.extend("Suggestions");
      var suggestions = new Suggestions();
      
      var query = new Parse.Query(Suggestions);

      query.equalTo("objectId", suggestionId);

      query.find({
            success: function(sug) {

            sug[0].set("isSaved",true);
            sug[0].save(null, {
              success: function(sug1) {
                
                  
                var query = new Parse.Query("Events");
                  query.equalTo("objectId", eventId);
                  query.find({
                        success: function(ev) {
                        ev[0].set("isChosen",true);
                        ev[0].set("chosen", sug1);
                        ev[0].save();
                        }
                    });              
                },
                error: function(error) {
                }
                });                   
      },
        error: function(error) {
        supersonic.logger.log("query fsdfba failed");
        }  
      });
    }
    
    $scope.showAll = function (eventId) {
        var query = new Parse.Query("Events");
        query.equalTo("objectId", eventId);
        query.find({
        success: function(ev) {
                        ev[0].set("isChosen",false);
                        ev[0].save();
                        }
                    }); 
    };
    
    $scope.clearSuggestion = function (suggestionId) {
      var Suggestions = Parse.Object.extend("Suggestions");
      var suggestions = new Suggestions();
      
      
      var query = new Parse.Query(Suggestions);

      query.equalTo("objectId", suggestionId);

      query.find({
            success: function(sug) {
        //    supersonic.logger.log("found the sug"); 
          //  supersonic.logger.log(sug); 

            sug[0].set("isSaved",false);
        //    supersonic.logger.log("set isSaved");
            sug[0].save(null, {
              success: function(sug1) {
          //      supersonic.logger.log("sug saved ");
              }
            });                
      },
        error: function(error) {
        supersonic.logger.log("query fsdfba failed");
        }  
      });
    }
    
        $scope.showMore = function  (eventId) {
      var Events = Parse.Object.extend("Events");
      var event = new Events();
      
      
      var query = new Parse.Query(Events);

      query.equalTo("objectId", eventId);

      query.find({
            success: function(sug) {
            sug[0].set("listLimit",sug[0].get('suggestions').length);

            sug[0].save(null, {
              success: function(sug1) {
          //      supersonic.logger.log("sug saved ");
              }
            });                
      },
        error: function(error) {
        supersonic.logger.log("query fsdfba failed");
        }  
      });
    }
        
    $scope.showLess = function  (eventId) {
      var Events = Parse.Object.extend("Events");
      var event = new Events();
      
      
      var query = new Parse.Query(Events);

      query.equalTo("objectId", eventId);

      query.find({
            success: function(sug) {
            sug[0].set("listLimit",2);

            sug[0].save(null, {
              success: function(sug1) {
          //      supersonic.logger.log("sug saved ");
              }
            });                
      },
        error: function(error) {
        supersonic.logger.log("query fsdfba failed");
        }  
      });
    }
});
