'use strict';

const {dialogflow, SignIn} = require('actions-on-google');
const functions = require('firebase-functions');
const app = dialogflow({debug:true,clientId:'833375176003-qb3r57grqhtvg231dph2bm7hkvr5002i.apps.googleusercontent.com'});
const admin = require('firebase-admin');
admin.initializeApp();

app.intent('Default Welcome Intent', conv => {
 conv.ask(new SignIn('To get your account details'));
});
// Create a Dialogflow intent 'Get Signin' with the 'actions_intent_SIGN_IN' event
app.intent('Get Signin', async (conv, params, signin) => {
  if (signin.status === 'OK') {
    const payload = conv.user.profile.payload;
    var db = admin.firestore();
    var textresponse = "<speak>";
    var result = await db.collection("tasks").where("uemail", "==", payload.email).where("status", "==", false).get().then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
//        console.log(' task  ' +doc.data().title);
        textresponse += doc.data().title + '.<break time="1400ms"/>'; 
  });
  });
    if (textresponse == "<speak>") {
    textresponse = "";
    }
    else
    {
     textresponse += "</speak>";
    }
//    console.log(' response  ' + textresponse);
    if (textresponse) {
    conv.close(textresponse);
    }
    else
    {
    conv.ask('<speak>please speak your new task</speak>');
    }
    } else {
    conv.close('Please Sign In before using this Google Assistant action');
  }
});

app.intent('FirstAnswer', (conv, {tresponse}) => {
  if (signin.status === 'OK') {
    const userresponse = tnumber;
    const payload = conv.user.profile.payload;
    conv.close(userresponse + ' is added');
  }
});


exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);