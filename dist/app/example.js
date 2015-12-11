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

angular
  .module('example')
  .controller('GettingStartedController', function($scope, supersonic) {
    $scope.iterneraries = null;
    
    // steroids.view.setBackgroundImage("/icons/backgroundTeal.png");
    steroids.view.setBackgroundColor("#5cd6d6");

        supersonic.ui.views.current.whenVisible(function() {

        var Itenary = Parse.Object.extend("Itinerary");
        var query = new Parse.Query(Itenary);
        
        query.equalTo("author",Parse.User.current());
        query.descending("createdAt");
        query.find({
            success: function (results) {
                supersonic.logger.log(results);
            $scope.iterneraries = results; 
    },
    error: function (error) {
       // alert("Error: " + error.code + " " + error.message);
    }
        
        });
        
        
 });
    
});

angular
  .module('example')
  .controller('GiveRequestsController', function($scope, supersonic) {
    $scope.iterneraries = null;

        supersonic.ui.views.current.whenVisible(function() {

        var Itenary = Parse.Object.extend("Itinerary");
        var query = new Parse.Query(Itenary);
        query.find({
            success: function (results) {
            $scope.iterneraries = results; 
    },
    error: function (error) {
        alert("Error: " + error.code + " " + error.message);
    }
        
        });
        
        
 });
    
});

angular
  .module('example')
  .controller('HomeController', ['$scope' , 'supersonic', '$rootScope', function($scope, supersonic, $rootScope) {
    $scope.scenario = 'Log in';
      
      steroids.view.setBackgroundImage("/icons/backgroundTeal.png");
     // steroids.view.setBackgroundColor("#5cd6d6");
      supersonic.ui.tabs.show();
      
    if($rootScope.currentUser)
    {
      $scope.scenario = 'Logged in';
      var animation = supersonic.ui.animate("curlDown");
      supersonic.ui.initialView.dismiss(animation);
    }
  $scope.signUp = function(form) {
    var user = new Parse.User();
    user.set("email", form.email);
    user.set("username", form.username);
    user.set("password", form.password);
   
    user.signUp(null, {
      success: function(user) {
        $rootScope.currentUser = user;
        $scope.scenario = 'Logged in';
        $scope.$apply(); // Notify AngularJS to sync currentUser
        //var animation = supersonic.ui.animate("curlDown");
        //supersonic.ui.initialView.dismiss(animation);
      },
      error: function(user, error) {
        alert("Unable to sign up:  " + error.code + " " + error.message);
      }
    });    
  };

  $scope.logIn = function(form) {
    Parse.User.logIn(form.username, form.password, {
      success: function(user) {
        $rootScope.currentUser = user;
        $scope.scenario = 'Logged in';
        $scope.$apply();
        //var animation = supersonic.ui.animate("curlDown");
        //supersonic.ui.initialView.dismiss(animation);
      },
      error: function(user, error) {
        alert("Unable to log in: " + error.code + " " + error.message);
      }
    });
  };

  $scope.logOut = function()
    {    
          Parse.User.logOut();
          $rootScope.currentUser = null;
          $scope.scenario = 'Log in';
    }

    $scope.logOutTrigger = function()
    {
      supersonic.ui.initialView.show();
    }

  }]);

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

angular
  .module('example')
  .controller('LoginController', ['$scope' , 'supersonic', '$rootScope', function($scope, supersonic, $rootScope) {
    $scope.scenario = 'Log in';
      
      steroids.view.setBackgroundImage("/icons/backgroundTeal.png");
     // steroids.view.setBackgroundColor("#5cd6d6");
    //  supersonic.ui.tabs.show();
      supersonic.logger.log($scope.scenario);
    if($rootScope.currentUser)
    {
      $scope.scenario = 'Logged in';
      var animation = supersonic.ui.animate("curlDown");
      supersonic.ui.initialView.dismiss(animation);
    }
  $scope.signUp = function(form) {
    var user = new Parse.User();
    user.set("email", form.email);
    user.set("username", form.username);
    user.set("password", form.password);
   
    user.signUp(null, {
      success: function(user) {
        $rootScope.currentUser = user;
        $scope.scenario = 'Logged in';
        $scope.$apply(); // Notify AngularJS to sync currentUser
        //var animation = supersonic.ui.animate("curlDown");
       // supersonic.ui.initialView.dismiss(animation);
      },
      error: function(user, error) {
        alert("Unable to sign up:  " + error.code + " " + error.message);
      }
    });    
  };

  $scope.logIn = function(form) {
    Parse.User.logIn(form.username, form.password, {
      success: function(user) {
        $rootScope.currentUser = user;
        $scope.scenario = 'Logged in';
        $scope.$apply();
        //var animation = supersonic.ui.animate("curlDown");
       // supersonic.ui.initialView.dismiss(animation);
      },
      error: function(user, error) {
        alert("Unable to log in: " + error.code + " " + error.message);
      }
    });
  };

  $scope.logOut = function()
    {    
          Parse.User.logOut();
          $rootScope.currentUser = null;
          $scope.scenario = 'Log in';
    }

    $scope.logOutTrigger = function()
    {
      supersonic.ui.initialView.show();
    }

  }]);

