# DigitalOcean spaces client side

## Plan:

The user should be able to access the resources on DigitalOcean, but never hold the keys.

## How it should work:

Node server:

* Holds the access website for the users. ✅

* Authenticate the client with Firebase. ✅

* Firebase holds the keys of DigitalOcean. ✅

* The server logs on DigitalOcean and retrieve the information. ✅

* Serves the files required. ✅

## Required:

❗ The keys of DigitalOcean space as an document on Firebase:

``` 
Collection: <DigitalOcean>
    Document: <digitalKeys>
        "accessKeyId": "<YourAccesssKeyID>",
        "secretAccessKey": "<YourSecretAccessKey>",
```

❗ ```.env``` file with:

```
YOUR_PROJECT_ID="<projectID>"
USER_KEYS_LOCATION="<collection>/<document>" <-location of DigitalOcean keys on Firebase
BUCKET_DIGITALOCEAN="<bucketName>"
AWS_URL_ENDPOINT="ams3.digitaloceanspaces.com"

```
To change the port of the server add `PORT=XXXX` to the .env and it will work

❗ ```firebase-keys.json``` file with firebase credentials


## PseudoCode

```
Node Server Running.
    Login website.
After log in, user gets the option of download the request information.
    Node checks firebase for the request information.
        Grabs DigitalOcena keys and redirects the request to DigitalOcean Spaces.
            DigitalOcean deliver the files requested.
```

## How the information ahould be stored:

### Firebase:
``` 
Colection ("Its a fix name, but we can personalize"). 
    Document ("random id, or emailID"){
      query: {
          date:
          email_from:
          email_to:
          text:
          title:
      }
      answer:{
          date:
          email_from:
          email_to:
          text
          title:
      }
      attachments:[
          User files IDs
      ]
      }
} 
KeysToDigitalOcean:{
          Json credencials
```
### Digital Ocean:
```
bucket ("bucketNameForUser?")
    User files (byID)
```

