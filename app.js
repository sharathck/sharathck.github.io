 // Initialize Firebase
  // TODO: Replace with your project's customized code snippet
  var config = {
    apiKey: "AIzaSyAQ--7BYrBnmjsdX8LvNIOu8uIE7alDsAE",
    authDomain: "listspeaker.firebaseapp.com",
    databaseURL: "https://listspeaker.firebaseio.com",
    projectId: "listspeaker",
    storageBucket: "listspeaker.appspot.com",
    messagingSenderId: "576657502351"
  };
  firebase.initializeApp(config);
  firebase.firestore().enablePersistence()
  .then(function () {
   // Initialize Cloud Firestore through firebase
   console.log("Cache is enabled");
 })
  .catch(function(err) {
      if (err.code == 'failed-precondition') {
console.log("no cache on this browser");
      } else if (err.code == 'unimplemented') {
        console.log("no cache on this browser");
      }
  });
// Subsequent queries will use persistence, if it was enabled successfully
  //Handle Account Status

firebase.auth().onAuthStateChanged(user => {
  if(user) {}
  else{
    window.location = 'signin.html';
  }
});

// Problem: User interaction doesn't provide desired results.
// Solution: Add interactivity so the user can manage daily tasks
var taskInput = document.getElementById("new-task");
var addButton = document.getElementsByTagName("button")[0];
var incompleteTasksHolder = document.getElementById("incomplete-tasks");
var completedTasksHolder = document.getElementById("completed-tasks");
var futureTasksHolder = document.getElementById("future-tasks");
var db = firebase.firestore();
var currentUid = null;
var useremail = null;


document.getElementById("new-task").focus();

taskInput.addEventListener("keydown", function (e) {
  if (e.keyCode === 13) {
    addTask();
  }
});

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
    document.querySelector("#assist-button").className = "massistbutton";
    document.querySelector("#signout-button").className = "msignoutbutton";
    document.querySelector("#show-complete-button").className = "mshowcompletedbutton";
    document.querySelector("#show-future-button").className = "mshowcompletedbutton";
    document.querySelector("#signoutimage").className = "iphsignoutimage";
    document.querySelector("#addimage").className = "iphaddimage";
    document.querySelector("#assistimage").className = "iphaddimage";
  };
  if (/Android|webOS/i.test(navigator.userAgent)) {
    document.querySelector("#new-task").className = "mnewinput";
    document.querySelector("#add-button").className = "androidaddbutton";
    document.querySelector("#assist-button").className = "androidassistbutton";
    document.querySelector("#signout-button").className = "androidsignoutbutton";
    document.querySelector("#show-complete-button").className = "mshowcompletedbutton";
    document.querySelector("#show-future-button").className = "mshowcompletedbutton";
  };
  firebase.auth().onAuthStateChanged(function (user) {
    // onAuthStateChanged listener triggers every time the user ID token changes.  
    // This could happen when a new user signs in or signs out.  
    // It could also happen when the current user ID token expires and is refreshed.  

    if (user && user.uid != currentUid) {
      // Update the UI when a new user signs in.  
      // Otherwise ignore if this is a token refresh.  
      // Update the current user UID.  
      currentUid = user.uid;
      useremail = user.email;
      var currDate = new Date();
      currDate.setHours(23);
      currDate.setMinutes(59);

      firebase.firestore().disableNetwork();
      console.log('from cache  -  ' + useremail + ';');
      db.collection("tasks").where("uemail", "==", useremail).where("dueDate", "<=", currDate).where("status", "==", false).orderBy("dueDate", "desc").get()
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            console.log(querySnapshot);
            console.log('local   - ' + doc.data().title + doc.data().dueDate);
            var listItem = createNewTaskElement(doc.data().title, doc.id);
            //Append listItem to incompleteTasksHolder
            incompleteTasksHolder.appendChild(listItem);
            bindTaskEvents(listItem, taskCompleted);
          });
          console.log('from server  -  ' + useremail + ';');
          firebase.firestore().enableNetwork();
          db.collection("tasks").where("uemail", "==", useremail).where("dueDate", "<=", currDate).where("status", "==", false).orderBy("dueDate", "desc").get()
            .then((squerySnapshot) => {
              squerySnapshot.forEach((sdoc) => {
                //   console.log('server   - ' + sdoc.data().title);
                var found = false;
                for (var i = 0; i < querySnapshot.docs.length; i++) {
                  console.log('loop server  -  ' + sdoc.data().title + ';');
                  if (querySnapshot.docs[i].id == sdoc.id) {
                    //    console.log('MATCH server  -  ' + sdoc.data().title + ';');
                    found = true;
                    break;
                  }
                }
                if (found == false) {
                  var listItem = createNewTaskElement(sdoc.data().title, sdoc.id);
                  //Append listItem to incompleteTasksHolder
                  //   console.log('FINAL server  -  ' + sdoc.data().title + ';');
                  incompleteTasksHolder.appendChild(listItem);
                  bindTaskEvents(listItem, taskCompleted);
                }
              });
              querySnapshot.forEach((ddoc) => {
                var found = false;
                for (var i = 0; i < squerySnapshot.docs.length; i++) {
                  //   console.log('DELETE loop server  -  ' + ddoc.data().title + ';');
                  if (squerySnapshot.docs[i].id == ddoc.id) {
                    //   console.log('DELETE MATCH server  -  ' + ddoc.data().title + ';');
                    found = true;
                    break;
                  }
                }
                if (found == false) {
                  //     var listItem = createNewTaskElement(ddoc.data().title, sdoc.id);
                  //Append listItem to incompleteTasksHolder
                  //     console.log('no match Delete from cache  -  ' + ddoc.data().title + ';');
                  location.reload();
                }
              });
            });
        });



    } else {
      // Sign out operation. Reset the current user UID.  
      currentUid = null;
      console.log("no user signed in");
    }
  });


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

