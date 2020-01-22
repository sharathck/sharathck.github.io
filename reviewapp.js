// Initialize Firebase
// TODO: Replace with your project's customized code snippet
var config = {
    apiKey: "AIzaSyBNeonGTfBV2QhXxkufPueC-gQLCrcsB08",
    authDomain: "reviewtext-ad5c6.firebaseapp.com",
    databaseURL: "https://reviewtext-ad5c6.firebaseio.com",
    projectId: "reviewtext-ad5c6",
    storageBucket: "reviewtext-ad5c6.appspot.com",
    messagingSenderId: "892085575649",
    appId: "1:892085575649:web:b57abe0e1438f10dc6fca0"
};
firebase.initializeApp(config);

// Subsequent queries will use persistence, if it was enabled successfully
//Handle Account Status
firebase.auth().onAuthStateChanged(user => {
    if (user) { }
    else {
        window.location = 'reviewsignin.html';
    }
});

// Problem: User interaction doesn't provide desired results.
// Solution: Add interactivity so the user can manage daily tasks
var taskInput = document.getElementById("new-task");
var addButton = document.getElementsByTagName("button")[0];
var incompleteTasksHolder = document.getElementById("incomplete-tasks");
var completedTasksHolder = document.getElementById("completed-tasks");
var db = firebase.firestore();
var currentUid = null;
var useremail = null;


document.getElementById("new-task").focus();

taskInput.addEventListener("keydown", function (e) {
    if (e.keyCode === 13) {
        addTask();
    }
});

function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}

var addmode = getUrlVars()["addmode"];
var numarticles = 10;
if ( getUrlVars()["articles"] !== null ) { 
numarticles = parseInt(getUrlVars()["articles"]);
};
//console.log(' addmode ' + addmode);
//New Task List Item
var createNewTaskElement = function (taskString, taskID) {
    var listItem = document.createElement("li");
    listItem.id = "listid";
    var checkBox = document.createElement("input"); // checkbox
    var docid = document.createElement("label");
    var tlabel = document.createElement("label");
    var deleteButton = document.createElement("button");
    checkBox.type = "checkbox";
    checkBox.id = "checkfield";


    tlabel.id = "tasklabel";

    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        tlabel.className = "cmobile";
        deleteButton.className = "mdelete";
        checkBox.className = "mcheckbox";
    } else {
        tlabel.className = "cdesktop";
        deleteButton.className = "delete";
        checkBox.className = "ccheckbox";
    };

    if (/Android|webOS/i.test(navigator.userAgent)) {
        tlabel.className = "candroid";
    };

    tlabel.innerText = taskString;


    docid.id = "doclabel";
    docid.innerText = taskID;
    docid.style.display = "none";

    deleteButton.id = "deletefield";
    deleteButton.innerHTML = "<img src='delete.svg' width ='250%'>";

    listItem.appendChild(checkBox);
    listItem.appendChild(docid);
    listItem.appendChild(tlabel);
    listItem.appendChild(deleteButton);

    return listItem;
};

var loadtodolist = function () {
    if (/iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        document.querySelector("#new-task").className = "imnewinput";
        document.querySelector("#add-button").className = "maddbutton";
        document.querySelector("#signout-button").className = "msignoutbutton";
        document.querySelector("#show-complete-button").className = "mshowcompletedbutton";
        document.querySelector("#signoutimage").className = "iphsignoutimage";
        document.querySelector("#addimage").className = "iphaddimage";
    };
    if (/Android|webOS/i.test(navigator.userAgent)) {
        document.querySelector("#new-task").className = "mnewinput";
        document.querySelector("#add-button").className = "androidaddbutton";
        document.querySelector("#signout-button").className = "androidsignoutbutton";
        document.querySelector("#show-complete-button").className = "mshowcompletedbutton";
    };
    console.log(' Loadtodolist funciton ' + ' ; currentUid ' + currentUid);

    firebase.auth().onAuthStateChanged(function (user) {
        // onAuthStateChanged listener triggers every time the user ID token changes.  
        // This could happen when a new user signs in or signs out.  
        // It could also happen when the current user ID token expires and is refreshed.  
        console.log(' Before If ' + ' useremail - ' + useremail + ' ; user.uid ' + user.uid + '; currentUid ' + currentUid);

        if (user && user.uid != currentUid) {
            // Update the UI when a new user signs in.  
            // Otherwise ignore if this is a token refresh.  
            // Update the current user UID.  
            currentUid = user.uid;
            useremail = user.email;
            console.log(' useremail - ' + useremail + ' ; user.uid ' + user.uid + ' ; currentUid ' + currentUid);
            var currDate = new Date();
            currDate.setHours(23);
            currDate.setMinutes(59);
            db.collection("tasks").where("uemail", "==", useremail).where("status", "==", false).orderBy("dueDate", "desc").limit(numarticles).get()
                .then((querySnapshot) => {
                    querySnapshot.forEach((doc) => {
                        //console.log(querySnapshot);
                        //console.log(doc.data().title + doc.data().dueDate);
                        //console.log(' inside addmode ' + addmode);
                        if ( addmode == 'yes') {
                        var listItem = createNewTaskElement(doc.data().title.substring(0, 22), doc.id);}
                        else {var listItem = createNewTaskElement(doc.data().title, doc.id);}
                        //Append listItem to incompleteTasksHolder
                        incompleteTasksHolder.appendChild(listItem);
                        bindTaskEvents(listItem, taskCompleted);
                    });

                });
        }
        else {
            // Sign out operation. Reset the current user UID.  
            currentUid = null;
            console.log("no user signed in");
        }
    })
};


