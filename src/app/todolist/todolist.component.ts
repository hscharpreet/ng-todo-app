import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-todolist',
  templateUrl: './todolist.component.html',
  styleUrls: ['./todolist.component.css'],
})
export class TodolistComponent implements OnInit {
  taskArray: { taskName: string; isCompleted: boolean; isEditable: boolean }[] =
    [];

  ngOnInit() {
    const storedTasks = localStorage.getItem('tasks');
    if (storedTasks) {
      this.taskArray = JSON.parse(storedTasks);
    }
  }

  onSubmit(taskForm: NgForm) {
    this.taskArray.push({
      taskName: taskForm.value.task,
      isCompleted: false,
      isEditable: false,
    });
    taskForm.reset();
    this.saveTasks();
  }

  onDelete(index: number) {
    this.taskArray.splice(index, 1);
    this.saveTasks();
  }

  onCheck(index: number) {
    this.taskArray[index].isCompleted = !this.taskArray[index].isCompleted;
    this.saveTasks();
  }

  onEdit(index: number) {
    this.taskArray[index].isEditable = true;
    this.saveTasks();
  }

  onSave(index: number, updatedTask: string) {
    this.taskArray[index].taskName = updatedTask;
    this.taskArray[index].isEditable = false;
    this.saveTasks();
  }

  saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(this.taskArray));
  }
}