var loadfuturetodolist = function () {
  document.getElementById("show-future-button").disabled = true;
  db.collection("tasks").where("uemail", "==", "sharathck3@gmail.com").where("dueDate", ">", new Date()).where("status", "==", false).orderBy("dueDate", "asc").get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      console.log(`${doc.id} => ${doc.data()}`);
      console.log('Future : ' + doc.data().title);
      var listItem = createNewTaskElement(doc.data().title, doc.id);
      listItem.querySelector("#checkfield").disabled = true;
      //Append listItem to completedTasksHolder
      futureTasksHolder.appendChild(listItem);
      bindTaskEvents(listItem, taskCompleted);
    });
  });
};

var AppSignout = function () {
  firebase.auth().signOut().then(function () {
    console.log('Signed Out');
  }, function (error) {
    console.error('Sign Out Error', error);
  });
  window.location = 'signin.html'; //After successful logout, user will be redirected to home.html
};

// Add a new task
var addTask = function () {
  if (useremail != null) {
    console.log("New Add task...");
    var inputvaluetask = taskInput.value;
    var nextm = new Date();
    var nexty = new Date();
    var d = new Date();
    var nextday = new Date(d.setDate(d.getDate() + 1));
    var day = new Array();
    var recurMessage = '';

    day[0] = "Sunday";
    day[1] = "Monday";
    day[2] = "Tuesday";
    day[3] = "Wednesday";
    day[4] = "Thursday";
    day[5] = "Friday";
    day[6] = "Saturday";
    var month = new Array();
    month[0] = "January";
    month[1] = "February";
    month[2] = "March";
    month[3] = "April";
    month[4] = "May";
    month[5] = "June";
    month[6] = "July";
    month[7] = "August";
    month[8] = "September";
    month[9] = "October";
    month[10] = "November";
    month[11] = "December";
    var n = month[d.getMonth()];
    var recurType = 'n';
    var recurDay = 'na';
    var recurCount = 0;
    var startPos = 0;
    var dueDate;
    if (chrono.parseDate(inputvaluetask)) {
      dueDate = chrono.parseDate(inputvaluetask);
      dueDate.setHours(00);
      dueDate.setMinutes(00);
      recurMessage = 'Task is added with due date ' + month[dueDate.getMonth()] + ' ' + dueDate.getDate();
      console.log(' Chrono non-recur dueDate ' + dueDate);
    } else {
      dueDate = new Date();
    };
    var everyPosition = 0;
    var recurString;
    everyPosition = inputvaluetask.toLowerCase().lastIndexOf('every week');
    if (everyPosition > 1) {
      startPos = everyPosition;
      everyPosition += 10;
    } else {
      everyPosition = inputvaluetask.toLowerCase().lastIndexOf('weekly');
      if (everyPosition > 1) {
        startPos = everyPosition;
        everyPosition += 6;
      } else {
        everyPosition = inputvaluetask.toLowerCase().lastIndexOf('every');
        if (everyPosition > 1) {
          startPos = everyPosition;
          everyPosition += 5;
        }
      }
    };
    if (everyPosition > 4) {
      finalTask = (inputvaluetask.substring(0, startPos)).trim();
      recurString = (inputvaluetask.substring(everyPosition, inputvaluetask.length)).trim().toLowerCase();
      recurType = 'w';
      recurCount = 1;
      ChronoDate = chrono.parseDate(recurString, new Date(), {
        forwardDate: true
      });
      if (ChronoDate) {
        dueDate = ChronoDate
      };
      recurMessage = 'Task is added with due date ' + month[dueDate.getMonth()] + ' ' + dueDate.getDate() + ' and weekly recurrence';
    };
    everyPosition = inputvaluetask.toLowerCase().lastIndexOf('every month');
    if (everyPosition > 1) {
      startPos = everyPosition;
      everyPosition += 11;
    } else {
      everyPosition = inputvaluetask.toLowerCase().lastIndexOf('monthly');
      if (everyPosition > 1) {
        startPos = everyPosition;
        everyPosition += 7;
      }
    };
    if (everyPosition > 6) {
      finalTask = (inputvaluetask.substring(0, startPos)).trim();
      recurString = (inputvaluetask.substring(everyPosition, inputvaluetask.length)).trim().toLowerCase();
      recurType = 'm';
      recurCount = 1;
      var curDate = new Date();
      ChronoDate = chrono.parseDate(recurString + ' ' + month[curDate.getMonth()]);
      if (ChronoDate) {
        dueDate = ChronoDate
      };
      recurMessage = 'Task is added with due date ' + month[dueDate.getMonth()] + ' ' + dueDate.getDate() + ' and monthly recurrence';
    };

    everyPosition = inputvaluetask.toLowerCase().lastIndexOf('every year');
    if (everyPosition > 1) {
      startPos = everyPosition;
      everyPosition += 10;
    } else {
      everyPosition = inputvaluetask.toLowerCase().lastIndexOf('yearly');
      if (everyPosition > 1) {
        startPos = everyPosition;
        everyPosition += 6;
      }
    };
    if (everyPosition > 5) {
      finalTask = (inputvaluetask.substring(0, startPos)).trim();
      recurString = (inputvaluetask.substring(everyPosition, inputvaluetask.length)).trim().toLowerCase();
      recurType = 'y';
      recurCount = 1;
      ChronoDate = chrono.parseDate(recurString, new Date(), {
        forwardDate: true
      });
      if (ChronoDate) {
        dueDate = ChronoDate
      };
      recurMessage = 'Task is added with due date ' + month[dueDate.getMonth()] + ' ' + dueDate.getDate() + ' and yearly recurrence';
    }
    console.log(' after recur dueDate ' + dueDate);

    if (recurType == 'n') {
      finalTask = inputvaluetask;
    } else {
      dueDate.setHours(00);
      dueDate.setMinutes(00);
    };
    recurDay = day[dueDate.getDay()];
    var searcht = finalTask.toLowerCase();
    searcht = searcht.replace(/ /g, '');
db.collection("tasks").add({
        uid: currentUid,
        uemail: useremail,
        title: finalTask,
        dateAdded: new Date(),
        dueDate: dueDate,
        recurType: recurType,
        recurDay: recurDay,
        recurCount: recurCount,
        searchTitle: searcht,
        status: false
      })
      .then(function (docRef) {
        var listItem = createNewTaskElement(inputvaluetask, docRef.id);
        //Append listItem to incompleteTasksHolder
        incompleteTasksHolder.appendChild(listItem);
        bindTaskEvents(listItem, taskCompleted);
        console.log("Document written with ID: ", docRef.id);
        if (recurMessage) {
          alert(recurMessage);
        };
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

  db.collection("tasks").doc(listItem.querySelector("#doclabel").innerText).get().then(function (documentSnapshot) {
    var rectype = documentSnapshot.data().recurType;
    var tdueDate = new Date(documentSnapshot.data().dueDate.toDate());
    console.log('recurType  tdueDate ' + rectype + ' ' + tdueDate);

    if (rectype == 'n') {
      db.collection("tasks").doc(listItem.querySelector("#doclabel").innerText).update({
        status: true
      });
    } else {
      var d = new Date();
      var nextday = new Date(d.setDate(d.getDate() + 1));
      var day = new Array();
      day[0] = "Sunday";
      day[1] = "Monday";
      day[2] = "Tuesday";
      day[3] = "Wednesday";
      day[4] = "Thursday";
      day[5] = "Friday";
      day[6] = "Saturday";

      var recurDue = new Date();
      if (rectype == 'w') {
        ChronoDate = chrono.parseDate(day[tdueDate.getDay()], nextday, {
          forwardDate: true
        });
        if (ChronoDate) {
          recurDue = ChronoDate;
        };
      }
      if (rectype == 'm') {
        recurDue = new Date(tdueDate.setMonth(tdueDate.getMonth() + 1))
      }
      if (rectype == 'y') {
        recurDue = new Date(tdueDate.setYear(tdueDate.getFullYear() + 1))
      }
      console.log('recurDue ' + recurDue);

      db.collection("tasks").doc(listItem.querySelector("#doclabel").innerText).update({
        dueDate: recurDue
      })
    .then(function () {
      console.log("Document successfully updated!");
    })
    .catch(function (error) {
      // The document probably doesn't exist.
      console.error("Error updating document: ", error);
    });
    }
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
  console.log(listItem.querySelector("#doclabel").innerText);
  console.log(listItem.querySelector("#tasklabel").innerText);

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



// list
/*var listTasks = function() {
  console.log("list tasks...");
  //Create a new list item with the text from #new-task:
  var listItem = createNewTaskElement("Test this task first","dummayID");
  //Append listItem to incompleteTasksHolder
  incompleteTasksHolder.appendChild(listItem);
  bindTaskEvents(listItem, taskCompleted);
  taskInput.value = "";
};*/
// Edit an existing task
/*
var editTask = function() {
  console.log("Edit Task...");
  var listItem = this.parentNode;
  var editInput = listItem.querySelector("input[type=text]");
  var label = listItem.querySelector("label");
  var containsClass = listItem.classList.contains("editMode");
  //if the class of the parent is .editMode
  if (containsClass) {
    //switch from .editMode
    //Make label text become the input's value
    label.innerText = editInput.value;
  } else {
    //Switch to .editMode
    //input value becomes the label's text
    editInput.value = label.innerText;
  }
  // Toggle .editMode on the parent
  listItem.classList.toggle("editMode");
};
*/
