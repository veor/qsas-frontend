import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AdminService, Applicant } from '../../services/admin.service';
import { environment } from '../../../environments/environment.development';
import { MatNativeDateModule } from '@angular/material/core';
import { ActivatedRoute } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { LoaderService } from '../../services/loader.service';
import { PreviewApplicantComponent } from '../preview-applicant/preview-applicant.component';

@Component({
  selector: 'app-applicant-list',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule,
    NgxPaginationModule,
    MatDialogModule     
  ],
  templateUrl: './applicant-list.component.html',
  styleUrl: './applicant-list.component.css'
})
export class ApplicantListComponent {
  
  apiUrl = environment.apiUrl;
  private adminService = inject(AdminService);
  private route = inject(ActivatedRoute);
  private loaderService = inject(LoaderService);
  private dialog = inject(MatDialog);

  currentDate: string = '';
  searchText: string = '';
  selectedOption: string = 'Application for Quezon Science High School Exam';
  selectedType: string = '';
  applicants: Applicant[] = [];
  selectedDateRange: { start: Date | null; end: Date | null } = { start: null, end: null };
  page: number = 1;       
  itemsPerPage: number = 5;
  itemsPerPageOptions: number[] = [5, 10, 25, 50];
  selectedAcademicStatus: string = '';

  ngOnInit(): void {
    this.loaderService.show();
    this.route.queryParams.subscribe(params => {
      if (params['scholarship']) {
        this.selectedOption = params['scholarship'];
      } else {
        this.selectedOption = ''; 
      }
    });

    // fetch server date
    fetch('/api/server-date')
      .then(res => res.json())
      .then(data => {
        this.currentDate = new Date(data.date).toLocaleDateString('en-US', {
          year: 'numeric', month: 'long', day: 'numeric'
        });
      })
      .catch(() => {
        this.currentDate = new Date().toLocaleDateString('en-US', {
          year: 'numeric', month: 'long', day: 'numeric'
        });
      });

    // fetch applicants
    this.adminService.getApplicants().subscribe({
      next: (res) => {
        this.applicants = res;
        this.loaderService.hide(); 
      },
      error: () => {
        this.loaderService.hide(); 
      }
    });
  }
  getRecommendingAssessment(applicant: any): number | string {
    return applicant.recommending_assessment ?? '-';
  }
  // get filteredApplicants(): Applicant[] {
  //   let filtered = this.applicants;

  //   if (this.selectedOption && this.selectedOption !== '') {
  //     filtered = filtered.filter(app => app.scholarship_type === this.selectedOption);
  //   }

  //   if (this.searchText) {
  //     const search = this.searchText.toLowerCase();
  //     filtered = filtered.filter(app =>
  //       app.name.toLowerCase().includes(search) ||
  //       app.application_ref_no.toLowerCase().includes(search) 
  //     );
  //   }

  //   if (this.selectedDateRange.start && this.selectedDateRange.end) {
  //     const start = new Date(this.selectedDateRange.start).getTime();
  //     const end = new Date(this.selectedDateRange.end).getTime();

  //     filtered = filtered.filter(app => {
  //       const appDate = new Date(app.created_at).getTime();
  //       return appDate >= start && appDate <= end;
  //     });
  //   }

  //   return filtered;
  // }
  get filteredApplicants(): Applicant[] {
    let filtered = this.applicants;

    if (this.selectedOption && this.selectedOption !== '') {
      filtered = filtered.filter(app => app.scholarship_type === this.selectedOption);
    }

    // Filter by academic status level
    if (this.selectedAcademicStatus !== '') {
      filtered = filtered.filter(app =>
        String(app.current_academic_status) === this.selectedAcademicStatus
      );
    }

    if (this.searchText) {
      const search = this.searchText.toLowerCase();
      filtered = filtered.filter(app =>
        app.name.toLowerCase().includes(search) ||
        app.application_ref_no.toLowerCase().includes(search)
      );
    }

    if (this.selectedDateRange.start && this.selectedDateRange.end) {
      const start = new Date(this.selectedDateRange.start).getTime();
      const end = new Date(this.selectedDateRange.end).getTime();
      filtered = filtered.filter(app => {
        const appDate = new Date(app.created_at).getTime();
        return appDate >= start && appDate <= end;
      });
    }

    return filtered;
  }
  openPreview(applicant: Applicant) {
    this.dialog.open(PreviewApplicantComponent, {
      width: '800px',
      data: {
        ...applicant,
        picture: applicant.picture ? (this.apiUrl + applicant.picture) : 'assets/default-avatar.png',
        // picture: applicant.picture || 'assets/default-avatar.png', ///prod
        grade_pdf: applicant.grade_pdf ? (this.apiUrl + applicant.grade_pdf) : null 
        // grade_pdf: applicant.grade_pdf ?? null  //prod
      }
    });
  }
  
  get totalPages(): number {
    return Math.ceil(this.filteredApplicants.length / this.itemsPerPage);
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  onItemsPerPageChange(): void {
    this.page = 1;
  }

  goToPage(p: number): void {
    this.page = p;
  }
}
