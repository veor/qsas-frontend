import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ApplicantHeaderComponent } from '../../shared/applicant-header/applicant-header.component';
import { ScholarshipConfirmationDialogComponent } from './scholarship-confirmation-dialog/scholarship-confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ToastService } from '../../services/toast.service';
import { LoaderService } from '../../services/loader.service';
import { ApplicantService } from '../../services/applicant.service';


interface Scholarship {
  id: string;
  title: string;
  deadline: string;
  requirements: string[];
}

@Component({
  selector: 'app-scholarship-selection',
  standalone: true,
  imports: [
    CommonModule,
    ApplicantHeaderComponent
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
      deadline: 'March 15, 2025',
      requirements: ['Grade 6 completion certificate', 'Good moral character certificate', 'Birth certificate', 'Recent school grades']
    },
    {
      id: 'one-family-scholarship',
      title: 'One Family One College Graduate Scholarship',
      deadline: 'April 30, 2025',
      requirements: ['High school diploma', 'Family income certificate', 'Academic records', 'Essay submission']
    },
    {
      id: 'priority-courses',
      title: 'Priority Courses Scholarship',
      deadline: 'May 20, 2025',
      requirements: ['Course selection from priority list', 'Academic transcript', 'Letter of intent', 'Recommendation letters']
    },
    {
      id: 'stan-c',
      title: 'Stan C',
      deadline: 'June 10, 2025',
      requirements: ['Specific eligibility criteria', 'Application form', 'Supporting documents']
    }
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

  isAlreadyApplied(scholarship: Scholarship): boolean {
    return this.appliedScholarships.includes(scholarship.title);
  }

  selectScholarship(scholarship: Scholarship): void {
    if (this.isAlreadyApplied(scholarship)) return;
    if (!this.applicationRefNo) {
      this.toast.showError('Missing application reference number.');
      return;
    }

    const dialogRef = this.dialog.open(ScholarshipConfirmationDialogComponent, {
      width: '400px',
      data: { title: scholarship.title },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {

      if (!result) return;

      this.loader.show();

      this.applicantService
        .updateScholarshipType(this.applicationRefNo, scholarship.title)
        .subscribe({
          next: () => {
            this.loader.hide();
            this.toast.showSuccess('Program selected successfully!');
            this.appliedScholarships = [...this.appliedScholarships, scholarship.title];
          },
          error: () => {
            this.loader.hide();
            this.toast.showError('Failed to save program selection.');
          }
        });

    });
  }
}