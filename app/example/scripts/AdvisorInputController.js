angular
  .module('example')
  .controller('AdvisorInputController', function($scope, supersonic) {

    
    $scope.eventId = null;
    $scope.curr_event =null;
    $scope.advisor={};
    $scope.suggestions=[];
    $scope.inputInfo = {};
    $scope.responded = {value:false};

    
     // steroids.view.setBackgroundImage("/icons/backgroundTeal.png");
    steroids.view.setBackgroundColor("#66d9ff");
          
    supersonic.ui.views.current.params.onValue(function(sentvals){
        $scope.eventId =sentvals.eventid;
        $scope.itineraryId = sentvals.itinid;                                
    });

    
    supersonic.ui.views.current.whenVisible(function() {
        
            supersonic.ui.navigationBar.update({
      title: 'Give a Suggestion and Tip' ,
      overrideBackButton: true
    }).then(supersonic.ui.navigationBar.show());
        
        // querying to get currentEvent obj and that event's existing suggestions 
        var Event = Parse.Object.extend("Events");
        var query = new Parse.Query(Event);
        
        query.equalTo("objectId", $scope.eventId);
        query.include("author");
        query.include("suggestions");
        //query.include("events.suggestions.tips"); 
        query.find({
            success: function(q_events) {
            
                $scope.curr_event = q_events[0];
                $scope.allResponders = q_events[0].get("responders"); 
                
                var curr_suggs = q_events[0].get('suggestions'); 
                
            for (var i = 0; i < curr_suggs.length; i++){ // get all existing suggestions
                var sug = curr_suggs[i];
		     	curr_sugg = {};
		     	curr_sugg.title = sug.get('title');
		     	curr_sugg.id = i;
		     	curr_sugg.objectid = sug.id;
		     	$scope.suggestions.push(curr_sugg);
		     }
            
                $scope.selected = null; 

        if ($scope.allResponders.indexOf(Parse.User.current().id) > -1) { 
            $scope.responded.value = true; 
         
            var squery = new  Parse.Query("Suggestions");
            squery.equalTo("authors", Parse.User.current().id);
            squery.equalTo("itineraryId",$scope.itineraryId); 
            squery.equalTo("eventid",$scope.eventId);
            squery.find({
                success: function(results){
                    for (var k = 0; k < $scope.suggestions.length;k++){
                        var s = $scope.suggestions[k];
                        if (s.objectid == results[0].id){
                            $scope.selected = $scope.suggestions[s.id];
                            $scope.responded.sugg = s.objectid;
                        }
                    }
                    
                  
                },
                error: function(err){
                }
            });  
            
            var tquery = new Parse.Query("Tip");
            tquery.equalTo("authorId", Parse.User.current().id);  
            tquery.equalTo("itineraryId",$scope.itineraryId); 
            tquery.equalTo("eventid",$scope.eventId);
            tquery.find({
                success: function(result){
                    
                 //   $scope.advisor.tip ="got here";
                  $scope.advisor.tip = result[0].get("title"); 
                    $scope.responded.tip = result[0].id;
                    supersonic.logger.log("tip"+angular.toJson(result)); 
                },
                error: function(err){
                }
            }); 
              
        }  
  //  }
              
     },
        error: function(error) {
        supersonic.logger.log("query failed");
        }  
        });

    }); // end of whenVisible
    
    $scope.changeSugg = function() {
       $scope.responded.value = false;
        $scope.$apply();
        supersonic.logger.log("CLICKED!!!!!!!!"+$scope.responded.value); 
       
    }

    $scope.saveResponse = function  () {  
        
    //    if (tip_arr.length == 0){ // if the local has not yet responded to this event yet 
        if ($scope.responded.value == false){
        
          var Suggestions = Parse.Object.extend("Suggestions");
          var suggestion = new Suggestions();

          var Tip = Parse.Object.extend("Tip");
          var tip = new Tip();

          tip.set("title", $scope.advisor.tip);
          tip.set("authorId",Parse.User.current().id); 
          tip.set("published",false); 
          tip.set("itineraryId", $scope.itineraryId);
          tip.set("eventid",$scope.eventId); 
          tip.set("author",Parse.User.current());


          tip.save(null, {
                success: function(q_tip) {
                  supersonic.logger.log("saved tip");   

                },
                error: function(q_tip, error) {

                }
          }); 

     if ($scope.advisor.suggestion){   // If user entered a new suggestion 
         supersonic.logger.log("new suggestion input"); 
             suggestion.set("title", $scope.advisor.suggestion);
             suggestion.set("isSaved", false);
             suggestion.addUnique("tips",tip);
             suggestion.set("published",false); 
             suggestion.set("itineraryId", $scope.itineraryId); 
             suggestion.set("eventid",$scope.eventId);
             suggestion.set("author",Parse.User.current());
            suggestion.set("authorId",Parse.User.current().id);
            suggestion.addUnique("authors",Parse.User.current().id);


              suggestion.save(null, {
                    success: function(q_sug) {
                        supersonic.logger.log("saved suggestion");  
                        
                        var eventsquery = new Parse.Query("Events");
                        eventsquery.equalTo("objectId", $scope.eventId);
                        eventsquery.find({
                            success: function(q_events) {
                                q_events[0].addUnique("suggestions",q_sug);
                                q_events[0].addUnique("responders",Parse.User.current().id);
                                q_events[0].save();    
                         },
                            error: function(error) {
                            supersonic.logger.log("query q_events failed");
                            }  
                            });  
                    },
                    error: function(q_sug, error) {

                    }
              });
       }
        else {        // saving tip to existing suggestions
            var query = new Parse.Query("Suggestions");
            var suggindex = $scope.selected.id;
            var objid = $scope.suggestions[suggindex].objectid;
            query.equalTo("objectId", objid);
            query.find({
                success: function(result){
                    result[0].addUnique("tips",tip);
                    result[0].save(); 
                },
                error: function(err){
                }
            });
        } 
  //  }
        }
        else {    // updating a previous response --------------------- only supports tips right now and 'new suggestion' replace user's suggestion
            
            var suggestion_query = new Parse.Query("Suggestions");
            suggestion_query.equalTo("objectId",$scope.responded.sugg);
            suggestion_query.find({
                success: function(s_r){
                    if (s_r.length > 0) {
                    if (s_r[0].get("authorId") == Parse.User.current().id){
                        s_r[0].set("title", $scope.advisor.suggestion);
                        s_r[0].save();
                    }
                    }
                },
                error: function(err){
                }
            });  
                   
            var tip_query = new Parse.Query("Tip");
            tip_query.equalTo("objectId",$scope.responded.tip);
            tip_query.find({
                success: function(tip_r){
                    if (tip_r.length > 0){
                    tip_r[0].set("title",$scope.advisor.tip);
                    tip_r[0].save();
                    }
                },
                error: function(err){
                }
            });  
        }
        
        var options = {
                  buttonLabel: "Close"
        };
        if ($scope.responded == false){
        supersonic.ui.dialog.alert("Response successfully updated!", options).then(function() {
            supersonic.ui.layers.pop();
                });
        }
        else{
            supersonic.ui.dialog.alert("Response successfully saved!", options).then(function() {
            supersonic.ui.layers.pop();
                });
        }
    } // end of saveResponse 
    
    $scope.back = function(){
        supersonic.ui.layers.pop();
    }

});
