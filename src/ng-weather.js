'use strict';

angular.module('asafdav.ngWeather', [])
  .value('apiEndpoint', 'http://api.openweathermap.org/data/2.5/weather')
  .value('iconEndpoint', 'http://openweathermap.org/img/w/')
  .service('weatherService', ['$http', '$q', 'apiEndpoint', 'iconEndpoint', function($http,$q, apiEndpoint, iconEndpoint) {
    function WeatherInfo(openWeatherData) {
      this.data = openWeatherData;

      this.getTemperature = function() {
        return this.data && this.data.main ? this.data.main.temp : null;
      }

      this.getMinTemperature = function() {
        return this.data && this.data.main ? this.data.main.temp_min : null;
      }

      this.getMaxTemperature = function() {
        return this.data && this.data.main ? this.data.main.temp_max : null;
      }

      this.getIconCode = function() {
        return this.data && this.data.weather && this.data.weather[0] ? this.data.weather[0]['icon'] : null;
      }

      this.getIcon = function() {
        return iconEndpoint + this.getIconCode() + '.png';
      }
    };

    this.q = function(searchTerm, unit) {
      var deferred = $q.defer();
      unit = typeof unit !== 'undefined' ? unit : 'metric';
      var uri = apiEndpoint + "?q=" + searchTerm + "&units=" + unit + "&callback=JSON_CALLBACK";
      $http.jsonp(uri).
        success(function(response, status) {
          deferred.resolve(new WeatherInfo(response));
        }).error(function (error, status) {
          deferred.reject(error);
        });

      return deferred.promise;
    }
  }])
  .directive('cityWeather', ['weatherService', function(weatherService) {
    return {
      scope: {
        cityWeather: '&'
      },
      restrict: 'A',
      template:     '<div class="weather-widget">' +
        '<h1>Temperature in {{city}} <img ng-src="{{weather.getIcon()}}" /></h1>' +
        '<h3>Current: {{weather.getTemperature()}}&deg;C</h3>' +
        '<h4>Min: {{weather.getMinTemperature()}}&deg;C, Max: {{weather.getMaxTemperature()}}&deg;C </h4>' +
      '</div>',
      link: function (scope, element, attrs) {
        scope.$watch('cityWeather', function() {
          scope.city = scope.$eval(scope.cityWeather);
          weatherService.q(scope.city).then(function(w) {
            scope.weather = w;
          }, function() {scope.weather = null});
        });
      }
    };

  }]);