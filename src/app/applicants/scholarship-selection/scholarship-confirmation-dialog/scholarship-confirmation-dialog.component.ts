import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { MatDivider } from "@angular/material/divider";
import { MatIconModule } from "@angular/material/icon";

@Component({
  selector: 'app-scholarship-confirmation-dialog',
  standalone: true,
  imports: [
    MatDialogContent,
    MatDialogActions,
    MatDivider,
    MatIconModule
],
  templateUrl: './scholarship-confirmation-dialog.component.html',
  styleUrl: './scholarship-confirmation-dialog.component.css'
})
export class ScholarshipConfirmationDialogComponent {
constructor(
    public dialogRef: MatDialogRef<ScholarshipConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string }
  ) {}

  confirm() {
    this.dialogRef.close(true);
  }

  cancel() {
    this.dialogRef.close(false);
  }
}
