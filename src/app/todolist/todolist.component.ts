import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-todolist',
  templateUrl: './todolist.component.html',
  styleUrl: './todolist.component.css',
})
export class TodolistComponent {
  taskArray = [{ taskName: 'Task 1', isCompleted: true, isEditable: false }];

  onSubmit(taskForm: NgForm) {
    this.taskArray.push({
      taskName: taskForm.value.task,
      // taskName: taskForm.controls['task'].value,
      isCompleted: false,
      isEditable: false,
    });
    taskForm.reset();
  }

  onDelete(index: number) {
    this.taskArray.splice(index, 1);
  }

  onCheck(index: number) {
    this.taskArray[index].isCompleted = !this.taskArray[index].isCompleted;
  }

  onEdit(index: number) {
    this.taskArray[index].isEditable = true;
  }

  onSave(index: number, updatedTask: string) {
    this.taskArray[index].taskName = updatedTask;
    this.taskArray[index].isEditable = false;
  }
}
