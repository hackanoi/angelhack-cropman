angular.module('starter.controllers', [])

.controller('appCtrl', function($scope, $ionicModal, $state, $ionicPopover, UserService){
  UserService.initialize();
  $scope.username = UserService.username();
  $scope.uid = UserService.getUid();
  $scope.roles = UserService.roles();
  // Control event click on each tab.
  $scope.tabRedirect = function(state) {
    $state.go(state);
  }

  // Ionic Popover.
  $ionicPopover.fromTemplateUrl('templates/menu-right.html', {
    scope: $scope
  }).then(function(popover) {
    $scope.popover = popover;
  });
  // Open popover.
  $scope.openPopover = function($event) {
    $scope.popover.show($event);
  };
  // Close popover.
  $scope.closePopover = function() {
    $scope.popover.hide();
  };
  $scope.setCurrentUsername = function(name) {
    $scope.username = name;
  };
  $scope.setCurrentUid = function(uid) {
    $scope.uid = uid;
  }
  $scope.setCurrentRole = function(roles) {
    $scope.roles = roles;
  }
  $scope.LogOut = function() {
    UserService.logout();
    window.location.reload(true);
  }
})

.controller('DashCtrl', function($scope) {
})

.controller('SignInCtrl', function($scope, $state, $ionicPopup, UserService){
  $scope.signIn = function(user) {
    UserService.login(user.username, user.password).then(function(res) {
      $scope.setCurrentUid(res.uid);
      var roles = [];
      angular.forEach(res.roles, function(value, key) {
        this.push(value);
      }, roles);
      $scope.setCurrentRole(roles);
      $scope.setCurrentUsername(user.username);
      $state.go('app.dash', {}, {reload: true});
    }, function(err) {
      var alertPopup = $ionicPopup.alert({
        title: 'Login failed!',
        template: 'Please check your credentials!'
      });
    });
  };
})

.controller('SignUpCtrl', function($scope, $state, $ionicPopup, UserService){
  $scope.signUp = function(user){
    UserService.signup(user.email, user.password).then(function(authenticated) {
      var alertPopup = $ionicPopup.alert({
        title: 'Sign-up successfully!',
        template: 'Please check your email to reset password!'
      });
      $state.go('app.dash', {}, {reload: true});
    }, function(err) {
      var alertPopup = $ionicPopup.alert({
        title: 'Sign-up failed!',
        template: 'Please check your email!'
      });
    });
  }
})

