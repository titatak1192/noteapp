(function(){
    'use strict';

    angular.module('notes', [])
        .constant('NOTE_AUTO_SAVE_TIME', 1000)
        .constant('API_BASE_DOMAIN', 'https://broken-thunder-7744.getsandbox.com/');

}());
(function(){
    'use strict';

    angular
        .module('notes')
        .controller('homeController', ['$scope','notesService', 'folderModel', 'notesModel', 'NOTE_AUTO_SAVE_TIME', HomeController])

    /** @ngInject */
    function HomeController($scope, notesService, folderModel, notesModel, NOTE_AUTO_SAVE_TIME){


        init();

        function init(){
            console.log("this is new code");

// $("document").ready(function () {
//   window.panelOpen = true;
//   $("#slider-trigger").click(function () {
//     if (window.panelOpen) {
//       $("#rightPanel").removeClass("m6");
//       $("#rightPanel").addClass("m8");
//       $("#leftPanel").hide( "slide", { direction: "left", duration: 200 } );
//     } else {
//       $("#rightPanel").removeClass("m8");
//       $("#rightPanel").addClass("m6");
//       $("#leftPanel").show( "slide", { direction: "left", duration: 200 } );
//     }
//     window.panelOpen = !window.panelOpen;
//   });
// });

        }

        $scope.sideBarToggle = false;
        $scope.toggleSideBar = function(){
          console.log($scope.sideBarToggle);
          $scope.sideBarToggle = !$scope.sideBarToggle;
        }

        var lastTimeoutDetails = {};

        $scope.folders = [];
        $scope.searchText = "";

        $scope.selectedFolder = -1;
        $scope.selectedNote = {};
        $scope.visibleNotes = [];
        $scope.NoteIsLastClicked = true; // to identify if we need to delete note or folder

        $scope.notes = {};

        folderModel.getFolders(function (folders) {
            $scope.folders = folders;
          });

        notesModel.getNotes(function (notes) {
            $scope.notes = notes;
          });

          $scope.createFolder = function () {
              var name = prompt("Enter folder name");
              if (!name) {
                return;
              }
              var newFolder = folderModel.generate(name);
              $scope.folders.push(newFolder);
              $scope.folders.sort( function(a, b) {
                return (a.name.toLowerCase() > b.name.toLowerCase()) ? 1 : -1;
              });
              notesService.folder.create(newFolder);
            }

          $scope.selectFolder = function (id) {
            $scope.selectedFolder = id;
            $scope.NoteIsLastClicked = false;
            $scope.visibleNotes = notesService.notes.computeVisibleNotes($scope.notes, $scope.selectedFolder);
          }

          $scope.createNote = function () {
            var newNote = {folder: $scope.selectedFolder, id: 0, title: "Enter note", text: ""};
            $scope.notes[newNote.id] = newNote;
            $scope.selectedNote = newNote;
            $scope.visibleNotes = notesService.notes.computeVisibleNotes($scope.notes, $scope.selectedFolder);
          }

          $scope.selectNote = function (id) {
            $scope.selectedNote = $scope.notes[id];
            $scope.NoteIsLastClicked = true;
          }

          function syncNotes(notePayload) {
            var note = JSON.parse(notePayload);
            if (!note.text) {
              return;
            }
            notesService.notes.create(note);
            $scope.visibleNotes = notesService.notes.computeVisibleNotes($scope.notes, $scope.selectedFolder);
          }

          $scope.filterNotes = function () {
            $scope.visibleNotes = notesService.notes.computeVisibleNotes($scope.notes, $scope.selectedFolder);
            if (!$scope.searchText) {
              return;
            }
            var matchingNotes = [];
            for (var index=0; index<$scope.visibleNotes.length; index++) {
              if ($scope.visibleNotes[index].text.toLowerCase().indexOf($scope.searchText.toLowerCase()) > -1) {
                matchingNotes.push($scope.visibleNotes[index]);
              }
            }
            $scope.visibleNotes = matchingNotes;
          }

          $scope.delete = function () {
            if ($scope.NoteIsLastClicked) {
              // delete current note
              var deleteId = $scope.selectedNote.id;
              $scope.selectedNote = {};
              if (deleteId) {
                  delete $scope.notes[deleteId];
                  notesService.notes.delete(deleteId)
              }
            } else {
              var oldFolderList = JSON.parse(JSON.stringify($scope.folders));
              var newFolderList = [];
              for (var index=0; index<oldFolderList.length; index++) {
                if (oldFolderList[index].id != $scope.selectedFolder) {
                  newFolderList.push(oldFolderList[index])
                }
              }
              notesService.folder.delete($scope.selectedFolder)
              $scope.selectedFolder = -1
              $scope.folders = newFolderList;
            }
            $scope.visibleNotes = notesService.notes.computeVisibleNotes($scope.notes, $scope.selectedFolder);
          }

          $scope.$watch('notes', function() {
            if (lastTimeoutDetails && lastTimeoutDetails.noteId == $scope.selectedNote.id) {
              clearTimeout(lastTimeoutDetails.timeoutId);
            }
            if ($scope.selectedNote && $scope.selectedNote.text) {
              var noteDetails = $scope.selectedNote.text.split("\n")
                $scope.selectedNote.title = noteDetails[0];
                if (noteDetails.length >= 1 ){
                  $scope.selectedNote.preview = noteDetails[1];
                };
            }
            $scope.selectedNote.updatedAt = (new Date()).toISOString();

            var timeoutId = setTimeout(function () {
              $scope.userMessage = "Saving.."
              syncNotes(JSON.stringify($scope.selectedNote));
            }, NOTE_AUTO_SAVE_TIME);
            lastTimeoutDetails = {
              timeoutId: timeoutId,
              noteId: $scope.selectedNote.id
            }
        }, true);
    }
}());


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
              var notes = {};
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
(function () {
    'use strict';

    angular
        .module('notes')
        .service('notesService', ['$http', 'API_BASE_DOMAIN', NotesService]);


    /** Folder Service */
    /** @ngInject */
    function NotesService($http, API_BASE_DOMAIN) {

        this.fn = fn;

        function fn() {

        }
        var folderFn = {}

        this.folder = folderFn;

        folderFn.create = function (folderObject) {
            return $http.post(API_BASE_DOMAIN + "folders", folderObject);
        }

        folderFn.delete = function (id) {
            return $http.delete(API_BASE_DOMAIN + "folders/" + id)
        }


        var notesFn = {};

        this.notes = notesFn;

        notesFn.create = function(note){
            return $http.post(API_BASE_DOMAIN + "notes", note);
        }

        notesFn.delete = function(id){
            return $http.delete(API_BASE_DOMAIN + "notes/" + id)
        }

        notesFn.computeVisibleNotes = function(notes, folderId){
            var visibleNotes = [];
            var selectedNote = {};
            for (var index in notes) {
                if (notes[index].folder == folderId) {
                visibleNotes.push(notes[index]);
            }
        }
        visibleNotes.sort(function(a, b) {
          return (new Date(a.updatedAt) > new Date(b.updatedAt)) ? -1 : 1;
        });
        return visibleNotes;
        }


    }

}());
