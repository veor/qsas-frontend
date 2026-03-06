import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-add-new-question-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FormsModule
  ],
  templateUrl: './add-new-question-dialog.component.html',
  styleUrl: './add-new-question-dialog.component.css'
})
export class AddNewQuestionDialogComponent {
  question_code = '';
  question = '';
  weight: number = 0;
  options: { text: string; points: number }[] = [
    { text: '', points: 0 }
  ];

  constructor(private dialogRef: MatDialogRef<AddNewQuestionDialogComponent>) {}

  addOption() {
    this.options.push({ text: '', points: 0 });
  }

  save() {
    this.dialogRef.close({
      question_code: this.question_code,
      question: this.question,
      weight: this.weight,
      options: this.options
    });
  }
}