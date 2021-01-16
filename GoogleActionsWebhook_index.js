const {
  conversation,
} = require('@assistant/conversation');
const admin = require('firebase-admin');
const functions = require('firebase-functions');
admin.initializeApp();
const auth = admin.auth();
const db = admin.firestore();
//db.settings({timestampsInSnapshots: true});
const app = conversation({debug: true, clientId: "892085575649-avkk80ihsja7ermtln78vu7u3nug03l0.apps.googleusercontent.com"});

// This handler is called after the user has successfully linked their account.
// Saves the user name in a session param to use it in dialogs, and inits the
// Firestore db to store orders for the user.
app.handle('greeting', conv => {
  let message = 'A wondrous greeting, adventurer! Welcome back to the mythical land of Gryffinberg!';
  if (!conv.user.lastSeenTime) {
    message = 'Welcome to the mythical land of  Gryffinberg! Based on your clothes, you are not from around these lands. It looks like you\'re on your way to an epic journey.';
  }
  conv.add(message);
});

app.handle('ReadReviewText', async (conv) => {
//  const payload = conv.user.params.tokenPayload;
//  const email = "sharathck3@gmail.com";
  const email = conv.user.params.tokenPayload.email;
   //               console.log(' email  ' + conv.user.params.tokenPayload.email);
   //                console.log(' name  ' + conv.user.params.tokenPayload.name);
  
   //       const payload = conv.user.profile.payload;
        var textresponse = "";
        var googleresponse = "";
        var textlength = 0;
        var stopPosition = 0;
        var startPos = 0;
        var readPos = 0;
        var finalreadPos = 0;
        var responselimit = 4000;
  if (email) { 
        var result = await db.collection("tasks").where("uemail", "==", email).where("status", "==", false).orderBy("dueDate", "desc").limit(1).get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                //        console.log(' task  ' +doc.data().title);
                textresponse = doc.data().title + '.';
                if (doc.data().readPosition) {startPos = doc.data().readPosition;}
                if (textresponse.substring(startPos).length > responselimit) {
                    stopPosition = textresponse.substr(startPos, (responselimit - 1)).lastIndexOf(".");
                    if (stopPosition > 0) {
                        readPos = stopPosition + 1;
                    } else {readPos = responselimit;}
                    googleresponse = textresponse.substr(startPos, readPos);
                    finalreadPos = startPos + readPos;
                    db.collection("tasks").doc(doc.id).update({
                        readPosition: finalreadPos
                    });
                } else {
                    googleresponse = textresponse.substring(startPos);
                    db.collection("tasks").doc(doc.id).update({
                            status: true
                        }).then(function () {
                            console.log("Document successfully updated!");
                        })
                        .catch(function (error) {
                            // The document probably doesn't exist.
                            console.error("Error updating document: ", error);
                        });
                }

            });
        });
        if (googleresponse) {
    conv.add(googleresponse);
        } else {
          conv.add('You reading list is empty, please add articles through the website, https://sharathck.github.io');
        }  
  }
  else {
conv.add('Please sign up and save articles through the website, https://sharathck.github.io');
  }

});

exports.ActionsOnGoogleFulfillment = functions.https.onRequest(app);
