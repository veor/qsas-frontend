import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-add-short-answer-question-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
  ],
  templateUrl: './add-short-answer-question-dialog.component.html',
  styleUrl: './add-short-answer-question-dialog.component.css'
})
export class AddShortAnswerQuestionDialogComponent {

  question_code = '';
  question = '';
  weight = 0;

  constructor(private dialogRef: MatDialogRef<AddShortAnswerQuestionDialogComponent>) {}

  save() {
    this.dialogRef.close({
      question_code: this.question_code,
      question: this.question,
      weight: this.weight,
      type: 'short' 
    });
  }
}