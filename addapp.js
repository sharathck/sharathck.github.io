// Problem: User interaction doesn't provide desired results.
// Solution: Add interactivity so the user can manage daily tasks

var taskInput = document.getElementById("new-task");
var addButton = document.getElementsByTagName("button")[0];
var incompleteTasksHolder = document.getElementById("incomplete-tasks");
var db = firebase.firestore();
var currentUid = null;
var useremail = null;

taskInput.addEventListener("keydown", function (e) {
  if (e.keyCode === 13) {
    addTask();
  }
});

//New Task List Item
var createNewTaskElement = function (taskString, taskID) {
  var listItem = document.createElement("li");
  listItem.id = "listid";
  var docid = document.createElement("label");
  var tlabel = document.createElement("label");
  tlabel.id = "tasklabel";

  if (/Android|webOS/i.test(navigator.userAgent)) {
    tlabel.className = "candroid";
  };

  tlabel.innerText = taskString;
  docid.id = "doclabel";
  docid.innerText = taskID;
  docid.style.display = "none";
  listItem.appendChild(docid);
  listItem.appendChild(tlabel);
  return listItem;
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


var ajaxRequest = function () {
  console.log("AJAX Request");
};

// Set the click handler to the addTask function
//addButton.onclick = addTask;
addButton.addEventListener("click", addTask);
addButton.addEventListener("click", ajaxRequest);
