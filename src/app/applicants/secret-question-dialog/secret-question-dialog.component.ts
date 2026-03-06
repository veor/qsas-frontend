import { Component, Inject } from '@angular/core';
import { Validators, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogContent, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-secret-question-dialog',
  standalone: true,
  imports: [
    MatDialogContent, 
    MatFormFieldModule, 
    MatDialogModule,
    MatInputModule,
    ReactiveFormsModule
  ],
  templateUrl: './secret-question-dialog.component.html',
  styleUrl: './secret-question-dialog.component.css'
})
export class SecretQuestionDialogComponent {
  form = this.fb.group({
    answer: ['', Validators.required]
  });

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<SecretQuestionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  close() {
    this.dialogRef.close();
  }

  submit() {
    this.dialogRef.close(this.form.value.answer);
  }
}
