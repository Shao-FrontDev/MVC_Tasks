class Modal {
  constructor() {
    this.tasks =
      JSON.parse(localStorage.getItem("tasks")) || [];

    this.completedTasks = this.tasks.filter(
      (task) => task.complete === true
    );

    this.uncompletedTasks = this.tasks.filter(
      (task) => task.complete === false
    );

    this.onTaskListChanged = null;
  }

  addTask(taskText) {
    const newTask = {
      id:
        this.tasks.length > 0
          ? this.tasks[this.tasks.length - 1].id + 1
          : 1,
      text: taskText,
      complete: false,
    };

    this.tasks.push(newTask);
    this._commit(this.tasks);
  }

  editTask(id, updateText) {
    this.tasks = this.tasks.map((task) => {
      return task.id === id
        ? {
            id: task.id,
            text: updateText,
            complete: task.complete,
          }
        : task;
    });
  }

  deleteTask(id) {
    this.tasks = this.tasks.filter(
      (task) => task.id !== id
    );
    this._commit(this.tasks);
  }

  toggleTask(id) {
    this.tasks = this.tasks.map((task) =>
      task.id === id
        ? {
            id: task.id,
            text: task.text,
            complete: !task.complete,
          }
        : task
    );
    this._commit(this.tasks);
  }
  bindTaskListChanged(callback) {
    this.onTaskListChanged = callback;
  }

  _commit(tasks) {
    this.onTaskListChanged(tasks);
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }
}

class View {
  constructor() {
    this.app = this.getElement(".app");
    this.tasks = this.getElement(".tasks");
    this.input = this.getElement(".input");
    this.taskList = this.getElement(".task-list");
    this.completedTaskList = this.getElement(
      ".task-list-completed"
    );
    this.form = this.getElement("form");
  }

  createElement(tag, className) {
    const element = document.createElement(tag);
    if (className) element.classList.add(className);

    return element;
  }

  displayNotifCard(info) {
    const card = this.createElement("div", "notifCard");
    const notifInfo = this.createElement("p");
    notifInfo.textContent = info;
    card.append(notifInfo);
    this.app.append(card);
    setTimeout(() => {
      card.remove();
    }, 1500);
  }

  getElement(selector) {
    const element = document.querySelector(selector);

    return element;
  }

  get _taskText() {
    return this.input.value;
  }

  _resetInput() {
    this.input.value = "";
  }

  displayTasks(tasks) {
    while (this.taskList.firstChild) {
      this.taskList.removeChild(this.taskList.firstChild);
    }
    while (this.completedTaskList.firstChild) {
      this.completedTaskList.removeChild(
        this.completedTaskList.firstChild
      );
    }
    if (tasks.length === 0) {
      const info = this.createElement("p", "notification");

      info.textContent = "现在还没有任务，快来添加任务把";
      this.taskList.insertAdjacentElement(
        "afterbegin",
        info
      );
    }
    tasks.forEach((task) => {
      if (task.complete) {
        const li = this.createElement("li", "todoItem");
        li.id = task.id;

        const checkbox = this.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.complete;

        const p = this.createElement("p");
        const strike = this.createElement("s");
        strike.textContent = task.text;
        p.append(strike);

        const deleteButton = this.createElement(
          "button",
          "delete"
        );

        deleteButton.textContent = "Delete";
        li.append(checkbox, p, deleteButton);

        this.completedTaskList.append(li);
      } else {
        const li = this.createElement("li", "todoItem");
        li.id = task.id;

        const checkbox = this.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.complete;

        const p = this.createElement("p");
        p.textContent = task.text;

        const deleteButton = this.createElement(
          "button",
          "delete"
        );
        deleteButton.textContent = "Delete";
        li.append(checkbox, p, deleteButton);

        this.taskList.append(li);
      }
    });
  }

  bindAddTask(handler) {
    this.form.addEventListener("submit", (event) => {
      console.log("submit");
      event.preventDefault();

      if (this._taskText) {
        handler(this._taskText);
        this._resetInput();
      }
    });
  }

  bindDeleteTask(handler) {
    this.tasks.addEventListener("click", (event) => {
      if (event.target.className === "delete") {
        const id = parseInt(event.target.parentElement.id);
        handler(id);
      }
    });
  }

  bindToggleTask(handler) {
    this.tasks.addEventListener("change", (event) => {
      if (event.target.type === "checkbox") {
        const id = parseInt(event.target.parentElement.id);
        handler(id);
      }
    });
  }
}

class Controller {
  constructor(modal, view) {
    this.modal = modal;
    this.view = view;

    this.onTaskListChanged(this.modal.tasks);
    this.view.bindAddTask(this.handleAddTask);
    this.view.bindDeleteTask(this.handleDeleteTask);
    this.view.bindToggleTask(this.handleToggleTask);
    this.modal.bindTaskListChanged(this.onTaskListChanged);
  }
  onTaskListChanged = (tasks) => {
    this.view.displayTasks(tasks);
  };

  handleAddTask = (taskText) => {
    const pass = utlis.handlerDuplicated(
      this.modal.tasks,
      taskText
    );
    if (pass) {
      this.modal.addTask(taskText);
    } else {
      const info = "该任务已经存在了";
      this.view.displayNotifCard(info);
    }
  };

  handleDeleteTask = (id) => {
    this.modal.deleteTask(id);
  };

  handleToggleTask = (id) => {
    this.modal.toggleTask(id);
  };
  handleEditTodo = (id, taskText) => {
    this.modal.editTask(id, taskText);
  };
}

const app = new Controller(new Modal(), new View());

utlis = {
  handlerDuplicated(arr, content) {
    let result = true;
    arr.forEach((task) => {
      if (task.text === content.trim()) {
        result = false;
      }
    });
    return result;
  },
};