.controller('MonitorCtrl', function($scope, $cordovaCamera, $cordovaFileTransfer, $http, RiceMan, $ionicLoading) {
  // Take photo
  $scope.takePicture = function(){
    var options = {
      quality: 50,
      destinationType: Camera.DestinationType.DATA_URL,
      sourceType: Camera.PictureSourceType.CAMERA,
      allowEdit: false,
      encodingType: Camera.EncodingType.JPEG,
      targetWidth: 500,
      targetHeight: 500,
      popoverOptions: CameraPopoverOptions,
      saveToPhotoAlbum: true,
      correctOrientation: true,
    };
    $cordovaCamera.getPicture(options).then(function (imageData) {
      console.log(imageData);
      $scope.imgURI = "data:image/jpeg;base64," + imageData;
    }, function (err) {
    });
  };
  // Choose existing photo
  $scope.choosePhoto = function () {
    var options = {
      quality: 50,
      destinationType: Camera.DestinationType.DATA_URL,
      sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
      allowEdit: false,
      encodingType: Camera.EncodingType.JPEG,
      targetWidth: 500,
      targetHeight: 500,
      popoverOptions: CameraPopoverOptions,
      saveToPhotoAlbum: true,
      correctOrientation: true,
    };

    $cordovaCamera.getPicture(options).then(function (imageData) {
      $scope.imgURI = "data:image/jpeg;base64," + imageData;
    }, function (err) {

    });
  }

  // Upload photo.
  $scope.checkPhoto = function() {
    $ionicLoading.show({
      content: 'Loading',
      animation: 'fade-in',
      showBackdrop: true,
      maxWidth: 200,
      showDelay: 0
    });
    var fileURL = $scope.imgURI;
    var data = {
      image_data: fileURL,
    };

    var config = {
      'Content-Type' : 'application/json',
    };
    $http.post('http://hackanoi-visual-recognition.mybluemix.net/api/testrice', data, config).then(function(res){
      var data = res.data;
      $scope.imagedata = data;
      if (data.score >= 0.5) {
        $scope.percent = data.score * 100;
        RiceMan.fetch().then(function(resSensor){
          var tmp = resSensor.data;
          tmp.soilmoisture = (tmp.soilmoisture*1).toFixed(1);
          if (tmp.hasOwnProperty('temp')) {
            tmp.temp = (tmp.temp*1).toFixed(1);
          } else {
            tmp.temp = 0;
          }
          tmp.humidity = (tmp.humidity*1).toFixed(1);
          tmp.light = (tmp.light*1).toFixed(1);
          $scope.sensors = tmp;
        });
      } else {
        $scope.percent = data.score * 100;
      }
      $ionicLoading.hide();
    });
  };

  // Store data
  $scope.StoreInfor = function(){
    $ionicLoading.show({
      content: 'Loading',
      animation: 'fade-in',
      showBackdrop: true,
      maxWidth: 200,
      showDelay: 0
    });
    /*var imgid = $scope.imagedata.image;
    var score = $scope.imagedata.score;
    var temp = $scope.sensors.temp;
    var humidity = $scope.sensors.humidity;
    var soil = $scope.sensors.soilmoisture;
    var timestamp = $scope.sensors.timestamp;
    console.log(temp);
    $http.get('http://riceman.mybluemix.net/api/storepackage?imageid='+imgid+'&score='+score+'&temp='+temp+'&humidity='+humidity+'&soilmoisture='+soil+'&timestamp='+timestamp).then(function(res){
      console.log(res.data);
      $ionicLoading.hide();
    });*/

    var fileURL = $scope.imgURI;
    var options = {
      content: 'Loading',
      fileKey: "file",
      fileName: 'test.jpeg',
      chunkedMode: true,
      mimeType: "image/jpeg",
    };

    $cordovaFileTransfer.upload("http://ricedata.hackanoi.com/upload-single", fileURL, options).then(function(result) {
      console.log("SUCCESS: " + JSON.stringify(result.response));
      $ionicLoading.hide();
    }, function(err) {
      $ionicLoading.hide();
      console.log("ERROR: " + JSON.stringify(err));
    }, function (progress) {
      // constant progress updates
    });
  }
})

.controller('ProjectCtrl', function($scope, $ionicPopup, $timeout, $http, ProjectService){
  $scope.projects = "";
  $scope.isExpert = null;
  if ($scope.roles.indexOf('expert') > 0) {
    $scope.isExpert = true;
  } else {
    $scope.isExpert = false;
  }
  $scope.doRefresh = function(){
    ProjectService.getProjects($scope.uid, $scope.roles).then(function(projects){
      $scope.projects = projects.data;
      $scope.$broadcast('scroll.refreshComplete');
    }, function(error){
      console.log('error');
    });
  };

  $scope.doRefresh();
  // An elaborate, custom popup
  $scope.showPopup = function() {
    $scope.project = {};

    // An elaborate, custom popup
    var projectPopup = $ionicPopup.show({
      template: '<input type="text" ng-model="project.title">',
      title: 'Project Name',
      scope: $scope,
      buttons: [
        { text: 'Cancel' },
        {
          text: '<b>Save</b>',
          type: 'button-green',
          onTap: function(e) {
            if (!$scope.project.title) {
              //don't allow the user to close unless he enters wifi password
              e.preventDefault();
            } else {
              return $scope.project.title;
            }
          }
        }
      ]
    });

    projectPopup.then(function(res) {
      if (typeof res != 'undefined') {
        ProjectService.createProject($scope.uid, res).then(function(res){
          $scope.doRefresh();
        }, function(err){
          alert('Please try again');
        });
      }
    });
  };
})

