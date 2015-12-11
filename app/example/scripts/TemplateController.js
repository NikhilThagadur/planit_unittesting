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
