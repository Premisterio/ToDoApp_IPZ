'use strict';

// select all DOM elements
const headerTime = document.querySelector("[data-header-time]");
const menuTogglers = document.querySelectorAll("[data-menu-toggler]");
const menu = document.querySelector("[data-menu]");
const themeBtns = document.querySelectorAll("[data-theme-btn]");
const modalTogglers = document.querySelectorAll("[data-modal-toggler]");
const welcomeNote = document.querySelector("[data-welcome-note]");
const taskList = document.querySelector("[data-task-list]");
const taskInput = document.querySelector("[data-task-input]");
const modal = document.querySelector("[data-info-modal]");
let taskItem = {};
let taskRemover = {};

// store current date from build-in date object
const date = new Date();

// import task complete sound
const taskCompleteSound = new Audio("./assets/sounds/task-complete.mp3");
const trashSound = new Audio("./assets/sounds/trash.mp3");

/**
 * convert weekday number to weekday name
 * totalParameter: 1;
 * parameterValue: <number> 0-6;
 */
const getWeekDayName = function (dayNumber) {
  switch (dayNumber) {
    case 0:
      return "Неділя";
    case 1:
      return "Понеділок";
    case 2:
      return "Вівторок";
    case 3:
      return "Середа";
    case 4:
      return "Четвер";
    case 5:
      return "П'ятниця";
    case 6:
      return "Субота";
    default:
      return "Не валідний день";
  }
}

/**
 * convert month number to month name
 * totalParameter: 1;
 * parameterValue: <number> 0-11;
 */
const getMonthName = function (monthNumber) {
  switch (monthNumber) {
    case 0:
      return "Січ.";
    case 1:
      return "Лют.";
    case 2:
      return "Бер.";
    case 3:
      return "Квіт.";
    case 4:
      return "Трав.";
    case 5:
      return "Черв.";
    case 6:
      return "Лип.";
    case 7:
      return "Серп.";
    case 8:
      return "Вер.";
    case 9:
      return "Жовт.";
    case 10:
      return "Лист.";
    case 11:
      return "Груд.";
    default:
      return "Не валідний місяць";
  }
}

// store weekday name, month name & month-of-day number
const weekDayName = getWeekDayName(date.getDay());
const monthName = getMonthName(date.getMonth());
const monthOfDay = date.getDate();

// update headerTime date
headerTime.textContent = `${weekDayName}, ${monthName} ${monthOfDay}`;

/**
 * toggle active class on element
 * totalParameter: 1;
 * parameterValue: <object> elementNode;
 */
const elemToggler = function (elem) { elem.classList.toggle("active"); }

/**
 * toggle active class on multiple elements
 * totalParameter: 2;
 * parameterValue: <object> elementNode, <function> any;
 */
const addEventOnMultiElem = function (elems, event) {
  for (let i = 0; i < elems.length; i++) {
    elems[i].addEventListener("click", event);
  }
}

/**
 * create taskItem elementNode and return it
 * totalParameter: 2;
 * parameterValue: <string> taskText, <boolean> isCompleted;
 */
const taskItemNode = function (taskText, isCompleted = false) {
  const createTaskItem = document.createElement("li");
  createTaskItem.classList.add("task-item");
  createTaskItem.setAttribute("data-task-item", "");
  if (isCompleted) {
    createTaskItem.classList.add("complete");
  }
  createTaskItem.innerHTML = `
    <button class="item-icon" data-task-remove="complete">
      <span class="check-icon"></span>
    </button>
    <p class="item-text">${taskText}</p>
    <button class="item-action-btn" aria-label="Видалити завдання" data-task-remove="delete">
      <ion-icon name="trash-outline" aria-hidden="true"></ion-icon>
    </button>
  `;
  return createTaskItem;
}

/**
 * task input validation
 * totalParameter: 1;
 * parameterValue: <string> any
 */
const taskInputValidation = function (taskIsValid) {
  if (taskIsValid) {
    /**
     * if there is an existing task
     * then the new task will be added before it
     */
    if (taskList.childElementCount > 0) {
      taskList.insertBefore(taskItemNode(taskInput.value), taskItem[0]);
    } else {
      taskList.appendChild(taskItemNode(taskInput.value));
    }

    // after adding task on taskList, input field should be empty
    taskInput.value = "";

    // hide the welcome note
    welcomeNote.classList.add("hide");

    // update taskItem DOM selection
    taskItem = document.querySelectorAll("[data-task-item]");
    taskRemover = document.querySelectorAll("[data-task-remove]");

    // save tasks to localStorage
    saveTasks();
  } else {
    // if user pass any falsy value like(0, "", undefined, null, NaN)
    console.log("Поле має бути заповнене!");
  }
}

