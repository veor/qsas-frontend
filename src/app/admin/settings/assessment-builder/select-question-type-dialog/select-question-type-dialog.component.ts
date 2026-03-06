import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-select-question-type-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule
],
  templateUrl: './select-question-type-dialog.component.html',
  styleUrl: './select-question-type-dialog.component.css'
})
export class SelectQuestionTypeDialogComponent {
  constructor(private dialogRef: MatDialogRef<SelectQuestionTypeDialogComponent>) {}

  select(type: 'mcq' | 'short') {
    this.dialogRef.close(type);
  }
}
