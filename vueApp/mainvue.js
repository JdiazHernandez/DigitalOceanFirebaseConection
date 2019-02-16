/********************************************************************
 *                Vue app and Dropzone options                      *
 *                                                                  *
 *                  @author Javier JDwebdev/                        *
 *                      @license MIT                                *
 ********************************************************************/

 //Declare the vue app

var app = new Vue({
    strict: true,
    el: '#app',
    data: {
        urls: [],
        path: "sales/clients/",
        client: null,
        cache: [],
    },
    methods: {
        // Finds all the files on the root and catalogs of Digital Ocean
        retrieveAll() {
            this.cache = []
            fetch("http://127.0.0.1:4000/vueApp/json")
                .then(res => res.json())
                .then(res => {
                    res.forEach(element => {
                        this.cache.push(element)
                    })
                })
                //The result list is first cached and then push to Vue so there is no noticeable fliker on the front end.
                .then(res => {
                    if(this.cache.length>0){
                        this.urls=this.cache
                    }
                })
        },
        // Finds the files from an specific catalog
        retrieveSales() {
            this.cache = []
            var pathToFetch = 'http://127.0.0.1:4000/vueApp/' + this.path + this.client;
            console.log(pathToFetch)
            fetch(pathToFetch)
                .then(res => res.json())
                .then(res => {
                    res.forEach(element => {
                        this.cache.push(element)
                    })
                })
                //The result list is first cached and then push to Vue so there is no noticeable fliker on the front end.
                .then(res => {
                    if(this.cache.length>0){
                        this.urls=this.cache
                    }else if(this.cache==0){
                        // When trying to retrieve fron an empty catalog, it alerts the user an loads all the files.
                        alert("This ID is empty in the database")
                        this.retrieveAll()
                    }
                })
                
        },
        // Deletes a file from an especific location
        deleteFile(file) {
            var pathToFetch = 'http://127.0.0.1:4000/vueApp/deleteFile/' + file;
            console.log(pathToFetch)
            fetch(pathToFetch)
                .then(this.retrieveSales())
        }
    },
})

// The dropzone is initiated
Dropzone.options.myAwesomeDropzone = {
    url: function () {
        //Tp make sure that the upload is done to the correct catalog, the functions is set to retireve the correct path when requested
        var url1 = app.path + app.client
        var uploadPath = '/vueApp/upload/' + url1;
        console.log(uploadPath);
        return uploadPath;
    },

    init: function () {
        //This cleans the thumbnails after 5s from dropzone once the are uploaded correctly
        this.on("queuecomplete", function () {
            app.retrieveSales();
            setTimeout(() => {
                this.removeAllFiles();
            }, 5000);
        })
    },
};
//Enter key funcitonality
document.onkeydown = function () {
    if (window.event.keyCode == '13') {
        if (app.client == null) {
            app.retrieveAll()
        } else {
            app.retrieveSales()
        }
    }
}
// Autopopulate the front when the page is loaded.
if (app.client == null) {
    app.retrieveAll()
} else {
    app.retrieveSales()
}