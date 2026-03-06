import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-data-privacy-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './data-privacy-dialog.component.html',
  styleUrl: './data-privacy-dialog.component.css'
})
export class DataPrivacyDialogComponent {
    concur = false;

    constructor(private dialogRef: MatDialogRef<DataPrivacyDialogComponent>) {}

    proceed() {
      if (this.concur) {
        this.dialogRef.close(true);
      }
    }

    cancel() {
      this.dialogRef.close(false);
    }
}
