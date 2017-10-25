const mongoose = require('mongoose');
const dbUri    = require('@config/config').db.uri;
const firebaseClient = require('@config/config').firebaseClient;
const firebase = require('firebase');
const userController = require('@user/userController');
module.exports = {
    async mongoSetup() {
        'use strict';
        mongoose.Promise = Promise;
        try {
            const conn = await  mongoose.connect(dbUri, {useMongoClient: true});
            mongoose.connection.on('open', async () => {
                await conn.connection.db.dropDatabase();
            });
            return true;
        } catch (err) {
            return false;
        }
    },
    clearCollections(collectionNames) {
        'use strict';
        try {
            collectionNames.forEach(async elem => {
                await mongoose.connection.collections[elem].remove();
            });
            return true;
        } catch (err) {
            return false;
        }
    },
    closeConnection(){
        'use strict';
        mongoose.connection.close();
    },
    async firebaseInit  (){
        'use strict';
        firebase.initializeApp(firebaseClient);
        await firebase.auth().createUserWithEmailAndPassword('iamauserthatispurelyfortesting@supertestuser.com', 'wwwwww');
        return firebase.auth().currentUser.getIdToken(true);
    },
    async firebaseInitWithUser(){
        'use strict';

    },
    async firebaseTeardown(){
        'use strict';
        try {
            await firebase.auth().currentUser.delete();
            return true;
        } catch (e) {
            return false;
        }
    }
};
