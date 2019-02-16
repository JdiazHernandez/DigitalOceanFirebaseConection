/********************************************************************
 *  Express server that provides the file system from DigitalOcean  *
 *          And stores the keys on Google firebase.                 *
 *                  @author Javier JDwebdev/                        *
 *                      @license MIT                                *
 ********************************************************************/

//Declare variables for express server
const express = require('express');
const app = express();
const serveStatic = require('serve-static');

//Declare variables for external modules 
const aws = require('aws-sdk');
const Firestore = require("@google-cloud/firestore");
require('dotenv').config();
var multer = require("multer")
var upload = multer({
    dest: 'uploads/'
});
var fs = require('fs');

//Start the Firebase credentials
const firestore = new Firestore({
    projectId: process.env.YOUR_PROJECT_ID,
    keyFilename: "./firebase-keys.json",
    timestampsInSnapshots: true,
});
// Start DigitalOcean credentials
const spacesEndpoint = new aws.Endpoint(process.env.AWS_URL_ENDPOINT);
var list = []



app.get('/vueApp/json', (req, res) => {

    // Genereate the list with all the files from the digital ocean bucket selected.

    var list = [];

    //First grab keys from Firebase.

    async function getKeys() {
        var toDatabase = firestore.doc(process.env.USER_KEYS_LOCATION);
        const fbKeys = await toDatabase.get()
            .then(doc => {
                if (!doc.exists) {
                    console.log('No such USER!');
                } else {
                    return doc.data();
                }
            })
        return await fbKeys
    }

    // Now we call digital ocean to retrieve the file system

    async function retrieveFileList() {
        var params = {
            Bucket: process.env.BUCKET_DIGITALOCEAN,
        };
        aws.config = await getKeys(); //Here are the Keys!!
        const s3 = new aws.S3({
            endpoint: spacesEndpoint,
        });
        const resp = await s3.listObjectsV2(params, function (err, data) {
            if (!err) {
                console.log("Read Digital Ocean")
            } else {
                console.log(err.stack)
            }
        }).promise();

        //This if is just so the list do not overpopulate everytime the pages is refresh
        if (list.length == 0) {
            await resp.Contents.forEach(function (element) {
                if (element.Size > 0)
                    list.push(element.Key);
            })

        } else {
            return list
        }
        return list
    };
    async function listing() {
        var result = await retrieveFileList();
        return result
    };
    (async () => {
        res.send(await listing())
    })()
});

app.get('/vueApp/sales/clients/:clientID', (req, res) => {

    //Generate the list of files from an especific catalog
    var list = [];

    //First grab keys from Firebase.
    async function getKeys() {
        var toDatabase = firestore.doc(process.env.USER_KEYS_LOCATION);
        const fbKeys = await toDatabase.get()
            .then(doc => {
                if (!doc.exists) {
                    console.log('No such USER!');
                } else {
                    return doc.data();
                }
            })
        return await fbKeys
    }

    // Now we call digital ocean to retrieve the file system
    async function retrieveFileList() {
        var params = {
            Bucket: process.env.BUCKET_DIGITALOCEAN,
        };
        aws.config = await getKeys(); //Here are the Keys!!
        const s3 = new aws.S3({
            endpoint: spacesEndpoint,
        });
        const resp = await s3.listObjectsV2(params, function (err, data) {
            if (!err) {
                console.log("Read Digital Ocean")
            } else {
                console.log(err.stack)
            }
        }).promise();

        //This if is just so the list do not overpopulate everytime the pages is refresh
        if (list.length == 0) {
            await resp.Contents.forEach(function (element) {
                if (element.Key.includes(req.params.clientID) && element.Size > 0)
                    list.push(element.Key);
            })
        } else {
            return list
        }
        return list
    };
    async function listing() {
        var result = await retrieveFileList();
        return result
    };  
    (async () => {
        res.send(await listing())
    })()
});

app.get('/vueApp/file/:fileKey', (req, res) => {
    
    // Download a file from the root of Digital Ocean
    params = {
        Bucket: process.env.BUCKET_DIGITALOCEAN,
        Key: req.params.fileKey,
    }
    //  console.log(params.Key)
    async function getKeys() {
        var toDatabase = firestore.doc(process.env.USER_KEYS_LOCATION);
        const DOKeys = await toDatabase.get()
            .then(doc => {
                if (!doc.exists) {
                    console.log('No such USER!');
                } else {
                    console.log("keys readed")
                    return doc.data();
                }
            })
        return await DOKeys
    }

    (async function getfiles() {

        aws.config = await getKeys(); //Here are the Keys!!

        s3 = new aws.S3({
            endpoint: spacesEndpoint,
        });

        const response = s3.getObject(params, function (err, data) {
            if (!err) {
                if (data.ContentLength != 0) {
                    res.send(data.Body)
                    console.log("Download")
                }
            } else {
                res.send(err)
                console.log(err); // an error occurred
            }
        });
    })()
})

app.get('/vueApp/file/:department/:userType/:clientID/:fileKey', (req, res) => {

    // Donwload an especific file from an especific catalog

    params = {
        Bucket: process.env.BUCKET_DIGITALOCEAN,
        Key: req.params.department + "/" + req.params.userType + "/" + req.params.clientID + "/" + req.params.fileKey,
    }
    // console.log(params.Key)
    async function getKeys() {
        var toDatabase = firestore.doc(process.env.USER_KEYS_LOCATION);
        const DOKeys = await toDatabase.get()
            .then(doc => {
                if (!doc.exists) {
                    console.log('No such USER!');
                } else {
                    console.log("keys readed")
                    return doc.data();
                }
            })
        return await DOKeys
    }

    (async function getfiles() {

        aws.config = await getKeys(); //Here are the Keys!!

        s3 = new aws.S3({
            endpoint: spacesEndpoint,
        });

        const response = s3.getObject(params, function (err, data) {
            if (!err) {
                if (data.ContentLength != 0) {
                    res.send(data.Body)
                    console.log("Download")
                }
            } else {
                res.send(err)
                console.log(err); // an error occurred
            }
        });
    })()
})