var loadcompletedtodolist = function () {
    console.log('completing ' + useremail);
    document.getElementById("show-complete-button").disabled = true;
    if (useremail != null) {
        db.collection("tasks").where("uemail", "==", useremail).where("status", "==", true).get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                //      console.log(`${doc.id} => ${doc.data()}` );
                console.log('completed' + doc.data().title);
                //     console.log('completed' + useremail + ' ' + doc.data().uid);
                var listItem = createNewTaskElement(doc.data().title, doc.id);
                listItem.querySelector("#checkfield").checked = true;

                //Append listItem to completedTasksHolder
                completedTasksHolder.appendChild(listItem);
                bindTaskEvents(listItem, taskIncomplete);
            });
        });
    }
};

var AppSignout = function () {
    firebase.auth().signOut().then(function () {
        console.log('Signed Out');
    }, function (error) {
        console.error('Sign Out Error', error);
    });
    window.location = 'reviewsignin.html'; //After successful logout, user will be redirected to home.html
};

// Add a new task
var addTask = function () {
    if (useremail != null) {
        console.log("New Add task...");
        var inputvaluetask = taskInput.value;
        db.collection("tasks").add({
            uemail: useremail,
            title: inputvaluetask,
            dueDate: new Date(),
            status: false
        })
            .then(function (docRef) {
                var listItem = createNewTaskElement(inputvaluetask, docRef.id);
                //Append listItem to incompleteTasksHolder
                incompleteTasksHolder.appendChild(listItem);
                bindTaskEvents(listItem, taskCompleted);
                console.log("Document written with ID: ", docRef.id);
            })
            .catch(function (error) {
                console.error("Error adding document: ", error);
            });

        taskInput.value = "";
    }
};


// Delete an existing task
var deleteTask = function () {
    var listItem = this.parentNode;
    var ul = listItem.parentNode;
    console.log("Delete task");
    console.log(listItem.querySelector("#doclabel").innerText);
    console.log(listItem.querySelector("#tasklabel").innerText);
    db.collection("tasks").doc(listItem.querySelector("#doclabel").innerText).delete().then(function () {
        console.log("Document successfully deleted!");
    }).catch(function (error) {
        console.error("Error removing document: ", error);
    });
    //Remove the parent list item from the ul
    ul.removeChild(listItem);

};

// Mark a task as complete
var taskCompleted = function () {
    //Append the task list item to the #completed-tasks
    var listItem = this.parentNode;
    console.log("Mark completed");

    db.collection("tasks").doc(listItem.querySelector("#doclabel").innerText).update({
        status: true
    }).then(function () {
        console.log("Document successfully updated!");
    })
        .catch(function (error) {
            // The document probably doesn't exist.
            console.error("Error updating document: ", error);
        });
completedTasksHolder.appendChild(listItem);
bindTaskEvents(listItem, taskIncomplete);
};

// Mark a task as incomplete
var taskIncomplete = function () {
    console.log("Task Incomplete...");
    // When checkbox is unchecked
    // Append the task list item #incomplete-tasks
    var listItem = this.parentNode;
    console.log("Mark incomplete");

    db.collection("tasks").doc(listItem.querySelector("#doclabel").innerText).update({
        status: false
    })
        .then(function () {
            console.log("Document successfully updated!");
        })
        .catch(function (error) {
            // The document probably doesn't exist.
            console.error("Error updating document: ", error);
        });

    incompleteTasksHolder.appendChild(listItem);
    bindTaskEvents(listItem, taskCompleted);
};

var bindTaskEvents = function (taskListItem, checkBoxEventHandler) {
    console.log("Bind list item events");
    //select taskListItem's children
    var checkBox = taskListItem.querySelector("#checkfield");
    //  var editButton = taskListItem.querySelector("button.edit");
    var deleteButton = taskListItem.querySelector("#deletefield");

    // bind editTask to edit button
    // editButton.onclick = editTask;
    //bind deleteTask to delete button
    deleteButton.onclick = deleteTask;

    //bind checkBoxEventHandler to checkbox
    checkBox.onchange = checkBoxEventHandler;
};

var ajaxRequest = function () {
    console.log("AJAX Request");
};

// Set the click handler to the addTask function
//addButton.onclick = addTask;
addButton.addEventListener("click", addTask);
addButton.addEventListener("click", ajaxRequest);

// Cycle over the incompleteTaskHolder ul list items
for (var i = 0; i < incompleteTasksHolder.children.length; i++) {
    // bind events to list item's children (taskCompleted)
    bindTaskEvents(incompleteTasksHolder.children[i], taskCompleted);
}
// Cycle over the completeTaskHolder ul list items
for (var i = 0; i < completedTasksHolder.children.length; i++) {
    // bind events to list item's children (taskIncompleted)
    bindTaskEvents(completedTasksHolder.children[i], taskIncomplete);
}
