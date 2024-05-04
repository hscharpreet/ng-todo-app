import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { NgForm } from '@angular/forms';

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

  @ViewChildren('taskInput') taskInputs: QueryList<ElementRef> | undefined;

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (event.ctrlKey && event.key === 'z') {
      this.undo();
    } else if (event.ctrlKey && event.key === 'y') {
      this.redo();
    }
  }

  ngOnInit() {
    this.loadTasks();
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

  undo() {
    if (this.previousStates.length > 0) {
      this.futureStates.push(JSON.parse(JSON.stringify(this.taskArray)));
      this.taskArray = this.previousStates.pop() as Task[]; // Add type assertion
      this.saveTasks();
    }
  }

  redo() {
    if (this.futureStates.length > 0) {
      this.previousStates.push(JSON.parse(JSON.stringify(this.taskArray)));
      this.taskArray = this.futureStates.pop() as Task[]; // Add type assertion
      this.saveTasks();
    }
  }

  saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(this.taskArray));
  }

  loadTasks() {
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
