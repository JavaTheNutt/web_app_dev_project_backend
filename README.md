# Finance Tracker Backend
*A NodeJS REST API*

## Overview
This GitHub repository contains the source code for the backend of my project for both my Web Applications Development and Agile Software Practices modules. 

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