app.get('/vueApp/deleteFile/:filetodelete', (req, res) => {

    // Deletes a file from the root of digital ocean bucket selected
    
    params = {
        Bucket: process.env.BUCKET_DIGITALOCEAN,
        Key: req.params.filetodelete,
    }
    // console.log(params.Key)
    async function getKeys() {
        var toDatabase = firestore.doc(process.env.USER_KEYS_LOCATION);
        const DOKeys = await toDatabase.get()
            .then(doc => {
                if (!doc.exists) {
                    console.log('No such USER!');
                } else {
                    return doc.data();
                }
            })
        return await DOKeys
    }

    (async function deleteFiles() {

        aws.config = await getKeys(); //Here are the Keys!!

        s3 = new aws.S3({
            endpoint: spacesEndpoint,
        });

        s3.deleteObject(params, function (err, data) {
            if (!err) {
                console.log(data); // sucessfull response
                res.redirect('/vueApp/')
                /*
                data = {}
                */
            } else {
                console.log(err); // an error ocurred
            }
        });
    })()
})

app.get('/vueApp/deleteFile/:department/:userType/:fileKey', (req, res) => {

    // Deletes any file drom an especific catalog 
    params = {
        Bucket: process.env.BUCKET_DIGITALOCEAN,
        Key: req.params.department + "/" + req.params.userType +  "/" + req.params.fileKey,
    }
    // console.log(params.Key)
    async function getKeys() {
        var toDatabase = firestore.doc(process.env.USER_KEYS_LOCATION);
        const DOKeys = await toDatabase.get()
            .then(doc => {
                if (!doc.exists) {
                    console.log('No such USER!');
                } else {
                    return doc.data();
                }
            })
        return await DOKeys
    }

    (async function deleteFiles() {

        aws.config = await getKeys(); //Here are the Keys!!

        s3 = new aws.S3({
            endpoint: spacesEndpoint,
        });

        s3.deleteObject(params, function (err, data) {
            if (!err) {
                console.log(data); // sucessfull response
                res.redirect('/vueApp/')
                /*
                data = {}
                */
            } else {
                console.log(err); // an error ocurred
            }
          
        });
    })() 
})

app.get('/vueApp/deleteFile/:department/:userType/:clientID/:fileKey', (req, res) => {

    // Deletes any file from an especific catalaog, longer than before

    params = {
        Bucket: process.env.BUCKET_DIGITALOCEAN,
        Key: req.params.department + "/" + req.params.userType + "/" + req.params.clientID + "/" + req.params.fileKey,
    }
    // console.log(params.Key)
    async function getKeys() {
        var toDatabase = firestore.doc(process.env.USER_KEYS_LOCATION);
        const DOKeys = await toDatabase.get()
            .then(doc => {
                if (!doc.exists) {
                    console.log('No such USER!');
                } else {
                    console.log("keys readed")
                    return doc.data();
                }
            })
        return await DOKeys
    }

    (async function deleteFiles() {

        aws.config = await getKeys(); //Here are the Keys!!

        s3 = new aws.S3({
            endpoint: spacesEndpoint,
        });

        s3.deleteObject(params, function (err, data) {
            if (!err) {
                console.log(data); // sucessfull response
                res.sendStatus( 200 )
                /*
                data = {}
                */
            } else {
                console.log(err); // an error ocurred
            }
          
        });
    })() 
})

app.post('/vueApp/upload/:department/:userType/:client', upload.single('file'), function (req, res, next) {

    // Upload a file to an especific catalog

    var pathtoupload= req.params.department + "/" + req.params.userType + "/" + req.params.client +'/'
    console.log(pathtoupload)
    var uploadItem = req.file
    var buffer = fs.readFileSync(uploadItem.path);

    var params = {
        Bucket: process.env.BUCKET_DIGITALOCEAN,
        Key: pathtoupload + uploadItem.originalname,
        Body: buffer
    };
    var options = {
        partSize: 25 * 1024 * 1024, // 25 MB
        queueSize: 10
    };
    async function getKeys() {
            var toDatabase = firestore.doc(process.env.USER_KEYS_LOCATION);
            const DOKeys = await toDatabase.get()
                .then(doc => {
                    if (!doc.exists) {
                        console.log('No such USER!');
                    } else {
                        console.log("keys readed")
                        return doc.data();
                    }
                })
            return await DOKeys
        }
        (async function uploadFile() {

            aws.config = await getKeys(); //Here are the Keys!!

            s3 = new aws.S3({
                endpoint: spacesEndpoint,
            });

            s3.upload(params, options, function (err, data) {
                if (!err) {
                    //console.log(data); // successful response
                    console.log("uploaded")
                 //   res.redirect('/vueApp/')
                 res.sendStatus( 200 )
                    // res.redirect('/vueApp/')
                } else {
                    console.log(err); // an error occurred
                }
            })
        })()
        

});


const port = process.env.PORT || 4000; //<--- If indicated on the .env file, the port changes.

//Start the server:

app.use('/vueApp', serveStatic(__dirname + '/vueApp')).listen(port, () => {
    console.log(`⚡️ Listening at http://127.0.0.1:${port}/vueApp`);
});