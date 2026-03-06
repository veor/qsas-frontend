import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-set-status-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule
],
  templateUrl: './confirm-set-status-dialog.component.html',
  styleUrl: './confirm-set-status-dialog.component.css'
})
export class ConfirmSetStatusDialogComponent {
 constructor(
    private dialogRef: MatDialogRef<ConfirmSetStatusDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      title: string;
      message: string;
      confirmText?: string;
      confirmColor?: 'primary' | 'accent' | 'warn';
    }
  ) {}

  close(result: boolean): void {
    this.dialogRef.close(result);
  }
}