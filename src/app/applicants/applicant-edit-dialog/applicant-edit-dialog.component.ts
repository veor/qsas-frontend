import { Component, Inject } from '@angular/core';
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
export class ApplicantEditDialogComponent {

  districts = ['First District', 'Second District', 'Third District', 'Fourth District'];
  municipalities: { [key: string]: string[] } = {
    'First District': [
      'Agdangan','Calauag','Catanauan','Dolores','General Luna',
      'Macalelon','Mulanay','Padre Burgos','Pitogo','Plaridel',
      'Quezon','Sampaloc','Tayabas City'
    ],
    'Second District': [
      'Alabat','Buenavista','Burdeos','Jomalig','Polillo',
      'San Andres','San Francisco'
    ],
    'Third District': [
      'Atimonan','Guinayangan','Gumaca','Lopez','San Narciso',
      'Tagkawayan'
    ],
    'Fourth District': [
      'Candelaria','General Nakar','Infanta','Lucban','Lucena City',
      'Mauban','Pagbilao','Perez','Sariaya','Tiaong','San Antonio','Unisan'
    ]
  };

  filteredMunicipalities: string[] = [];
  filteredBarangays: string[] = [];

  editForm: FormGroup;
  hideSecret = true; 
  hasSecretAnswer = true;
  
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
      children: [data.children],
      contact: [data.contact],
      email: [data.email, [Validators.email]],
      house_no: [data.house_no],
      street: [data.street],
      purok: [data.purok],
      district: [data.district],
      municipality: [data.municipality],
      barangay: [data.barangay],
      applicant_course: [data.applicant_course],
      current_academic_status: [data.current_academic_status],
      current_course: [data.current_course],
      current_school: [data.current_school],
      school_location: [data.school_location],
      secret_question: [data.secret_question],
      secret_answer: [''], 
      picture: [null],
      gradePDF: [null]
    });
  }

  ngOnInit() {
    const district = this.editForm.get('district')?.value;
    if (district) {
      this.filteredMunicipalities = this.municipalities[district] || [];
    }

    const municipality = this.editForm.get('municipality')?.value;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.editForm.patchValue({ picture: file });
      this.editForm.get('picture')?.updateValueAndValidity();
    }
  }

  onGradeFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.editForm.patchValue({ grade_pdf: file });
      this.editForm.get('grade_pdf')?.updateValueAndValidity();
    }
  }

  toggleSecretVisibility() {
    this.hideSecret = !this.hideSecret;
  }

  onDistrictChange(district: string) {
    this.filteredMunicipalities = this.municipalities[district] || [];
    this.editForm.patchValue({ municipality: '' });
  }

  onMunicipalityChange(muni: string) {
    this.editForm.patchValue({ barangay: '' });
  }

save() {
  const formData = new FormData();
  Object.keys(this.editForm.value).forEach(key => {
    const value = this.editForm.value[key];
    if (value !== null && value !== undefined) {
      if (key === 'picture' && value instanceof File) {
        formData.append('picture', value);
      } else {
        formData.append(key, value);
      }
    }
  });

  this.loaderService.show();

  this.applicantService.updateApplicant(formData).subscribe({
    next: () => {
      this.loaderService.hide();
      this.toast.showSuccess('Application updated successfully!');
      this.dialogRef.close(true);

      this.assessmentAccessGuard.allowAccessOnce();

      this.router.navigate(['apply/programs'], {
        state: { 
          applicationRefNo: this.data.application_ref_no,
          scholarshipTitle: 'Scholarship Application'
        }
      });
    },
    error: err => {
      this.loaderService.hide();
      console.error('Update failed:', err);
      this.toast.showError('Failed to update application ');
    }
  });
}



}
