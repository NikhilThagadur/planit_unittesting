describe('FeedControllerTests', function() {
  beforeEach(module('supersonic'));
  beforeEach(module('example'));

  var $scope, deferred ,q, createController;
  var ParseServiceMock;
  var itenararies = [{ 'objectid': 'Olrsgj4FOy', 'title': 'Chicago'},
                { 'objectid': 'VRTgHJxpLJ', 'title': 'Paris'},
		{ 'objectid': 'ninRiPWUqq', 'title': 'Bali'},
		{ 'objectid': 'vwBBFFHfrL', 'title': 'Boston'},
		{ 'objectid': 'S9IsyFGZxH', 'title': 'Karachi'},];


  beforeEach(function (){
    inject(function($rootScope, $controller, $q, _ParseService_){
    q = $q;
    controller = $controller;
    ParseServiceMock = _ParseService_;
    
    $scope=$rootScope.$new();
    
  spyOn(ParseServiceMock, 'find').and.callFake(function() {
          deferred = $q.defer();
        return deferred.promise;
    });
     createController = function()
    { 
      return $controller('FeedController', {
      $scope: $scope,
      'ParseService': ParseServiceMock
      });
    }
 })
});


   describe('Retrieve list of iteneraries', function() {
    it('should retrieve list of iteneraries', function() {
     
      var controller = createController();
      deferred.resolve(itenararies);
      $scope.$digest();
      expect($scope.ites.length).toEqual(5);
      	expect($scope.ites[0].objectid).toEqual('Olrsgj4FOy');
	expect($scope.ites[1].objectid).toEqual('VRTgHJxpLJ');
	expect($scope.ites[2].objectid).toEqual('ninRiPWUqq');
	expect($scope.ites[3].objectid).toEqual('vwBBFFHfrL');
	expect($scope.ites[4].objectid).toEqual('S9IsyFGZxH');

	expect($scope.ites[0].title).toEqual('Chicago');
	expect($scope.ites[1].title).toEqual('Paris');
	expect($scope.ites[2].title).toEqual('Bali');
	expect($scope.ites[3].title).toEqual('Boston');
	expect($scope.ites[4].title).toEqual('Karachi');
	
});

it('Parse retrieval error', function() {
      var error = {code: 404, message: 'Parse Not Found'};
      var controller = createController();
      deferred.reject(error);
      $scope.$digest();
      expect($scope.error).toEqual(error);

});
      
});
});
