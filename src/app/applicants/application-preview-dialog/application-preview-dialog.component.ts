import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-application-preview-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    FormsModule
  ],
  templateUrl: './application-preview-dialog.component.html',
  styleUrl: './application-preview-dialog.component.css'
})
export class ApplicationPreviewDialogComponent {
  constructor(
      public dialogRef: MatDialogRef<ApplicationPreviewDialogComponent>,
      @Inject(MAT_DIALOG_DATA) public data: any,
      private toastService: ToastService
    ) {}

  consentGiven: boolean = false;

  getFullName(type: 'applicant' | 'father' | 'mother'): string {
    const prefix = type === 'applicant' ? 'applicant' : type;
    const first = this.data[`${prefix}_first`] || '';
    const middle = this.data[`${prefix}_middle`] || '';
    const last = this.data[`${prefix}_last`] || '';
    
    return [first, middle, last].filter(name => name.trim()).join(' ');
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getCompleteAddress(): string {
    const addressParts = [
      this.data.houseNo,
      this.data.street,
      this.data.purok,
      this.data.barangay,
      this.data.municipality,
    ].filter(part => part && part.trim());
    
    return addressParts.join(', ') || 'No address provided';
  }

  getImageSrc(): string {
    // Prefer preview if available
    if (this.data.picturePreview) {
      return this.data.picturePreview;
    }
    if (this.data.picture) {
      return this.data.picture;
    }
    return '';
  }

  onCancel(): void {
    this.toastService.showInfo('You may edit your information.'); 
    this.dialogRef.close();
  }

  onConfirm(): void {
    this.toastService.showSuccess('Application submitted successfully!'); 
    this.dialogRef.close('confirm');
  }

}