/**
 * if there is an existing task,
 * the welcome note will be hidden
 */
const removeWelcomeNote = function () {
  if (taskList.childElementCount > 0) {
    welcomeNote.classList.add("hide");
  } else {
    welcomeNote.classList.remove("hide");
  }
}

/**
 * removeTask when click on delete button or check button
 */
const removeTask = function () {
  // select clicked taskItem
  const parentElement = this.parentElement;

  if (this.dataset.taskRemove === "complete") {
    parentElement.classList.add("complete"); // add "complete" class on taskItem
    taskCompleteSound.currentTime = 0; // reset audio to start
    taskCompleteSound.play(); // play taskCompleteSound

    // update task item state
    const taskText = parentElement.querySelector(".item-text").textContent;
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    const updatedTasks = tasks.map(task => {
      if (task.text === taskText) {
        return { ...task, completed: true };
      }
      return task;
    });
    localStorage.setItem("tasks", JSON.stringify(updatedTasks));

    // hide the welcome note if no more tasks
    if (taskList.childElementCount === 0) {
      welcomeNote.classList.remove("hide");
    }
  } else if (this.dataset.taskRemove === "delete") {
    parentElement.remove(); // remove taskItem from DOM
    trashSound.play(); // play delete sfx

    // update localStorage
    const taskText = parentElement.querySelector(".item-text").textContent;
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    const updatedTasks = tasks.filter(task => task.text !== taskText);
    localStorage.setItem("tasks", JSON.stringify(updatedTasks));

    // show welcome note if no tasks remain
    if (taskList.childElementCount === 0) {
      welcomeNote.classList.remove("hide");
    }
  }
}

/**
 * addTask function
 */
const addTask = function () {
  // check the task input validation
  taskInputValidation(taskInput.value);

  // addEvent to all taskItem checkbox and delete button
  taskRemover = document.querySelectorAll("[data-task-remove]");
  addEventOnMultiElem(taskRemover, removeTask);
}

/**
 * save tasks to localStorage
 */
const saveTasks = function () {
  const tasks = [];
  taskItem.forEach(item => {
    tasks.push({
      text: item.querySelector(".item-text").textContent,
      completed: item.classList.contains("complete")
    });
  });
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

/**
 * load tasks from localStorage
 */
const loadTasks = function () {
  const tasks = JSON.parse(localStorage.getItem("tasks"));
  if (tasks) {
    tasks.forEach(task => {
      taskList.appendChild(taskItemNode(task.text, task.completed));
    });

    // update taskItem DOM selection
    taskItem = document.querySelectorAll("[data-task-item]");

    // addEvent to all taskItem checkbox and delete button
    taskRemover = document.querySelectorAll("[data-task-remove]");
    addEventOnMultiElem(taskRemover, removeTask);

    // hide the welcome note
    if (taskList.childElementCount > 0) {
      welcomeNote.classList.add("hide");
    }
  }
}

/**
 * add keypress listener on taskInput
 */
taskInput.addEventListener("keypress", function (e) {
  // addTask if user press 'Enter'
  switch (e.key) {
    case "Enter":
      addTask();
      break;
  }
});

// toggle active class on menu when click on menuBtn or dropdownLink 
const toggleMenu = function () { elemToggler(menu); }
addEventOnMultiElem(menuTogglers, toggleMenu);

// toggle active class on modal when click on dropdownLink or modal Ok button
const toggleModal = function () { elemToggler(modal); }
addEventOnMultiElem(modalTogglers, toggleModal);

/**
 * add "loaded" class on body when website is fully loaded
 */
window.addEventListener("load", function () {
  document.body.classList.add("loaded");
  loadTasks(); // load tasks from localStorage
});

/**
 * change body background when click on any themeBtn
 */
const themeChanger = function () {
  // store hue value from clicked themeBtn
  const hueValue = this.dataset.hue;

  // create css custom property on root and set value from hueValue
  document.documentElement.style.setProperty("--hue", hueValue);

  // remove "active" class from all themeBtns
  for (let i = 0; i < themeBtns.length; i++) {
    if (themeBtns[i].classList.contains("active")) {
      themeBtns[i].classList.remove("active");
    }
  }

  // add "active" class on clicked themeBtn
  this.classList.add("active");
}

// add event on all themeBtns
addEventOnMultiElem(themeBtns, themeChanger);