.controller('ProjectDetailController', function($scope, $stateParams, $http,
 $cordovaCamera, $cordovaFileTransfer, $ionicLoading, ProjectService, projectinfo){

  $scope.pid = $stateParams.pid;
  $scope.images = "";
  $scope.project = projectinfo;
  $scope.status = false;
  $scope.isExpert = null;
  if ($scope.roles.indexOf('expert') > 0) {
    $scope.isExpert = true;
  } else {
    $scope.isExpert = false;
  }
  $scope.doRefresh = function(){
    ProjectService.getImages($scope.pid).then(function(res){
      $scope.images = res.data; // for UI
      console.log($scope.images);
      $scope.$broadcast('scroll.refreshComplete');
    }, function(error){
      $scope.$broadcast('scroll.refreshComplete');
    });
  };

  $scope.doRefresh();

  // Take photo.
  $scope.takePicture = function(){
    var options = {
      quality: 50,
      destinationType: Camera.DestinationType.DATA_URL,
      sourceType: Camera.PictureSourceType.CAMERA,
      allowEdit: false,
      encodingType: Camera.EncodingType.JPEG,
      targetWidth: 500,
      targetHeight: 500,
      popoverOptions: CameraPopoverOptions,
      saveToPhotoAlbum: true,
      correctOrientation: true,
    };
    $cordovaCamera.getPicture(options).then(function (imageData) {
      console.log(imageData);
      $scope.imgURI = "data:image/jpeg;base64," + imageData;
    }, function (err) {
    });
  };

  // Choose existing photo.
  $scope.choosePhoto = function () {
    var options = {
      quality: 50,
      destinationType: Camera.DestinationType.DATA_URL,
      sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
      allowEdit: false,
      encodingType: Camera.EncodingType.JPEG,
      targetWidth: 500,
      targetHeight: 500,
      popoverOptions: CameraPopoverOptions,
      saveToPhotoAlbum: true,
      correctOrientation: true,
    };

    $cordovaCamera.getPicture(options).then(function (imageData) {
      $scope.imgURI = "data:image/jpeg;base64," + imageData;
    }, function (err) {

    });
  }

  // Store data.
  $scope.StoreInfor = function(){
    $ionicLoading.show({
      content: 'Loading',
      animation: 'fade-in',
      showBackdrop: true,
      maxWidth: 200,
      showDelay: 0
    });
    var fileURL = $scope.imgURI;
    var options = {
      content: 'Loading',
      fileKey: "file",
      fileName: $scope.pid,
      chunkedMode: true,
      mimeType: "image/jpeg",
    };

    $cordovaFileTransfer.upload("http://ricedata.hackanoi.com/upload-single", fileURL, options).then(function(result) {
      console.log("SUCCESS: " + JSON.stringify(result.response));
      $ionicLoading.hide();
      $scope.doRefresh();
    }, function(err) {
      $ionicLoading.hide();
      console.log("ERROR: " + JSON.stringify(err));
    }, function (progress) {
      // constant progress updates
    });
  }
})

.controller('ImageDetailController', function($scope, $stateParams, ImageService){
  $scope.comment = '';
  $scope.imgid = $stateParams.id;
  $scope.imagedata = null;
  $scope.comments = null;
  ImageService.getImage($scope.imgid).then(function(res){
    $scope.imagedata = res.data[0];
  }, function(err){

  });

  $scope.postComment = function(comment){
    ImageService.postComment($scope.imgid, comment).then(function(res){
      $scope.doRefresh();
    }, function(err){
      console.log(err);
    });
  }

  $scope.doRefresh = function(){
    ImageService.getComments($scope.imgid).then(function(res){
      $scope.comments = res.data; // for UI
      $scope.$broadcast('scroll.refreshComplete');
    }, function(error){
      $scope.$broadcast('scroll.refreshComplete');
    });
  };

  $scope.doRefresh();
});