angular
  .module('example')
  .controller('NewEventController', function($scope,supersonic) {
    $scope.missingTime = false; 
    $scope.event={};
$scope.ideas=[{title: "Accommodation", id: 0},
{title: "Adventure sports", id: 1},
{title: "Amusement Park", id: 2},
{title: "Antiques Shops", id: 3},
{title: "Aquariums", id: 4},
{title: "Architectural Sites", id: 5},
{title: "Art Galleries", id: 6},
{title: "Bars, Pubs & Clubs", id: 7},
{title: "Beaches", id: 8},
{title: "Breakfast", id: 9},
{title: "Breweries", id: 10},
{title: "Broadway", id: 11},
{title: "Brunch", id: 12},
{title: "Cafes", id: 13},
{title: "Cinemas", id: 14},
{title: "Comedy Clubs", id: 15},
{title: "Dinner", id: 16},
{title: "Flea & Street Market", id: 17},
{title: "Hiking", id: 18},
{title: "Historical Sites", id: 19},
{title: "Jazz Bars", id: 20},
{title: "Lunch", id: 21},
{title: "Museums", id: 22},
{title: "National Parks", id: 23},
{title: "Religious Sites", id: 24},
{title: "Safari", id: 25},
{title: "Scenic Drives", id: 26},
{title: "Scuba & Snorkeling", id: 27},
{title: "Shopping", id: 28},
{title: "Souvenirs", id: 29},
{title: "Spas", id: 30},
{title: "Street Foods", id: 31},
{title: "Supper", id: 32},
{title: "Tours", id: 33},
{title: "Wineries", id: 34},
{title: "Zoo", id: 35}
 ];
    $scope.selected = $scope.ideas[0];
    
        supersonic.ui.views.current.whenVisible(function() {
        supersonic.ui.navigationBar.update({
      title: 'New Event' ,
      overrideBackButton: true
    }).then(supersonic.ui.navigationBar.show());
    
      })
        
     // steroids.view.setBackgroundImage("/icons/backgroundTeal.png");
    steroids.view.setBackgroundColor("#5cd6d6");
    
    supersonic.ui.views.current.params.onValue( function (itineraryId) {
        $scope.itinerary = itineraryId.id; 
    });
    
    $scope.saveEvent = function(){
        
        var dbevent = Parse.Object.extend("Events"); 
        var newEvent = new dbevent(); 
        if ($scope.event.title){
            newEvent.set("title", $scope.event.title);
        }
        else{
            var eventindex = $scope.selected.id;
            var eventobj = $scope.ideas[eventindex];
            newEvent.set("title",eventobj.title); 
        }
        newEvent.set("time", $scope.event.time); 
        newEvent.set("listLimit",2); 
        newEvent.set("additional",$scope.event.additional); 
        newEvent.set("suggestions",[]);
        newEvent.set("author", Parse.User.current());
        newEvent.set("published",false);
        newEvent.set("responders",[]); 
        newEvent.set("isChosen",false);  
        newEvent.set("itineraryId",$scope.itinerary);
        
        
        newEvent.save(null, {
            success: function(savedEvent){   // event object

                var query = new Parse.Query("Itinerary"); 
                query.equalTo("objectId",$scope.itinerary);
                query.find({
                    success: function(savedItin){
                        savedItin[0].addUnique("events",savedEvent);
                        savedItin[0].save(); 
                        
                //var view = new supersonic.ui.View("example#customize");       
                //supersonic.ui.layers.push(view, {
                    //params: {
                    //    id: $scope.itinerary
                  //  }
                //   });
                   supersonic.ui.layers.pop();
                    },
                    error: function(error){
                     supersonic.logger.log(error); 

                    }
            }); 
            },
            error: function(error){
            }
        }); 
    }
    
    $scope.submitEvent = function(){
         
         if (!$scope.event.time){
              $scope.missingTime = true; 
         }
         else{
             $scope.saveEvent(); 
         }
    } 
    
    $scope.back = function(){
        supersonic.ui.layers.pop();
    }
});

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

