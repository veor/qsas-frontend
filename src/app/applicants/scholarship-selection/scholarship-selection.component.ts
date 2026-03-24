import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ApplicantHeaderComponent } from '../../shared/applicant-header/applicant-header.component';
import { ScholarshipConfirmationDialogComponent } from './scholarship-confirmation-dialog/scholarship-confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { ToastService } from '../../services/toast.service';
import { LoaderService } from '../../services/loader.service';
import { ApplicantService } from '../../services/applicant.service';
import { DownloadFormDialogComponent } from './download-form-dialog/download-form-dialog.component';
import { environment } from '../../../environments/environment.development';

const FORM_DOWNLOADS: Record<string, string> = {
  'priority-courses': environment.production
    ? 'https://qsas.quezon.gov.ph/qsas-backend/public/files/priority-courses-form.pdf'
    : 'https://localhost/qsas/qsas-backend/files/priority-courses-form.pdf',

  'qshs-exam': environment.production
    ? 'https://qsas.quezon.gov.ph/qsas-backend/public/files/qshs-exam-form.pdf'
    : 'https://localhost/qsas/qsas-backend/files/qshs-exam-form.pdf',

  'one-family-scholarship': environment.production
    ? 'https://qsas.quezon.gov.ph/qsas-backend/public/files/1pf1cg-form.pdf'
    : 'https://localhost/qsas/qsas-backend/files/1pf1cg-form.pdf',
};


interface Scholarship {
  id: string;
  title: string;
  deadline: string;
  requirements: string[];
  disabled?: boolean;
}

@Component({
  selector: 'app-scholarship-selection',
  standalone: true,
  imports: [
    CommonModule,
    ApplicantHeaderComponent,
    MatIcon  
  ],
  templateUrl: './scholarship-selection.component.html',
  styleUrls: ['./scholarship-selection.component.css']
})
export class ScholarshipSelectionComponent {
  private toast = inject(ToastService);
  private loader = inject(LoaderService);
  private applicantService = inject(ApplicantService);

  applicationRefNo: string = '';
  appliedScholarships: string[] = [];

  scholarships: Scholarship[] = [
    {
      id: 'qshs-exam',
      title: 'Application for Quezon Science High School Exam',
      deadline: '',
      requirements: ['Grade 6 completion certificate', 'Good moral character certificate', 'Birth certificate', 'Recent school grades'],
      disabled: true
    },
    {
      id: 'one-family-scholarship',
      title: 'One Family One College Graduate Scholarship',
      deadline: '',
      requirements: ['High school diploma', 'Family income certificate', 'Academic records', 'Essay submission']
    },
    {
      id: 'priority-courses',
      title: 'Priority Courses Scholarship',
      deadline: '',
      requirements: ['Course selection from priority list', 'Academic transcript', 'Letter of intent', 'Recommendation letters']
    },
    {
      id: 'stan-c',
      title: 'STAN C',
      deadline: '',
      requirements: ['Specific eligibility criteria', 'Application form', 'Supporting documents']
    }
  ];

  PRIORITY_COURSES = [
    'Doctor of Medicine',
    'Doctor of Veterinary Medicine',
    'BS Medicine Technology/Medical Laboratory',
    'BS Midwifery',
    'BS Nursing',
    'BS Nutrition and Dietetics',
    'BS Occupational Therapy',
    'BS Pharmacy',
    'BS Physical Therapy',
    'BS Radiologic Technology',
    'BS Respiratory Therapy',
    'BS Speech and Language Pathology',
    'BS Social Work',
    'Teacher Education: Special Needs Education',
    'BS Chemistry',
    'BS Geology',
    'BS Meteorology',
    'BS Biomedical Engineering',
    'BS Agricultural and Biosystems Engineering',
    'BS Food Technology'
  ];

  constructor(
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    const navState = history.state;
    this.applicationRefNo = navState?.applicationRefNo || localStorage.getItem('applicationRefNo') || '';

     if (this.applicationRefNo) {
      this.applicantService.getAppliedScholarships(this.applicationRefNo).subscribe({
        next: (types) => this.appliedScholarships = types,
        error: () => this.toast.showError('Failed to load existing applications.')
      });
    }
  }

  // isAlreadyApplied(scholarship: Scholarship): boolean {
  //   return this.appliedScholarships.includes(scholarship.title);
  // }
  isAlreadyApplied(scholarship: Scholarship): boolean {
    return scholarship.disabled || this.appliedScholarships.includes(scholarship.title);
  }

  hasFormDownload(scholarship: Scholarship): boolean {
    return !!FORM_DOWNLOADS[scholarship.id];
  }

  downloadForm(scholarship: Scholarship): void {
    const formUrl = FORM_DOWNLOADS[scholarship.id];
    if (formUrl) {
      window.open(formUrl, '_blank');
    }
  }

   selectScholarship(scholarship: Scholarship): void {
      if (this.isAlreadyApplied(scholarship)) return;
      if (!this.applicationRefNo) {
        this.toast.showError('Missing application reference number.');
        return;
      }

      const dialogRef = this.dialog.open(ScholarshipConfirmationDialogComponent, {
        width: '400px',
        // data: { title: scholarship.title },
        data: { 
          title: scholarship.title,
          courses: scholarship.id === 'priority-courses' ? this.PRIORITY_COURSES : [] 
        },
        disableClose: true
      });

      dialogRef.afterClosed().subscribe(result => {
        if (!result) return;

        this.loader.show();

        this.applicantService
          // .updateScholarshipType(this.applicationRefNo, scholarship.title)
          .updateScholarshipType(this.applicationRefNo, scholarship.title, result)
          .subscribe({
            next: () => {
              this.loader.hide();
              this.toast.showSuccess('Program selected successfully!');
              this.appliedScholarships = [...this.appliedScholarships, scholarship.title];

              const formUrl = FORM_DOWNLOADS[scholarship.id];
              if (formUrl) {
                this.dialog.open(DownloadFormDialogComponent, {
                  width: '460px',
                  disableClose: false,
                  data: {
                    title: scholarship.title,
                    formUrl
                  }
                });
              }
            },
            error: () => {
              this.loader.hide();
              this.toast.showError('Failed to save program selection.');
            }
          });
      });
    }

}