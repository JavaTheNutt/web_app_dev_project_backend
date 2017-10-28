const mongoose = require('mongoose');
const firebaseClient = require('@config/config').firebaseClient;
const firebase = require('firebase');
const userService = require('@user/service/userService');
const addressService = require('@Address/service/addressService');
module.exports = {
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
  async userInit(){
    'use strict';
    const id = firebase.auth().currentUser.uid;
    const email = firebase.auth().currentUser.email;
    const user = await userService.handleCreateUser(email, id);
    return user._id;
  },
  async addressInit(userId){
    'use strict';
    const address = await addressService.validateAddress({text: '321, fake street', loc:{type:'Point', coordinates:[25, 30]}});
    await userService.addAddress(userId, address);
    return address._id;
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
