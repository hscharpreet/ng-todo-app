import {
  Component,
  ElementRef,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-todolist',
  templateUrl: './todolist.component.html',
  styleUrls: ['./todolist.component.css'],
})
export class TodolistComponent implements OnInit {
  taskArray: {
    id: number;
    taskName: string;
    isCompleted: boolean;
    isEditable: boolean;
    isArchived: boolean;
  }[] = [];
  nextId = 0;

  @ViewChildren('taskInput') taskInputs: QueryList<ElementRef> | undefined;

  ngOnInit() {
    const storedTasks = localStorage.getItem('tasks');
    if (storedTasks) {
      this.taskArray = JSON.parse(storedTasks);
      this.nextId =
        this.taskArray.length > 0
          ? Math.max(...this.taskArray.map((t) => t.id)) + 1
          : 0;
    }
  }

  onSubmit(taskForm: NgForm) {
    this.taskArray.push({
      id: this.nextId++,
      taskName: taskForm.value.task,
      isCompleted: false,
      isEditable: false,
      isArchived: false,
    });
    taskForm.reset();
    this.saveTasks();
  }

  onDelete(id: number) {
    this.taskArray = this.taskArray.filter((task) => task.id !== id);
    this.saveTasks();
  }

  onCheck(id: number) {
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
    const task = this.taskArray.find((task) => task.id === id);
    if (task) {
      task.taskName = updatedTask;
      task.isEditable = false;
      this.saveTasks();
    }
  }

  refreshTasks() {
    const storedTasks = localStorage.getItem('tasks');
    if (storedTasks) {
      this.taskArray = JSON.parse(storedTasks);
    } else {
      this.taskArray = [];
    }
    console.log(this.taskArray);
  }

  moveCompletedToArchive() {
    this.taskArray.forEach((task) => {
      if (task.isCompleted) {
        task.isArchived = true;
      }
    });
    this.saveTasks();
  }

  deleteArchivedTasks() {
    this.taskArray = this.taskArray.filter((task) => !task.isArchived);
    this.saveTasks();
  }

  deleteAllTasks() {
    this.taskArray = [];
    this.saveTasks();
  }

  saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(this.taskArray));
  }
}
