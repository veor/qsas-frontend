import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApplicantService } from '../../services/applicant.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from "@angular/material/icon";
import { LoaderService } from '../../services/loader.service';
import { ToastService } from '../../services/toast.service';
import { Router } from '@angular/router';
import { AssessmentAccessGuard } from '../../services/assessment-access.guard';

@Component({
  selector: 'app-applicant-edit-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule
],

  templateUrl: './applicant-edit-dialog.component.html',
  styleUrl: './applicant-edit-dialog.component.css'
})
export class ApplicantEditDialogComponent implements OnInit{

  districts: { id: number, name: string }[] = [];
  allMunicipalities: { id: number, district_id: number, name: string, points: number }[] = [];
  filteredMunicipalities: { id: number, district_id: number, name: string, points: number }[] = [];

  editForm: FormGroup;
  hideSecret = true;
  hasSecretAnswer = true;

  // Track which fields are disabled due to empty data
  isCurrentCourseEmpty = false;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ApplicantEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private applicantService: ApplicantService,
    private loaderService: LoaderService,
    private toast: ToastService,
    private router: Router,
    private assessmentAccessGuard: AssessmentAccessGuard
  ) {
    this.hasSecretAnswer = !!data.secret_answer;

    // Check if current_course is empty
    this.isCurrentCourseEmpty = !data.current_course || data.current_course.trim() === '';

    this.editForm = this.fb.group({
      id: [data.id],
      applicant_first: [data.applicant_first, Validators.required],
      applicant_middle: [data.applicant_middle],
      applicant_last: [data.applicant_last, Validators.required],
      father_first: [data.father_first],
      father_last: [data.father_last],
      mother_first: [data.mother_first],
      mother_last: [data.mother_last],
      birthdate: [data.birthdate, Validators.required],
      gender: [data.gender],
      civil_status: [data.civil_status],
      assigned_sex: [data.assigned_sex],
      children: [data.num_children !== undefined ? String(data.num_children) : null],
      contact: [data.contact],
      email: [data.email, [Validators.email]],
      house_no: [data.house_no],
      street: [data.street],
      purok: [data.purok],
      district: [data.district],
      municipality: [data.municipality ? +data.municipality : null],
      barangay: [data.barangay],
      applicant_course: [data.applicant_course],
      // current_academic_status: [data.current_academic_status],
      // Disable current_course if empty
      current_course: [
        { value: data.current_course || '', disabled: this.isCurrentCourseEmpty }
      ],
      current_school: [data.current_school],
      // secret_question: [data.secret_question],
      // secret_answer: [''],
      // picture: [null],
      // gradePDF: [null]
    });
  }

  ngOnInit() {
  this.applicantService.getDistrictsAndMunicipalities().subscribe({
    next: (res) => {
      this.districts = res.districts;
      this.allMunicipalities = res.municipalities;

      const districtId = this.data.district ? +this.data.district : null;
      const municipalityId = this.data.municipality ? +this.data.municipality : null;

      this.editForm.patchValue({ district: districtId });
      this.filteredMunicipalities = this.allMunicipalities.filter(
        m => m.district_id === districtId
      );

      setTimeout(() => {
        this.editForm.patchValue({ municipality: municipalityId });
      });
    },
    error: (err) => {
      console.error('Failed to load districts/municipalities', err);
    }
  });
}

  onDistrictChange(districtId: number) {
    this.filteredMunicipalities = this.allMunicipalities.filter(
      m => m.district_id === +districtId
    );
    this.editForm.patchValue({ municipality: null });
  }

  onMunicipalityChange(muniId: number) {

  }

  // onFileSelected(event: Event) {
  //   const input = event.target as HTMLInputElement;
  //   if (input.files && input.files.length > 0) {
  //     this.editForm.patchValue({ picture: input.files[0] });
  //     this.editForm.get('picture')?.updateValueAndValidity();
  //   }
  // }

  // onGradeFileSelected(event: Event) {
  //   const input = event.target as HTMLInputElement;
  //   if (input.files && input.files.length > 0) {
  //     this.editForm.patchValue({ grade_pdf: input.files[0] });
  //     this.editForm.get('grade_pdf')?.updateValueAndValidity();
  //   }
  // }

  toggleSecretVisibility() {
    this.hideSecret = !this.hideSecret;
  }

  save() {
    const formData = new FormData();
    const rawValues = this.editForm.getRawValue(); 

    Object.keys(rawValues).forEach(key => {
      const value = rawValues[key];
      if (value !== null && value !== undefined && value !== '') {
        if (key === 'picture' && value instanceof File) {
          formData.append('picture', value);
        } else {
          formData.append(key, value);
        }
      }
    });

    this.loaderService.show();

    this.applicantService.updateApplicant(formData).subscribe({
      next: (res) => {
        this.loaderService.hide();
        this.toast.showSuccess('Application updated successfully!');
        this.dialogRef.close(true);

        const hasRefNo = res.has_ref_no;
        const hasAssessmentAnswers = res.has_assessment_answers;
        const applicationRefNo = res.application_ref_no;

        if (!hasRefNo || !hasAssessmentAnswers) {
          this.assessmentAccessGuard.allowAccessOnce();
          this.router.navigate(['assessment-form'], {
            state: {
              applicationRefNo: applicationRefNo,
              scholarshipTitle: 'Scholarship Application'
            }
          });
        } else {
          this.router.navigate(['apply/programs'], {
            state: {
              applicationRefNo: applicationRefNo,
              scholarshipTitle: 'Scholarship Application'
            }
          });
        }
      },
      error: err => {
        this.loaderService.hide();
        console.error('Update failed:', err);
        this.toast.showError('Failed to update application');
      }
    });
  }
}
