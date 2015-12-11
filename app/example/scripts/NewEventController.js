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
