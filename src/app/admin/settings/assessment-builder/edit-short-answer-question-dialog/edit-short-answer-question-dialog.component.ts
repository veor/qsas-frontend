import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-edit-short-answer-question-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './edit-short-answer-question-dialog.component.html',
  styleUrl: './edit-short-answer-question-dialog.component.css'
})
export class EditShortAnswerQuestionDialogComponent {

form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EditShortAnswerQuestionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.form = this.fb.group({
      id: [{ value: data.id, disabled: true }],
      question: [data.question, Validators.required],
      weight: [data.weight ?? 0, Validators.required],
      points: [data.points ?? 0, [Validators.required, Validators.min(0)]]
    });
  }

  save() {
    this.dialogRef.close({
      id: this.data.id,
      question: this.form.value.question,
      weight: this.form.value.weight,
      type: 'short',
      options: [
        {
          text: 'SHORT_ANSWER',
          points: this.form.value.points
        }
      ]
    });
  }

  cancel() {
    this.dialogRef.close();
  }
}