import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { NgForm } from '@angular/forms';
import { setDoc, doc, getDoc } from 'firebase/firestore';
import { ActivatedRoute, Router } from '@angular/router';

interface Task {
  id: number;
  taskName: string;
  isCompleted: boolean;
  isEditable: boolean;
  isArchived: boolean;
}

@Component({
  selector: 'app-todolist',
  templateUrl: './todolist.component.html',
  styleUrls: ['./todolist.component.css'],
})
export class TodolistComponent implements OnInit {
  taskArray: Task[] = [];
  nextId = 0;
  previousStates: Task[][] = [];
  futureStates: Task[][] = [];
  showMore = false;
  isLargeScreen = false;
  idFromUrl: string = '';
  isSaved = false;
  toastMessage: string | null = null;

  @ViewChildren('taskInput') taskInputs: QueryList<ElementRef> | undefined;

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (event.ctrlKey && event.key === 'z') {
      this.undo();
    } else if (event.ctrlKey && event.key === 'y') {
      this.redo();
    }
  }

  constructor(
    private firestore: Firestore,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  async saveToDB() {
    try {
      if (!this.idFromUrl) {
        this.idFromUrl = Math.random().toString(16).substr(2, 8);
        this.router.navigate(['/', this.idFromUrl]);
      }

      const docRef = doc(this.firestore, 'todos', this.idFromUrl);
      await setDoc(docRef, { tasks: this.taskArray });
      this.showToastMessage(`Saved to cloud with id: ${this.idFromUrl}`, 2000);
    } catch (e) {
      console.error('Error adding document: ', e);
    }
  }

  async saveAndCopyUrl() {
    await this.saveToDB();
    navigator.clipboard.writeText(window.location.href);
    this.isSaved = true;
    setTimeout(() => {
      this.isSaved = false;
    }, 2000);
  }

  ngOnInit() {
    this.isLargeScreen = window.innerWidth > 768;
    this.showMore = this.isLargeScreen;

    this.route.params.subscribe((params) => {
      this.idFromUrl = params['id'];
      this.loadTasks();
    });
  }

  onSubmit(taskForm: NgForm) {
    this.savePreviousState();
    const newTask: Task = {
      id: this.nextId++,
      taskName: taskForm.value.task,
      isCompleted: false,
      isEditable: false,
      isArchived: false,
    };
    this.taskArray.push(newTask);
    taskForm.reset();
    this.saveTasks();
  }

  onDelete(id: number) {
    this.savePreviousState();
    this.taskArray = this.taskArray.filter((task) => task.id !== id);
    this.saveTasks();
    this.showToastMessage(`Task Deleted. Undo to revert action.`, 1000);
  }

  onCheck(id: number) {
    this.savePreviousState();
    const task = this.taskArray.find((task) => task.id === id);
    if (task) {
      task.isCompleted = !task.isCompleted;
      this.saveTasks();
    }
  }

  onUndoCheck(id: number) {
    const task = this.taskArray.find((task) => task.id === id);
    if (task) {
      task.isArchived = !task.isArchived;
      this.saveTasks();
    }
  }

  onEdit(id: number) {
    this.savePreviousState();
    const task = this.taskArray.find((task) => task.id === id);
    if (task) {
      task.isEditable = true;
      this.saveTasks();
      setTimeout(() => {
        const taskInput = this.taskInputs?.find(
          (input) => input.nativeElement.value === task.taskName
        );
        if (taskInput) {
          taskInput.nativeElement.focus();
        }
      });
    }
  }

  onSave(id: number, updatedTask: string) {
    this.savePreviousState();
    const task = this.taskArray.find((task) => task.id === id);
    if (task) {
      task.taskName = updatedTask;
      task.isEditable = false;
      this.saveTasks();
    }
  }

  refreshTasks() {
    this.loadTasks();
    console.log(this.taskArray);
  }

  moveCompletedToArchive() {
    this.savePreviousState();
    this.taskArray.forEach((task) => {
      if (task.isCompleted) {
        task.isArchived = true;
      }
    });
    this.saveTasks();
  }

  deleteArchivedTasks() {
    this.savePreviousState();
    this.taskArray = this.taskArray.filter((task) => !task.isArchived);
    this.saveTasks();
  }

  deleteAllTasks() {
    this.savePreviousState();
    this.taskArray = [];
    this.saveTasks();
  }

  savePreviousState() {
    this.previousStates.push(JSON.parse(JSON.stringify(this.taskArray)));
  }

  showToastMessage(message: string, timeout: number) {
    this.toastMessage = message;

    setTimeout(() => {
      this.toastMessage = null;
    }, timeout);
  }

  undo() {
    if (this.previousStates.length > 0) {
      this.futureStates.push(JSON.parse(JSON.stringify(this.taskArray)));
      this.taskArray = this.previousStates.pop() as Task[];
      this.saveTasks();
    }
  }

  redo() {
    if (this.futureStates.length > 0) {
      this.previousStates.push(JSON.parse(JSON.stringify(this.taskArray)));
      this.taskArray = this.futureStates.pop() as Task[];
      this.saveTasks();
    }
  }

  saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(this.taskArray));
  }

  async loadTasks() {
    if (this.idFromUrl) {
      const docRef = doc(this.firestore, 'todos', this.idFromUrl);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        this.taskArray = docSnap.data()['tasks'];
        this.nextId =
          this.taskArray.length > 0
            ? Math.max(...this.taskArray.map((t) => t.id)) + 1
            : 0;
      } else {
        this.loadTasksFromLocalStorage();
      }
    } else {
      this.loadTasksFromLocalStorage();
    }
  }

  loadTasksFromLocalStorage() {
    const storedTasks = localStorage.getItem('tasks');
    if (storedTasks) {
      this.taskArray = JSON.parse(storedTasks);
      this.nextId =
        this.taskArray.length > 0
          ? Math.max(...this.taskArray.map((t) => t.id)) + 1
          : 0;
    } else {
      this.taskArray = [];
      this.nextId = 0;
    }
  }
}
