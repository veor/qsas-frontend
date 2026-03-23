// APPLICATION-FORM

import { CommonModule, Location  } from '@angular/common';
import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { ApplicantHeaderComponent } from '../../shared/applicant-header/applicant-header.component';
import { MatDialog } from '@angular/material/dialog';
import { ApplicationPreviewDialogComponent } from '../application-preview-dialog/application-preview-dialog.component';
import { ApplicantService, LocationOption } from '../../services/applicant.service';
import { SecretQuestionDialogComponent } from '../secret-question-dialog/secret-question-dialog.component';
import { ApplicantEditDialogComponent } from '../applicant-edit-dialog/applicant-edit-dialog.component';
import { LoaderService } from '../../services/loader.service';
import { ToastService } from '../../services/toast.service';
import { Router } from '@angular/router';
import { AssessmentAccessGuard } from '../../services/assessment-access.guard';

interface District {
  id: number;
  name: string;
}

interface Municipality {
  id: number;
  district_id: number;
  name: string;
  points: number;
}

@Component({
  selector: 'app-application-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    ApplicantHeaderComponent
  ],
  templateUrl: './application-form.component.html',
  styleUrl: './application-form.component.css'
})
export class ApplicationFormComponent {

  basicInfoForm!: FormGroup;
  otherDetailsForm!: FormGroup;

  // Dynamic districts and municipalities
  districts: District[] = [];
  municipalities: Municipality[] = [];
  filteredMunicipalities: Municipality[] = [];

  // Other location options
  hometownLocationOptions: LocationOption[] = [];
  BarangayAccessibilityOptions: LocationOption[] = [];
  hardToReachBarangaysOptions: LocationOption[] = [];
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
  
  totalGradePoints: number = 0;
  constructor(
    private fb: FormBuilder, 
    private dialog: MatDialog,
    private applicantService: ApplicantService,
    private loaderService: LoaderService,
    private toast: ToastService,
    private router: Router, 
    private assessmentAccessGuard: AssessmentAccessGuard,
    private location: Location

  ) {}

  ngOnInit() {
    const navState = history.state;
    this.basicInfoForm = this.fb.group({
      applicant_first: ['', Validators.required],
      applicant_middle: [''],
      applicant_last: ['', Validators.required],
      applicant_extension: [''],
      father_first: ['', Validators.required],
      father_middle: [''],
      father_last: ['', Validators.required],
      father_extension: [''],
      mother_first: ['', Validators.required],
      mother_middle: [''],
      mother_last: ['', Validators.required],
      mother_extension: [''],
      birthdate: ['', Validators.required],
    });
    this.otherDetailsForm = this.fb.group({
      gender: ['', Validators.required],
      assigned_sex: [''], 
      civil_status: ['', Validators.required],
      children: ['', Validators.required],
      contact: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      house_no: [''],
      street: [''],
      purok: [''],
      district: ['', Validators.required],
      municipality: ['', Validators.required],
      barangay: ['', Validators.required],
      hometown_location: ['', Validators.required],
      barangay_accessibility: ['', Validators.required],
      hard_to_reach_barangays: ['', Validators.required],
      applicant_course: [''], 
      current_academic_status: ['', Validators.required],
      current_course: [''], 
      current_school: [''], 
      grades: this.fb.array([]),
      school_year_start: ['', Validators.required],
      school_year_end: ['', Validators.required],
      grading_period: ['', Validators.required],
      grade_pdf: [null, Validators.required],
      picture: [null, Validators.required],
      secret_question: ['', Validators.required],
      secret_answer: ['', Validators.required],
      
    });
    this.initSingleGrade();

    this.otherDetailsForm.get('district')?.valueChanges.subscribe(districtId => {
      this.filteredMunicipalities = this.municipalities.filter(
        m => m.district_id == districtId
      );
      this.otherDetailsForm.patchValue({ municipality: '' });
      this.grades.valueChanges.subscribe(() => this.calculateTotalGrades());
    });
    this.otherDetailsForm.get('current_academic_status')?.valueChanges.subscribe(val => {
       // Reset grading period when status changes
      this.otherDetailsForm.patchValue({ grading_period: '' });

      if (val === '1' || val === '2') {
        this.otherDetailsForm.patchValue({ current_course: '' });
      }
    });
    this.applicantService.getDistrictsAndMunicipalities().subscribe({
      next: ({ districts, municipalities }) => {
        this.districts = districts.sort((a, b) => a.id - b.id);
        this.municipalities = municipalities;
        this.loaderService.hide();
      },
      error: () => {
        this.loaderService.hide();
        this.toast.showError('Failed to load districts and municipalities.');
      }
    });
    this.applicantService.getLocationOptions('hometown').subscribe({
      next: (options) => this.hometownLocationOptions = options
    });
    this.applicantService.getLocationOptions('barangay_accessibility').subscribe({
      next: (options) => this.BarangayAccessibilityOptions = options
    });
    this.applicantService.getLocationOptions('hard_to_reach').subscribe({
      next: (options) => this.hardToReachBarangaysOptions = options
    });
  }

