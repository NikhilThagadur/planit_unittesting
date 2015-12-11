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
