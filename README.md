# Finance Tracker Backend
*A NodeJS REST API*

## Overview
This GitHub repository contains the source code for the backend of my project for both my Web Applications Development and Agile Software Practices modules. A design document can be found [here](https://github.com/JavaTheNutt/web_app_dev_project_backend/tree/master/docs/documentation/DesignDoc.pdf)

This project is Finance Tracker application that will be used to track finances for a specific user. 

## Building the project
### Excluded Files
Some critical files are missing from this repo. If you want to build this project yourself, you will need to first create a [firebase](https://firebase.google.com) account, and a new Firebase project. Once you have created the account you can retrieve your [firebase admin service key](https://firebase.google.com/docs/admin/setup). Name this key _firebaseServiceKey.json_ and save it in the _config_ directory in the project root. This project also requires the _firebase 
client side library_ for testing purposes. The reason for this is that all routes are authenticated using [firebase access tokens](https://firebase.google.com/docs/auth/admin/verify-id-tokens), which cannot be forged. It will also be necessary to create another file in the config directory called _privateConfig.js_. This file will hold the details of the project that should not be checked into VCS (such as database connection strings and credentials). The format of this file should be as follows (firebase client side details can be retrieved by opening the [firebase console](https://console.firebase.google.com), selecting the project (ensuring that it is the same project that you retrieved the service key for), and clicking on the _add firebase to your web app_ link)
```js
const serviceKey = require('./firebaseServiceKey.json');
module.exports   = {
  prodDb: '<mongodb connection string here>',
  firebaseOpts: {
    credential: serviceKey,
    databaseUrl: '<firebase database URL here>'
  },
  firebaseTestClient: {
    apiKey: '<API key here>',
    authDomain: '<Auth domain here>',
    databaseURL: '<firebase database URL here>',
    projectId: '<project id here>',
    storageBucket: '<storage bucket here>',
    messagingSenderId: '<messaging sender id here>'
  }
};
```
### Build process
This project was built using Node 8.6.0, which  supports a large set of ES8+ features. However, to ensure that the project can be built on any platform, all source code is transpiled through [babel](https://babeljs.io/) using the [babel-preset-env](https://github.com/babel/babel-preset-env) preset. If you **are** using Node 8+, this means that its is simply moving the files from `/api` to `/dist`. If you are using an older version of Node, babel will automatically determine which features need to be polyfilled while transpiling.
The steps required to run the project are as follows:
1. Clone the repo
2. Run `npm install` (or `npm i`)
3. Run `npm run compile` (or `npm run compileOnce` to run without a babel transpilation watcher) 
4. Run `npm run dev` to start the development server

## Scripts
There are several scripts included in the `package.json` file. These are: 
### Testing
All test scripts listed in the `package.json` are configured to run with coverage from [nyc/istanbul](https://github.com/istanbuljs/nyc)
* `npm run unit`: Run the entire unit test suite, which tests each function in total isolation from any other function, stubbing every function call within the function being tested
* `npm run internalIntegration`: Run all internal integration tests, which tests the integration of custom components, while stubbing all external actors, such as the database and Firebase
* `npm run externalIntegration`: Run all external integration tests, which use uses the [supertest](https://github.com/visionmedia/supertest) module to test all of the API routes, without any stubs/mocks (Mongo daemon must be running locally, or an appropriate test database must be configured in `config/config.js`)
* `npm run integration`: Run both internal and external test suites
* `npm test`: Run all unit and integration tests
### Building
These scripts are used to transpile the project to the developers local environment. All transpilation is done using through [babel](https://babeljs.io/) using the [babel-preset-env](https://github.com/babel/babel-preset-env) preset. This means that Babel will automatically detect the version of NodeJS that you are using and provide appropriate polyfills where necessary.
* `npm run compileOnce`: single run babel transpilation to take the source code from `/api` and transpile it to code suitable for the current environment. Transpiled code mirrors the original structure, but is stored under `/dist` rather than `/api`
* `npm run compile`: same as above, but places a watcher on `/api` to watch for file changes
### Running 
* `npm run dev`: start development server using [nodemon](https://github.com/remy/nodemon), which triggers server restarts when `/dist` changes.
* `npm start`: start the server in production mode
### Quality
* `npm run lint`: run [eslint](https://eslint.org/) with the `--fix` flag to alert to style issues and fix if applicable
### Documentation
* `npm run docs`: run [jsdoc](https://www.npmjs.com/package/jsdoc) to generate JSDocs for all functions

***
***
# Agile Software Practices Information
# Assignment 1 - API testing and Source Control.

Name: Joe Wemyss

## Overview.

This is a backend API that will be used to track details of financial transactions for a single user. As of yet, this project basically just provides authentication for the application. 

## API endpoints.

 + GET /user - Get the current user based on the ID provided in the authentication token
 + GET /user/address - Get all addresses for the user who made the request
 + GET /user/address/:id - Get a specific address for the current user, based on ID
 + POST /user/new - Create a new user with the details contained in the authentication token
 + PUT /user - Update the user who made the request
 + DELETE /user/address/:id - Delete the address with the specified ID of the user who made the request
 + POST /user/address - Add an address to the user who made the request
 

## Data storage.

The database will contain two collections. These collections are __User__ and __UserAuth__. The reason for the two of them being kept in separate collections is because the contents of the __UserAuth__ collection will only ever be used internally in the application, and should never be leaked in a response.
The __User__ collection is made up of some base details and an array of nested Mongoose Models for addresses, since it will be reused later in other parts of the application. The models so far look like this, once saved to the Database:

### User
The __User__ collection is comprised of these two mongoose models:
#### Address
```js
const AddressSchema = mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  loc: {
    type: {
      type: String,
      enum: ['Point']
    },
    coordinates: {
      type: [Number]
    }
  }
});
AddressSchema.index({loc: '2dsphere'});

```
#### User
```js
const UserSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function(emailAddress) {
        return emailValidator.validate(emailAddress);
      },
      message: 'Email is poorly formatted'
    }
  },
  firstName: String,
  surname: String,
  addresses: [Address]
}, {collection: 'users'});
```
These models result in the below collection:
```json
{
"_id":"59ee0f1ee9aaa102f05b7877",
"email":"root@root.com",
"addresses":[{
	"_id": "59f8ac6e900c7812acd2833c",
	"text":"20 Barrack St, Waterford, X91 FTP8, Ireland",
	"loc":[{
		"type":"Point",
		"coordinates":[52.2572488, -7.116612699999999]
	}]
}],
"firstName": "Joe",
"surname": "Bloggs",
"__v":0
}
```
### User Auth
The __UserAuth__ collection is made up of a single mongoose model. This model looks like this:
```js
const UserAuthSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
    validate: {
      validator: function(emailAddress) {
        return emailValidator.validate(emailAddress);
      },
      message: 'Email is poorly formatted'
    }
  },
  user: {
    type: String, 
    required: false,
    validate: {
      validator: function (id) {
  		return /^[a-fA-F0-9]{24}$/.test(id);
	  },
      message: 'Object Id is improperly formatted'
    }
  },
  firebaseId: {
    type: String,
    required: true
  }
}, {collection: 'user_auth'});
```
This model produces a collection like this:
```json
{
	"_id":"59ee0f1ee9aaa102f05b7878",
	"email":"root@root.com",
	"firebaseId":"Jj7VV5lOc8cccKUyMb4DcvhNzNI2",
	"user":"59ee0f1ee9aaa102f05b7877",
	"__v":0
}
```
## Sample Test execution.
Below are my three test suites, with a short explanation of each. All three can be run with a single command using `npm test`. The suites are organised by directory and are run by recursively scanning the specified directory and running all suites found within. Each one is also fed into Babel to cater to systems that do not support ES8 syntax.

### Unit tests
The unit tests test each function in absolute isolation. Each test tests a single function and all other function calls are stubbed.

        $ npm run unit
        
        > webdev_backend_one@0.0.1 unit C:\Users\joewe\projects\node\webdev_backend_one
        > cross-env NODE_ENV=test LOG_LEVEL=silent nyc mocha ./test/unit -name '*_test.js' --recursive --compilers js:babel-core/register -R spec
        
        
        
          AddressModel
            creation
              √ should create a valid Address model with no geospatial coordinates
              √ should create a valid Address model with geospatial coordinates
              √ should create a valid Address model with geospatial coordinates, but no type specified
              √ should throw an error when there is no text specified
        
          address service
            validate address
              √ should return true when an address is valid
              √ should handle errors gracefully
              √ should handle formatting errors gracefully
            format details
              √ should correctly format the details
              √ should correctly set default values when no coordinates are provided
              √ should return an error when there is no text provided
        
          auth middleware
            new user auth
              √ should set the is new flag on the request
            app authentication
              √ should call next with no params when details are valid and token is not custom and not new
              √ should fail when no token is present
              √ should fail when no headers are present
              √ should return 401 when token is deemed invalid
        
          UserAuth model
            √ should create a user auth model with all details
            √ should create a user auth model with no user id
            √ should fail when there is no email passed
            √ should fail when there is no firebase id passed
            √ should fail when email address is poorly formed
            √ should fail when user id is poorly formed
        
          auth service
            handle claim validation
              √ should return the standard claims for new users
              √ should add the custom claims to claims that are not for new users, but do not have custom claims
              √ should return the custom auth object to be appended to the request
              √ should handle no user being returned gracefully
            jwt validation
              √ should return false when an invalid object is passed
              √ should return false a single chracter is passed
              √ should return false when nothing is passed
              √ should return true when it recieves a jwt to validate
              √ should handle thrown errors gracefully
              √ should handle unthrown errors gracefully
            user auth creation
              √ should create a new user when provided with correct details
              √ should handle errors gracefully
            fetch user auth by firebase id
              √ should handle a successful fetch
              √ should handle errors while querying
              √ should handle empty responses gracefully
            decode token
              √ should return true when it recieves a jwt to validate
              √ should handle errors gracefully
            set custom claims
              √ should call set custom claims
              √ should handle errors gracefully
            create user claim
              √ returns a valid claim object
              √ handles empty responses gracefully
              √ handles responses with no user field gracefully
              √ handles errors from set custom claims gracefully
            check custom claims
              √ should return true when user claim is present
              √ should return false when user claim is not present
            fetch user id from firebase id
              √ should recieve a firebase id and return a user id
              √ should handle errors non existant records
              √ should handle records with no user field
            delete auth record by id
              √ should return true when an object is deleted
              √ should handle errors while deleting
        
          user model
            √ should create a user with one address
            √ should create a user with two addresses
            √ should fail when no email is passed
            √ should fail when a poorly formed email is passed
        
          model validation
            email validation
              √ returns false with incorrect emails
              √ returns true for valid emails
            object id validation
              √ should return true for valid object ids
              √ should return false for invalid object ids
            optional object id validation
              √ should return true if a valid id is passed
              √ should return true when params are undefined
              √ should return true when params are null
              √ should return true when params are empty string
              √ should return false when params are invalid object id
        
          user service
            handle user creation
              √ should call create user, create auth, and create claims when all pass
              √ should not call create auth or create claims if the user save fails
              √ should not call create claims if auth save fails, but should call delete user
              √ should call both delete user and delete auth if adding claims fails
            user creation
              √ should successfully return a newly created user when passed correct details
              √ should handle errors gracefully
            delete user
              √ should return true when a user is successfully deleted
              √ should return an error object to the user when the delete is unsuccessful
            update user
              √ should update a user to the correct values
              √ should handle update errors gracefully
            handle add address
              √ should handle address validation errors gracefully
              √ should handle user update errors gracefully
              √ should return an saved user object when passed correct details
            add address
              √ should successfully add an address with just a name
              √ should gracefully handle errors
            validate address
              √ should handle a correct validation
              √ should handle invalid responses gracefully
            fetch by user id
              √ should return the user who made the request
              √ should a properly formatted error in case of error
              √ should return a properly formatted error when returned user is undefined
              √ should return a properly formatted error when returned user is empty
            delete address
              √ should delete an address when passed a valid object id
              √ should handle errors in the delete process
            fetch addresses
              √ should return a list of addresses when availible
              √ should alert the user if they have no address records
              √ should deal with errors gracefully
            fetch single address
              √ should return a list of addresses when availible
              √ should alert the user if they have no address records
              √ should deal with errors gracefully
        
          user controller
            create new user
              √ should call res.send with a status of 201 when all details are present
              error checking
                validation
                  √ should call res.send with a status of 500 when there is no user email
                  √ should call res.send with a status of 500 when there is no firebase id
                errors
                  user save operation
                    √ should call res.send with 500 when user save fails because of a thrown error
                    √ should call res.send with 500 when user save fails because of an unthrown error
                  auth save operation
                    √ should call res.send with 500 when auth save fails because of a thrown error
                    √ should call res.send with 500 when auth save fails because of an unthrown error
                  add auth claims
                    √ should call res.send with 500 when adding custom claims fails
                  cleanup
                    √ should return the original error when the delete user operation fails during the auth save operation
                    √ should return the original error if the delete user operation fails during claims creation
                    √ should return the original error if the delete auth operation fails during claims creation
                    √ should return the original error if the both delete auth and delete user operations fail during claims creation
            add address
              √ should call res.send with a status of 200 when adding an address is successful
              √ should handle an error response from add address service
            update user
              √ should a copy of the new user with a status of 200 when user is updated
              √ should return a properly formatted error object in the case of an error
              √ should return a properly formatted error when there are no update params
              √ should return a properly formatted error when update params are empty
            fetch current user
              √ should return 200 when user fetch is successful
              √ should return 500 when user save fails becuase of an error
              √ should return 500 when user save fails without an error
            delete address
              √ should call res.send with a status of 200 when an address is successfully deleted
              √ should call res.send with a status of 500 when an error is thrown during the delete process
              √ should call res.send with 400 when there is no id param
              √ should call res.send with 400 when there are no params
              √ should call res.send with 400 when id param cannot be coerced into an object id
            fetch all addresses
              √ should call res.send with a status of 200 and return all addresses
              √ should call res.send with a status of 500 when an error is thrown during the fetch operation
              √ should call res.send with a status of 200 and a custom message when the user has no addresses
            fetch one address
              √ should call res.send with a status of 200 when an address is successfully fetched
              √ should call res.send with a status of 500 when an error is thrown during the delete process
              √ should call res.send with 400 when there is no id param
              √ should call res.send with 400 when there are no params
              √ should call res.send with 400 when id param cannot be coerced into an object id
        
          error utils
            format error
              √ should correctly return an error object with an error
              √ should correctly return an error object without an error
            format sendable error
              √ should format an error correctly to be delivered to the user when there is an error present
              √ should format an error correctly to be delivered to the user when there is not an error present
            format sendable error from object
              √ should format a sendable error from a created error object containing an error
              √ should format a sendable error from a created error object not containing an error
            update error message
              √ should correctly handle updating an error message when an error is present
              √ should correctly handle updating an error message when an error is not present
        
        
          135 passing (1s)
        
        ----------------------------------------|----------|----------|----------|----------|----------------|
        File                                    |  % Stmts | % Branch |  % Funcs |  % Lines |Uncovered Lines |
        ----------------------------------------|----------|----------|----------|----------|----------------|
        All files                               |    99.16 |    87.42 |      100 |    99.15 |                |
         config                                 |    63.64 |    38.89 |      100 |    63.64 |                |
          config.js                             |    55.56 |    38.89 |      100 |    55.56 |      8,9,11,17 |
          privateConfig.js                      |      100 |      100 |      100 |      100 |                |
         dist/components/User                   |      100 |    97.92 |      100 |      100 |                |
          userController.js                     |      100 |    97.92 |      100 |      100 |            155 |
         dist/components/User/models            |      100 |      100 |      100 |      100 |                |
          User.js                               |      100 |      100 |      100 |      100 |                |
         dist/components/User/models/validation |      100 |      100 |      100 |      100 |                |
          modelValidation.js                    |      100 |      100 |      100 |      100 |                |
         dist/components/User/service           |      100 |      100 |      100 |      100 |                |
          userService.js                        |      100 |      100 |      100 |      100 |                |
         dist/middleware/Auth                   |      100 |    81.82 |      100 |      100 |                |
          authMiddleware.js                     |      100 |    81.82 |      100 |      100 |          37,52 |
         dist/middleware/Auth/models            |      100 |      100 |      100 |      100 |                |
          UserAuth.js                           |      100 |      100 |      100 |      100 |                |
         dist/middleware/Auth/service           |      100 |      100 |      100 |      100 |                |
          authService.js                        |      100 |      100 |      100 |      100 |                |
         dist/models/Address/models             |      100 |      100 |      100 |      100 |                |
          Address.js                            |      100 |      100 |      100 |      100 |                |
         dist/models/Address/service            |      100 |    85.71 |      100 |      100 |                |
          addressService.js                     |      100 |    85.71 |      100 |      100 |             65 |
         dist/util                              |      100 |    66.67 |      100 |      100 |                |
          Logger.js                             |      100 |       50 |      100 |      100 |    20,21,43,56 |
          errorUtils.js                         |      100 |      100 |      100 |      100 |                |
        ----------------------------------------|----------|----------|----------|----------|----------------|

        
### Internal Integration Tests
These are really more Unit Tests, but in this case, they are only performed on a controller function. Controller functions have a one-to-one relationship with routes, so this essentially checks that the internal mechanics of a route works. Any global or route-specific middleware will be ignored in these tests. All external actors (such as database calls, or Firebase) have been stubbed.

    $ npm run internalIntegration
    
    > webdev_backend_one@0.0.1 internalIntegration C:\Users\joewe\projects\node\webdev_backend_one
    > cross-env NODE_ENV=test LOG_LEVEL=silent nyc mocha ./test/integration/internal -name '*_test.js' --recursive --compilers js:babel-core/register -R spec
    
    
    
      user controller
        add new user
          √ should call res.send with a status of 200 when the operation is successful (42ms)
          √ should call res.send with a status of 400 when user save fails
          √ should call res.send with a status of 400 when auth save fails
          √ should call res.send with a status of 400 when addition of custom claims fails
          √ should call res.send with an error of 500 when required auth details are not present
          √ should call res.send with the original error when user deletion fails
          √ should call res.send with the original error when auth deletion fails
          √ should call res.send with the original error when both user and auth deletion fails
          √ should call delete user when save auth fails
          √ should call delete user and delete auth when adding custom claims fails
        update user
          √ should a copy of the new user with a status of 200 when user is updated
          √ should return a properly formatted error object in the case of an error
          √ should return a properly formatted error when there are no update params
          √ should return a properly formatted error when update params are empty
        fetch current user
          √ should return 200 when user fetch is successful
          √ should return 500 when user save fails becuase of an error
          √ should return 500 when user save fails because of undefined value
          √ should return 500 when user save fails because of empty value
        add new address
          √ should successfully add an address
          √ should successfully add an address without geospatial coordinates
          √ should return a 400 error when address addition fails
          √ should return a 400 error when the address does not contain a field 'text'
          √ should return a 400 error when the address contains coordinates that are not numbers (90ms)
        delete address
          √ should call res.send with a status of 200 when an address is successfully deleted
          √ should call res.send with a status of 500 when an error is thrown during the delete process
          √ should call res.send with 400 when there is no id param
          √ should call res.send with 400 when there are no params
          √ should call res.send with 400 when id param cannot be coerced into an object id
        fetch all addresses
          √ should call res.send with a status of 200 and return all addresses
          √ should call res.send with a status of 500 when an error is thrown during the fetch operation
          √ should send a custom message when the user has no addresses
        fetch one address
          √ should call res.send with a status of 200 when an address is successfully fetched
          √ should call res.send with a status of 500 when an error is thrown during the delete process
          √ should call res.send with 400 when there is no id param
          √ should call res.send with 400 when there are no params
          √ should call res.send with 400 when id param cannot be coerced into an object id
    
    
      36 passing (603ms)
    
    ----------------------------------------|----------|----------|----------|----------|----------------|
    File                                    |  % Stmts | % Branch |  % Funcs |  % Lines |Uncovered Lines |
    ----------------------------------------|----------|----------|----------|----------|----------------|
    All files                               |    79.02 |    66.22 |       75 |    78.97 |                |
     config                                 |    63.64 |    38.89 |      100 |    63.64 |                |
      config.js                             |    55.56 |    38.89 |      100 |    55.56 |      8,9,11,17 |
      privateConfig.js                      |      100 |      100 |      100 |      100 |                |
     dist/components/User                   |      100 |    97.92 |      100 |      100 |                |
      userController.js                     |      100 |    97.92 |      100 |      100 |            155 |
     dist/components/User/models            |      100 |      100 |      100 |      100 |                |
      User.js                               |      100 |      100 |      100 |      100 |                |
     dist/components/User/models/validation |    45.45 |        0 |    33.33 |    45.45 |                |
      modelValidation.js                    |    45.45 |        0 |    33.33 |    45.45 |... 29,30,31,33 |
     dist/components/User/service           |      100 |    92.31 |      100 |      100 |                |
      userService.js                        |      100 |    92.31 |      100 |      100 |        149,165 |
     dist/middleware/Auth/models            |      100 |      100 |      100 |      100 |                |
      UserAuth.js                           |      100 |      100 |      100 |      100 |                |
     dist/middleware/Auth/service           |    28.21 |        0 |      100 |    28.21 |                |
      authService.js                        |    28.21 |        0 |      100 |    28.21 |... 245,246,247 |
     dist/models/Address/models             |      100 |      100 |      100 |      100 |                |
      Address.js                            |      100 |      100 |      100 |      100 |                |
     dist/models/Address/service            |      100 |    85.71 |      100 |      100 |                |
      addressService.js                     |      100 |    85.71 |      100 |      100 |             65 |
     dist/util                              |      100 |    66.67 |      100 |      100 |                |
      Logger.js                             |      100 |       50 |      100 |      100 |    20,21,43,56 |
      errorUtils.js                         |      100 |      100 |      100 |      100 |                |
    ----------------------------------------|----------|----------|----------|----------|----------------|

    
### External Integration Tests
These tests are applied to each endpoint. These tests do not stub anything and as such, an appropriate mongo daemon must be running to handle database requests, similarly, a network connection is required for these tests as there will be external requests to authentication services.

    $ npm run externalIntegration
    
    > webdev_backend_one@0.0.1 externalIntegration C:\Users\joewe\projects\node\webdev_backend_one
    > cross-env NODE_ENV=test LOG_LEVEL=silent PORT=9191 nyc mocha ./test/integration/external -name '*_test.js' --recursive --timeout 5000 --compilers js:babel-core/register -R spec
    
    
    
      user controller
        create new user
          √ should return 201 when a user creation is successful (894ms)
          √ should return 401 when no token is attached
        user exists
          √ should fetch the current user (58ms)
          √ should be able to add an address (456ms)
          √ should return 400 when there is no address attached to the request (55ms)
          √ should return 400 when the address does not contain a text field (41ms)
          √ should be able to update the current user (59ms)
          user has an address
            fetch all addresses
              √ should be able to fetch all addresses (39ms)
            fetch one address by id
              √ should be able to fetch one address by id
              √ should return 400 when the object id is invalid format
              √ should return 404 when the address is not found
            delete one address by id
              √ should be able to delete an address by id
              √ should return 400 when the object id is invalid format
    
    
      13 passing (10s)
    
    ----------------------------------------|----------|----------|----------|----------|----------------|
    File                                    |  % Stmts | % Branch |  % Funcs |  % Lines |Uncovered Lines |
    ----------------------------------------|----------|----------|----------|----------|----------------|
    All files                               |    75.93 |    62.89 |    86.36 |    75.79 |                |
     config                                 |    63.64 |    33.33 |      100 |    63.64 |                |
      config.js                             |    55.56 |    33.33 |      100 |    55.56 |      8,9,11,17 |
      privateConfig.js                      |      100 |      100 |      100 |      100 |                |
     dist                                   |    89.36 |      100 |    77.78 |    88.89 |                |
      index.js                              |    85.29 |      100 |       50 |    85.29 | 69,70,71,78,79 |
      router.js                             |      100 |      100 |      100 |      100 |                |
     dist/components/Transaction            |      100 |      100 |      100 |      100 |                |
      index.js                              |      100 |      100 |      100 |      100 |                |
     dist/components/Transaction/routes     |       50 |      100 |       50 |       50 |                |
      index.js                              |       50 |      100 |       50 |       50 |       18,19,20 |
     dist/components/User                   |    73.12 |    70.83 |      100 |    73.12 |                |
      index.js                              |      100 |      100 |      100 |      100 |                |
      userController.js                     |    72.53 |    70.83 |      100 |    72.53 |... 197,198,199 |
     dist/components/User/models            |      100 |      100 |      100 |      100 |                |
      User.js                               |      100 |      100 |      100 |      100 |                |
     dist/components/User/models/validation |    90.91 |       80 |      100 |    90.91 |                |
      modelValidation.js                    |    90.91 |       80 |      100 |    90.91 |             31 |
     dist/components/User/routes            |      100 |      100 |      100 |      100 |                |
      index.js                              |      100 |      100 |      100 |      100 |                |
     dist/components/User/service           |    73.81 |    69.23 |      100 |     73.6 |                |
      userService.js                        |    73.81 |    69.23 |      100 |     73.6 |... 274,275,276 |
     dist/middleware/Auth                   |    84.62 |    81.82 |      100 |    84.62 |                |
      authMiddleware.js                     |    84.62 |    81.82 |      100 |    84.62 |    45,46,53,54 |
     dist/middleware/Auth/models            |      100 |      100 |      100 |      100 |                |
      UserAuth.js                           |      100 |      100 |      100 |      100 |                |
     dist/middleware/Auth/service           |    57.26 |       60 |      100 |    57.26 |                |
      authService.js                        |    57.26 |       60 |      100 |    57.26 |... 245,246,247 |
     dist/models/Address/models             |      100 |      100 |      100 |      100 |                |
      Address.js                            |      100 |      100 |      100 |      100 |                |
     dist/models/Address/service            |    94.44 |    42.86 |      100 |    94.44 |                |
      addressService.js                     |    94.44 |    42.86 |      100 |    94.44 |          62,63 |
     dist/util                              |     92.5 |    66.67 |      100 |     92.5 |                |
      Logger.js                             |      100 |       50 |      100 |      100 |    20,21,43,56 |
      errorUtils.js                         |    86.36 |      100 |      100 |    86.36 |       26,27,28 |
    ----------------------------------------|----------|----------|----------|----------|----------------|


## Extra features.
* Stubbing/Mocking with SinonJS
* External Integration tests run on a seperate port to the main application to allow the tests to be run while the server is running
* Full code coverage with Istanbul/NYC
* Supertest integration for API endpoint testing
* Babel transpilation of tests when run
* Adherence to "silent principal", but has a flag to turn on logging for debugging
* ESLint integration for code style.
