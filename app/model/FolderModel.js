
(function(){
    'use strict';

    angular
        .module('notes')
        .factory('folderModel', FolderModel)

    /** @ngInject */
    function FolderModel(API_BASE_DOMAIN, $http){

        function getRandomId() {
            return parseInt(Math.random() * 10000);
        }

        function generateFolderModel(name) {

            return {
                id: getRandomId(),
                name: name
            }
        }

        function getFolders(callback) {
            $http.get(API_BASE_DOMAIN + "folders").then(function (response) {
              var folders = response.data;
              folders.sort((a, b) => (a.name > b.name) ? 1 : -1)
              callback && callback(folders);
            });
          }
          
        return {
            fn: fn,
            generate: generateFolderModel,
            getFolders: getFolders
        }

        function fn(){            
        }
    }

}());