angular
  .module('example')
  .controller('TemplateController', function($scope, supersonic) {
   $scope.navbarTitle = "Create Itinerary"; 
   $scope.template = {};
   $scope.missingCity = false;
    
    //steroids.view.setBackgroundImage("/icons/backgroundTeal.png");
    steroids.view.setBackgroundColor("#5cd6d6");
    
    supersonic.ui.views.current.whenVisible(function() {
        supersonic.ui.navigationBar.update({
      title: $scope.navbarTitle ,
      overrideBackButton: true
    }).then(supersonic.ui.navigationBar.show());
    
      })
    
    $scope.submitForm = function(){
        if (!$scope.template.city){
            $scope.missingCity = true;
        }
        else{
            $scope.saveForm(); 
        }
    }
    
    $scope.saveForm = function(){
        var Itenerary = Parse.Object.extend("Itinerary"); 
        var itenerary = new Itenerary(); 
        
        itenerary.set("title",$scope.template.city); 
        itenerary.set("author", Parse.User.current());
        itenerary.set("events",[]); 
        itenerary.set("published",false); 
        
        itenerary.save(null, {
            success: function(itenerary) {
                supersonic.logger.log("itenerary successfully saved!!!!");
         supersonic.ui.layers.pop();
                        
            },
            error: function(itenerary, error) {
                supersonic.logger.log("itenerary failed to save");  
                supersonic.logger.log(error); 
            }
        }); 
    }
    
    $scope.goBack = function(){
        supersonic.ui.layers.pop();
    }

  });

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

angular
  .module('example')
  .controller('UpdateEventController', function($scope,supersonic) {
     $scope.event={};
    $scope.missingTime = false;
    steroids.view.setBackgroundColor("#5cd6d6");
      supersonic.ui.views.current.params.onValue( function (eventId) {
        $scope.eventid = eventId.id; 
    });
    
     supersonic.ui.views.current.whenVisible(function() {
         
                 supersonic.ui.navigationBar.update({
      title: 'Update Event' ,
      overrideBackButton: true
    }).then(supersonic.ui.navigationBar.show());
         
         
         var eventsQ = new Parse.Query("Events");
        eventsQ.equalTo("objectId",$scope.eventid);
        eventsQ.find({
            success: function(thatevent){
   
                $scope.event.title=thatevent[0].get('title'); 
                var a = new Date(thatevent[0].get('time'));
                var timestring = a.getHours() + ":" + a.getMinutes();
                document.getElementById("time").value = timestring; 
                $scope.event.additional=thatevent[0].get('additional'); 
            },
            error: function(errr){
            }
        });
     });
    
    $scope.updateEvent = function(){
         if (!$scope.event.time){
              $scope.missingTime = true; 
         }
         else{
             $scope.saveEvent(); 
         }
    }
    
    $scope.saveEvent = function(){
        var eventsQ = new Parse.Query("Events");
        eventsQ.equalTo("objectId",$scope.eventid);
        eventsQ.find({
            success: function(thatevent){
   
                thatevent[0].set('title',$scope.event.title);
                thatevent[0].set('time',$scope.event.time);
                thatevent[0].set('additional',$scope.event.additional);
                thatevent[0].save(); 
                  var options = {
                  buttonLabel: "Close"
        };
                supersonic.ui.dialog.alert("Event successfully updated!", options).then(function() {
            supersonic.ui.layers.pop();
                });
            },
            error: function(errr){
            }
        });
    }
    
        $scope.back = function(){
        supersonic.ui.layers.pop();
        window.open('getting-started.html','_self');
    }
});

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
