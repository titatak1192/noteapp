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
