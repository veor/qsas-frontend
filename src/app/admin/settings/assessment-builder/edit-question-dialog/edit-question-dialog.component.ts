import { Component, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose, MatDialogModule } from '@angular/material/dialog';
import { Question } from '../assessment-builder.component';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-edit-question-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule
],
  templateUrl: './edit-question-dialog.component.html',
  styleUrl: './edit-question-dialog.component.css'
})
export class EditQuestionDialogComponent {
questionForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<EditQuestionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Question
  ) {
    this.questionForm = this.fb.group({
      id: [{ value: data.id, disabled: true }],
      question: [data.question, [Validators.required, Validators.minLength(5)]],
      weight: [data.weight ?? 0, [Validators.required, Validators.min(0)]],
      options: this.fb.array([])
    });

    if (data.options && data.options.length > 0) {
      data.options.forEach((option: any) => {
        if (typeof option === 'string') {
          this.addOptionWithValue({ text: option, points: 0 });
        } else {
          this.addOptionWithValue(option);
        }
      });
    } else {
      this.addOption();
      this.addOption();
    }

  }

  get options(): FormArray {
    return this.questionForm.get('options') as FormArray;
  }

  addOption(): void {
    this.options.push(
      this.fb.group({
        text: ['', Validators.required],
        points: [0, [Validators.required, Validators.min(0)]]
      })
    );
  }

  addOptionWithValue(option: { text: string; points: number }): void {
    this.options.push(
      this.fb.group({
        text: [option.text, Validators.required],
        points: [option.points ?? 0, [Validators.required, Validators.min(0)]]
      })
    );
  }

  removeOption(index: number): void {
    if (this.options.length > 2) {
      this.options.removeAt(index);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.questionForm.valid && this.options.length >= 2) {
      const formValue = this.questionForm.getRawValue();

      this.dialogRef.close({
        id: formValue.id,
        question: formValue.question,
        weight: formValue.weight, 
        options: formValue.options
          .filter((o: any) => o.text.trim() !== ''),
        type: 'mcq'
      });
    }
  }

}