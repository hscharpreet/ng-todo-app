import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-todolist',
  templateUrl: './todolist.component.html',
  styleUrl: './todolist.component.css',
})
export class TodolistComponent {
  taskArray = [{ taskName: 'Task 1', isCompleted: true }];

  onSubmit(taskForm: NgForm) {
    console.log(taskForm);
    this.taskArray.push({
      taskName: taskForm.value.task,
      // taskName: taskForm.controls['task'].value,
      isCompleted: false,
    });
    taskForm.reset();
  }

  onDelete(index: number) {
    this.taskArray.splice(index, 1);
  }

  onCheck(index: number) {
    this.taskArray[index].isCompleted = !this.taskArray[index].isCompleted;
  }
}
