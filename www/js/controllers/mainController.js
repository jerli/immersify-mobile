(function() {
  angular.module("starter")
    .controller("HomeController", ["$scope", "$ionicModal", "$cordovaFile",
      "$cordovaFileTransfer", "$cordovaCamera", HomeController
    ]);

  function HomeController($scope, $ionicModal, $cordovaFile, $cordovaFileTransfer,
    $cordovaCamera) {
    //var $scope = this;
    $scope.currentImage = "http://placehold.it/1536x2048";
    $scope.imageDescription = "Take a picture!";
    $scope.detectionType = "LABEL_DETECTION";
    $scope.currLanguage = "en";
    $scope.languages = {
      English: "en",
      Français: "fr",
      Español: "es",
      Deutsch: "de",
      中文: "zh-CN"
    }
    $scope.detectionTypes = {
      LABEL_DETECTION: 'label',
      TEXT_DETECTION: 'text',
      LOGO_DETECTION: 'logo',
      LANDMARK_DETECTION: 'landmark'
    };

    var apiKey = "ENTER API KEY HERE";
    var $http = angular.injector(['ng']).get('$http')

    // Take picture using camera and update the views
    $scope.takePicture = function() {
      var options = {
        destinationType: Camera.DestinationType.DATA_URL,
        sourceType: Camera.PictureSourceType.CAMERA,
        targetWidth: 500,
        targetHeight: 500,
        correctOrientation: true,
        cameraDirection: 0,
        encodingType: Camera.EncodingType.JPEG
      };

      $cordovaCamera.getPicture(options).then(function(imagedata) {
        $scope.currentImage = "data:image/jpeg;base64," + imagedata;
        $scope.imageDescription = "...";
        $scope.locale = "";

        var visionAPIJSON = {
          "requests": [{
            "image": {
              "content": imagedata
            },
            "features": [{
              "type": $scope.detectionType,
              "maxResults": 1
            }]
          }]
        };

        var contents = JSON.stringify(visionAPIJSON);
        var url = "https://vision.googleapis.com/v1/images:annotate?key=" + apiKey;
        $http.post(url, contents).then(function(response) {
          var res = response.data;
          var key = $scope.detectionTypes[$scope.detectionType] + "Annotations";
          var description = res.responses[0][key][0].description;
          //Translate text
          if ($scope.currLanguage === "en") {
            $scope.imageDescription = description;
            $scope.$apply();
          } else {
            var url = "https://www.googleapis.com/language/translate/v2?key=" +
              apiKey + "&source=en&target=" + $scope.currLanguage + "&q=" + description;
            $http.get(url).then(function(response) {
              $scope.imageDescription = response.data.data.translations[0].translatedText;
              $scope.$apply();
            }, function(err) {
              alert("An error occured during Translation")
            })
          }
        }, function(err) {
          alert("An error occured during Image Recognition");
        });

      });

    };
    // play text pronouciation upon tapping the word
    $scope.speech = function() {
      TTS
          .speak({
              text: $scope.imageDescription,
              locale: $scope.currLanguage,
              rate: 1.0
          }, function () {
          }, function (reason) {
              alert(reason);
          });

    };
    // update displayed language upon selection change
    $scope.updateLanguages = function(currLanguage, oldValue) {
      $scope.currLanguage = currLanguage;
      var url = "https://www.googleapis.com/language/translate/v2?key=" +
        apiKey + "&source="+ oldValue + "&target=" + currLanguage + "&q=" + $scope.imageDescription;
      $http.get(url).then(function(response) {
        $scope.imageDescription = response.data.data.translations[0].translatedText;
        $scope.$apply();
      }, function(err) {
        alert("An error occured during Translation")
      })
    }

  }
})();
