

class Task {
    constructor(id, task, description) {
      this.id = id;
      this.name = task;
      this.desc = description;
    }
  }


class UI{

    constructor() {
        this.storage = new Storage();
        this.table = document.getElementById('taskTable');
        this.addButton = document.getElementById('button');
    }

    async initialize() {
        this.initializeFormSubmitListener();
    
        await this.storage.fetchTasksFromFireStore();
    
        this.populateTasksTable();
    }
    
    initializeFormSubmitListener() {
        const taskForm = document.getElementById('task-form');
        taskForm.addEventListener('submit', (e) => {
          e.preventDefault();
    
          this.createTaskFromInput();
          this.clearFormInputs();
        });
    }
    
    async createTaskFromInput() {
        const taskName = document.getElementById('taskName');
        const taskDesc = document.getElementById('taskDesc');
    
        const task = new Task(null, taskName, taskDesc);
        await this.storage.addTask(task);
    
        this.populateTasksTable();
    }
    
    populateTasksTable() {
        this.clearTable();
    
        for (const task of this.storage.tasks) {
          this.addTaskToTable(task);
        }
    }
    
    clearTable() {
        let length = this.table.children.length;
        for (let i = 0; i < length; i++) {
          const row = this.table.children[0];
          row.remove();
        }
    }
    
    addTaskToTable(task) {
        const row = document.createElement('tr');
    
        row.innerHTML = `
          <td>${task.name}</td>
          <td>${task.desc}</td>
          <td>
            <i id="compButton${task.id}" class="btn-success"></i>
          </td>
        `;
    
        this.table.append(row);
        this.addCompleteListenerToRow(task);
    }

    addCompleteListenerToRow(task) {
        document.getElementById('compButton' + task.id).addEventListener('click', async () => {
          await this.storage.removeTask(task.id);
          this.populateTasksTable();
        })
    }
    
    clearFormInputs() {
        this.addButton.value = '';
    }

}

const ui = new UserInterface();
document.addEventListener('DOMContentLoaded', () => {
  ui.initialize();
});

class Storage {
    constructor() {
      this.db = firebase.firestore();
  
      this.tasks = [];
    }
  
    async fetchTasksFromFireStore() {
      let tasks = [];
  
      try {
        const snapshot = await this.db.collection('tasks').get();
  
        for (let doc of snapshot.docs) {
          const data = doc.data();
          const task = new Task(
            doc.id,
            data.name,
        );
          tasks.push(task);
        }
      } catch (err) {
        console.log(err);
      }
  
      this.tasks = tasks;
    }
  
    async addTask(task) {
      try {
        const docRef = await this.db.collection('tasks').add({
          name: task.name,
        });
        task.id = docRef.id;
        this.tasks.push(task);
      } catch (err) {
        console.log(err);
      }
    }
  
    async updateTask(task) {
      try {
        await this.db.collection('tasks').doc(task.id).update({
          name: task.name,
        });
  
        this.tasks = this.tasks.map(x => {
          return x.id == task.id ? task : x;
        });
      } catch (err) {
        console.log(err);
      }
    }
  
    async removeTask(id) {
      try {
        await this.db.collection('tasks').doc(id).delete();
        this.tasks = this.tasks.filter(x => x.id != id);
      } catch(err) {
        console.log(err);
      }
    }
}

