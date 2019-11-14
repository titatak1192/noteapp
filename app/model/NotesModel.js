(function(){
    'use strict';

    angular
        .module('notes')
        .factory('notesModel', NotesModel)

    /** @ngInject */
    function NotesModel(API_BASE_DOMAIN, $http){

        function getRandomId() {
            return parseInt(Math.random() * 10000);
        }

        function generateFolderModel(id, name) {

            return {
                id: getRandomId(),
                name: name
            }
        }

        function getNotes(callback) {
            $http.get(API_BASE_DOMAIN + "notes").then(function (response) {
              var responseData = response.data;
              var notes = {};debugger;
              for (var index=0; index < responseData.length; index++) {
                notes[responseData[index].id] = responseData[index];
              }
              callback && callback(notes);
            });
          }

        return {
            fn: fn,
            getRandomId: getRandomId,
            generateFolderModel: generateFolderModel,
            getNotes: getNotes 
        }

        function fn(){
            
        }
    }

}());
