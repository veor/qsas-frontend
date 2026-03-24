import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
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
    MatIconModule,
    FormsModule,
    CommonModule
],
  templateUrl: './scholarship-confirmation-dialog.component.html',
  styleUrl: './scholarship-confirmation-dialog.component.css'
})
export class ScholarshipConfirmationDialogComponent {
  selectedCourse: string = '';
  courseSearch: string = '';
  dropdownOpen = false;

constructor(
    public dialogRef: MatDialogRef<ScholarshipConfirmationDialogComponent>,
    // @Inject(MAT_DIALOG_DATA) public data: { title: string }
    @Inject(MAT_DIALOG_DATA) public data: { title: string, courses: string[] }
  ) {}

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  filteredCourses(): string[] {
    if (!this.courseSearch) return this.data.courses;
    const search = this.courseSearch.toLowerCase();
    return this.data.courses.filter(c => c.toLowerCase().includes(search));
  }

  selectCourse(course: string) {
    this.selectedCourse = course;
    this.dropdownOpen = false;
    this.courseSearch = '';
  }

  confirm() {
    // this.dialogRef.close(true);
    this.dialogRef.close(this.selectedCourse || true);
  }

  cancel() {
    this.dialogRef.close(false);
  }
}