  private initSingleGrade() {
    const gradeForm = this.fb.group({
      numeric_grade: ['', Validators.required],
      grade_label: ['']
    });
    this.grades.push(gradeForm);
    gradeForm.valueChanges.subscribe(() => this.calculateTotalGrades());
  }

  calculateTotalGrades() {
    this.totalGradePoints = this.grades.controls.reduce((sum, gradeCtrl) => {
      const val = parseFloat(gradeCtrl.get('numeric_grade')?.value) || 0;
      return sum + val;
    }, 0);
  }

  get grades(): FormArray {
    return this.otherDetailsForm.get('grades') as FormArray;
  }
  
  onGradeSelect(value: string, index: number) {
    const selected = this.gradesOptions.find(g => g.value == +value);
    this.grades.at(index).patchValue({ 
      numeric_grade: value,
      grade_label: selected ? selected.label : ''
    });
    this.calculateTotalGrades();
  }

  onDistrictChange(districtId: number) {
    this.filteredMunicipalities = this.municipalities.filter(m => m.district_id === districtId);
    this.otherDetailsForm.patchValue({ municipality: '' });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.otherDetailsForm.patchValue({ picture: file });
      this.otherDetailsForm.get('picture')?.updateValueAndValidity();
    }
  }

  onGradeFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      if (file.type !== 'application/pdf') {
        this.toast.showError('Grade must be a PDF file.');
        input.value = '';
        this.otherDetailsForm.patchValue({ grade_pdf: null });
        return;
      }

      this.otherDetailsForm.patchValue({ grade_pdf: file });
      this.otherDetailsForm.get('grade_pdf')?.updateValueAndValidity();
    }
  }
  isSeniorHighSelected(): boolean {
    const status = this.otherDetailsForm.get('current_academic_status')?.value;
    return status === '1' || status === '2'; 
  }
  isCollegeSelected(): boolean {
    const status = this.otherDetailsForm.get('current_academic_status')?.value;
    return status === '3' || status === '4' || status === '5' || status === '6' || status === '7' || status === '8'; 
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  goNext(stepper: any) {
    if (this.basicInfoForm.invalid) {
      this.markFormGroupTouched(this.basicInfoForm);
      return;
    }

    const formData = this.basicInfoForm.value;
    this.loaderService.show(); 

    this.applicantService.checkDuplicate(formData).subscribe({
      next: (res) => {
        this.loaderService.hide();
        if (res.exists) {
          const dialogRef = this.dialog.open(SecretQuestionDialogComponent, {
            width: '400px',
            data: { secret_question: res.secret_question }
          });

          dialogRef.afterClosed().subscribe(answer => {
            if (answer) {
              this.loaderService.show(); 
              this.applicantService.verifySecret(res.id, answer).subscribe({
                next: (check) => {
                  this.loaderService.hide(); 
                  if (check.valid) {
                    const dialogRef2 = this.dialog.open(ApplicantEditDialogComponent, {
                      width: '800px',
                      maxWidth: '95vw',
                      maxHeight: '90vh',
                      data: check.applicant,
                      panelClass: 'custom-dialog-container',
                      disableClose: true
                    });

                    dialogRef2.afterClosed().subscribe(result => {
                      if (result === 'confirm') {
                        this.finalSubmit(check.applicant);
                      }
                    });

                  } else {
                    this.toast.showError('Incorrect answer to secret question.');
                  }
                },
                error: () => this.loaderService.hide()
              });
            }
          });
        } else {
          stepper.next();
        }
      },
      error: () => this.loaderService.hide()
    });
  }

  submitInformation() {
    // Mark all fields touched to show validation errors
    this.markFormGroupTouched(this.basicInfoForm);
    this.markFormGroupTouched(this.otherDetailsForm);

    // Check overall form validity
    if (this.basicInfoForm.invalid || this.otherDetailsForm.invalid) {
      this.toast.showError('Please fill in all required fields.');
      return;
    }

    const pictureFile: File | null = this.otherDetailsForm.get('picture')?.value;
    const gradeFile: File | null = this.otherDetailsForm.get('grade_pdf')?.value;

    // Mandatory file checks
    if (!pictureFile) {
      this.toast.showError('Please upload your picture.');
      return;
    }

    if (!gradeFile) {
      this.toast.showError('Please upload your latest grade PDF.');
      return;
    }

    // Validate PDF file type
    if (gradeFile.type !== 'application/pdf') {
      this.toast.showError('Grade must be a PDF file.');
      return;
    }

    const municipalityId = this.otherDetailsForm.get('municipality')?.value;

    const municipalityObj = this.municipalities.find(
      m => m.id == municipalityId
    );

    const formData = {
      ...this.basicInfoForm.value,
      ...this.otherDetailsForm.value,
      municipality_name: municipalityObj ? municipalityObj.name : '',
      grades: this.otherDetailsForm.get('grades')?.value,
      total_grade_points: this.totalGradePoints,
      pictureFile,
      gradeFile,
      picturePreview: URL.createObjectURL(pictureFile)
    };

    const dialogRef = this.dialog.open(ApplicationPreviewDialogComponent, {
      width: '800px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data: formData,
      panelClass: 'custom-dialog-container',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (formData.picturePreview?.startsWith('blob:')) {
        URL.revokeObjectURL(formData.picturePreview);
      }
      if (result === 'confirm') {
        this.finalSubmit(formData);
      }
    });
  }

  private finalSubmit(formData: any) {
    const payload = new FormData();

      const grades = this.otherDetailsForm.get('grades')?.value || [];
      const totalGradePoints = grades.reduce((sum: number, g: any) => {
        return sum + parseFloat(g.numeric_grade);
      }, 0);

    Object.keys(formData).forEach(key => {
      const value = formData[key];

      if (value !== null && value !== undefined) {
        if (key === 'pictureFile') {
          payload.append('picture', value);
        } else if (key === 'gradeFile') {
          payload.append('grade_pdf', value);
        } else if (key === 'grades') {
          payload.append('grades', JSON.stringify(value));
        } else {
          payload.append(key, value);
        }
      }
    });

    payload.append('total_grade_points', this.totalGradePoints.toString());
    this.loaderService.show();

    this.applicantService.submitInformation(payload).subscribe({
      next: (res) => {
        this.loaderService.hide();
        this.toast.showSuccess('Application submitted successfully!');

        this.basicInfoForm.reset();
        this.otherDetailsForm.reset();
        this.filteredMunicipalities = [];

        ['picture', 'grade_pdf'].forEach(name => {
          const fileInput = document.querySelector<HTMLInputElement>(`input[formControlName="${name}"]`);
          if (fileInput) fileInput.value = '';
        });

        while (this.grades.length) {
          this.grades.removeAt(0);
        }
        this.initSingleGrade();
        this.totalGradePoints = 0;

        const stepper = document.querySelector('mat-stepper') as any;
        if (stepper) stepper.reset();

        this.assessmentAccessGuard.allowAccessOnce();

        this.router.navigate(['/assessment-form'], {
          state: { 
            applicationRefNo: res.applicant.application_ref_no
          }
        });
      },
      error: (err) => {
        this.loaderService.hide();
        console.error('Submit failed:', err);
        this.toast.showError('Failed to submit application.');
      }
    });
  }

  goBackToHome() {
    this.router.navigate(['/apply']);
  }

}
