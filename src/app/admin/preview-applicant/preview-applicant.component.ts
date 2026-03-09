import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { DatePipe, CommonModule } from '@angular/common';
import { AdminService, Applicant } from '../../services/admin.service';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment.development';
import { SafeUrlPipe } from "../../shared/safe-url.pipe";
import { ToastService } from '../../services/toast.service';
import { ApplicantService, LocationOption } from '../../services/applicant.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-preview-applicant',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DatePipe,
    MatDialogModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    SafeUrlPipe
],
  templateUrl: './preview-applicant.component.html',
  styleUrl: './preview-applicant.component.css'
})
export class PreviewApplicantComponent {
  public apiUrl = environment.apiUrl;
  isEditingGrades = false;
  editableGrades: { numeric_grade: number; grade_label: string }[] = [];
  gradesOptions = [
    { label: 'Below 85 / 2.00+', value: 1 },
    { label: '85.00-85.99 / 2.00-1.93', value: 1.25 },
    { label: '86.00-86.99 / 1.94-1.87', value: 1.5 },
    { label: '87.00-87.99 / 1.88-1.80', value: 1.75 },
    { label: '88.00-88.99 / 1.81-1.74', value: 2 },
    { label: '89.00-89.99 / 1.75-1.67', value: 2.25 },
    { label: '90.00-90.99 / 1.68-1.60', value: 2.5 },
    { label: '91.00-91.99 / 1.61-1.54', value: 2.75 },
    { label: '92.00-92.99 / 1.55-1.47', value: 3 },
    { label: '93.00-93.99 / 1.48-1.41', value: 3.25 },
    { label: '94.00-94.99 / 1.42-1.34', value: 3.5 },
    { label: '95.00-95.99 / 1.35-1.27', value: 3.75 },
    { label: '96.00-96.99 / 1.28-1.21', value: 4 },
    { label: '97.00-97.99 / 1.22-1.14', value: 4.25 },
    { label: '98.00-98.99 / 1.15-1.08', value: 4.5 },
    { label: '99.00-99.99 / 1.09-1.01', value: 4.75 },
    { label: '100 / 1.00', value: 5 }
  ];

  hometownLocationOptions: LocationOption[] = [];
  barangayAccessibilityOptions: LocationOption[] = [];
  hardToReachOptions: LocationOption[] = [];
  isEditingLocation = false;
  editableLocation = {
    hometown_location: '',
    barangay_accessibility: '',
    hard_to_reach_barangays: ''
  };
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Applicant,
    private dialogRef: MatDialogRef<PreviewApplicantComponent>,
    private router: Router,
    private authService: AuthService,
    private adminService: AdminService,
    private applicantService: ApplicantService,
    private toast: ToastService
  ) {}

  get canViewAssessment(): boolean {
    return this.authService.hasPermission('user.can_view_assessment');
  }

  // get canEditGrades(): boolean {
  //   return this.authService.hasPermission('user.can_edit_grades'); 
  // }

  ngOnInit() {
    this.applicantService.getLocationOptions('hometown').subscribe({
      next: (options) => this.hometownLocationOptions = options
    });
    this.applicantService.getLocationOptions('barangay_accessibility').subscribe({
      next: (options) => this.barangayAccessibilityOptions = options
    });
    this.applicantService.getLocationOptions('hard_to_reach').subscribe({
      next: (options) => this.hardToReachOptions = options
    });
  }

  startEditLocation() {
    this.editableLocation = {
      hometown_location: this.data.hometown_location,
      barangay_accessibility: this.data.barangay_accessibility,
      hard_to_reach_barangays: this.data.hard_to_reach_barangays
    };
    this.isEditingLocation = true;
  }

  cancelEditLocation() {
    this.isEditingLocation = false;
  }

  saveLocation() {
    this.adminService.updateLocation(this.data.application_ref_no, this.editableLocation).subscribe({
      next: () => {
        this.data.hometown_location = this.editableLocation.hometown_location;
        this.data.barangay_accessibility = this.editableLocation.barangay_accessibility;
        this.data.hard_to_reach_barangays = this.editableLocation.hard_to_reach_barangays;
        this.isEditingLocation = false;
        this.toast.showSuccess('Location updated successfully.');
      },
      error: () => this.toast.showError('Failed to update location.')
    });
  }

  startEditGrades() {
    this.editableGrades = this.data.grades ? 
      this.data.grades.map(g => ({ ...g })) : [];
    this.isEditingGrades = true;
  }

  cancelEditGrades() {
    this.isEditingGrades = false;
    this.editableGrades = [];
  }

  onGradeSelect(value: string, index: number) {
    const selected = this.gradesOptions.find(g => g.value === +value);
    this.editableGrades[index] = {
      numeric_grade: +value,
      grade_label: selected ? selected.label : ''
    };
  }

  saveGrades() {
    this.adminService.updateGrades(this.data.application_ref_no, this.editableGrades).subscribe({
      next: () => {
        this.data.grades = [...this.editableGrades];
        this.isEditingGrades = false;
        this.toast.showSuccess('Grades updated successfully.');
      },  
      error: () => {
        this.toast.showError('Failed to update grades.');
      }
    });
  }

  onViewAssessment() {
    const refNo = this.data.application_ref_no;
    this.dialogRef.close();
    this.router.navigate(['/admin/assessment', refNo]);
  }

  onClose() {
    this.dialogRef.close();
  }
}