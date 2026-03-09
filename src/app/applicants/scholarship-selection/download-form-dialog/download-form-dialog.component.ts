import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';

export interface DownloadFormDialogData {
  title: string;
  formUrl: string;
}

@Component({
  selector: 'app-download-form-dialog',
  standalone: true,
  imports: [
    MatIcon
  ],
  templateUrl: './download-form-dialog.component.html',
  styleUrl: './download-form-dialog.component.css'
})
export class DownloadFormDialogComponent {
constructor(
    public dialogRef: MatDialogRef<DownloadFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DownloadFormDialogData
  ) {}

  downloadForm(): void {
    console.log('Opening URL:', this.data.formUrl);
    window.open(this.data.formUrl, '_blank');
  }

  close(): void {
    this.dialogRef.close();
  }
}