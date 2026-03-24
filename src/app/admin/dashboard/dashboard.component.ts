import { Component, inject, OnInit } from '@angular/core';
import { AuthService, User } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { SearchPipe } from "../../shared/search.pipe";
import { AdminService } from '../../services/admin.service';
import { LoaderService } from '../../services/loader.service';
import { ToastService } from '../../services/toast.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SearchPipe,
    MatIconModule
],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private adminService = inject(AdminService); 
  private http = inject(HttpClient);

  currentUser: User | null = null;
  currentDate: string = '';
  searchText: string = '';
// -- TOP 35 PRIORITY COURSES PER COURSES APPLIED
  topByCourse: { application_ref_no: string; current_course: string; priority_weight: number | null }[] = [];
  selectedCourse: string = '';
  // Pagination for top by course
  courseRankPage: number = 1;
  courseRankItemsPerPage: number = 5;

// Municipality ranking state
  topByMunicipality: {
    application_ref_no: string;
    municipality: string;
    scholarship_type: string;
    assessment_weight: number | null;
  }[] = [];

  munRankPage: number = 1;
  munRankTotalPages: number = 1;
  munRankTotal: number = 0;
  munRankPageNumbers: number[] = [];
  availableMunicipalities: string[] = [];
  availableScholarships: string[] = [];
  selectedMunicipality: string = '';
  selectedMunScholarship: string = '';
  munLoading: boolean = false;
  scholarships = [
    {
      title: 'Application for Quezon Science High School Exam',
      description: 'Apply now for the entrance exam at QSHS',
      applicants: 0
    },
    {
      title: 'One Family One College Graduate Scholarship',
      description: 'Support for one college graduate per family',
      applicants: 0
    },
    {
      title: 'Priority Courses Scholarship',
      description: 'Scholarship for students in priority courses',
      applicants: 0
    },
    {
      title: 'STAN C',
      description: 'A special scholarship program for excellence',
      applicants: 0
    }
  ];

  constructor(
    private router: Router,
    private loaderService: LoaderService,  
    private toast: ToastService  
  ) {}

  // ngOnInit(): void {
  //     this.authService.currentUser$.subscribe(user => {
  //       this.currentUser = user;
  //     });
  //     this.adminService.getTopByCourse().subscribe({
  //       next: (data) => {
  //         this.topByCourse = data;
  //       },
  //       error: () => {}
  //     });
  //     this.loaderService.show();
      
  //     this.http.get<{ date: string }>('/api/server-date').subscribe({
  //       next: (res) => {
  //         const dateOnly = new Date(res.date).toLocaleDateString('en-US', {
  //           year: 'numeric',
  //           month: 'long',
  //           day: 'numeric'
  //         });
  //         this.currentDate = dateOnly;
  //       },
  //       error: () => {
  //         this.currentDate = new Date().toLocaleDateString('en-US', {
  //           year: 'numeric',
  //           month: 'long',
  //           day: 'numeric'
  //         });
  //       }
  //     });

  //     // Fetch scholarship counts
  // this.adminService.getScholarshipCounts().subscribe({
  //     next: (counts) => {
  //       this.scholarships = [
  //         {
  //           title: 'Application for Quezon Science High School Exam',
  //           description: 'Apply now for the entrance exam at QSHS',
  //           applicants: counts['Application for Quezon Science High School Exam'] ?? 0
  //         },
  //         {
  //           title: 'One Family One College Graduate Scholarship',
  //           description: 'Support for one college graduate per family',
  //           applicants: counts['One Family One College Graduate Scholarship'] ?? 0
  //         },
  //         {
  //           title: 'Priority Courses Scholarship',
  //           description: 'Scholarship for students in priority courses',
  //           applicants: counts['Priority Courses Scholarship'] ?? 0
  //         },
  //         {
  //           title: 'STAN C',
  //           description: 'A special scholarship program for excellence',
  //           applicants: counts['STAN C'] ?? 0
  //         }
  //       ];
  //       this.loaderService.hide(); // hide loader when done
  //     },
  //     error: () => {
  //       this.loaderService.hide(); // hide loader even on error
  //     }
  //   });
  // }
  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    this.adminService.getTopByCourse().subscribe({
      next: (data) => { this.topByCourse = data; },
      error: () => {}
    });

    this.loadTopByMunicipality();

    this.loaderService.show();

    this.http.get<{ date: string }>('/api/server-date').subscribe({
      next: (res) => {
        this.currentDate = new Date(res.date).toLocaleDateString('en-US', {
          year: 'numeric', month: 'long', day: 'numeric'
        });
      },
      error: () => {
        this.currentDate = new Date().toLocaleDateString('en-US', {
          year: 'numeric', month: 'long', day: 'numeric'
        });
      }
    });

    this.adminService.getScholarshipCounts().subscribe({
      next: (counts) => {
        this.scholarships = [
          {
            title: 'Application for Quezon Science High School Exam',
            description: 'Apply now for the entrance exam at QSHS',
            applicants: counts['Application for Quezon Science High School Exam'] ?? 0
          },
          {
            title: 'One Family One College Graduate Scholarship',
            description: 'Support for one college graduate per family',
            applicants: counts['One Family One College Graduate Scholarship'] ?? 0
          },
          {
            title: 'Priority Courses Scholarship',
            description: 'Scholarship for students in priority courses',
            applicants: counts['Priority Courses Scholarship'] ?? 0
          },
          {
            title: 'STAN C',
            description: 'A special scholarship program for excellence',
            applicants: counts['STAN C'] ?? 0
          }
        ];
        this.loaderService.hide();
      },
      error: () => { this.loaderService.hide(); }
    });
  }

  selectScholarship(scholarship: any) {
    if (!this.authService.hasPermission('applicantList.access')) {
      this.toast.showError('You do not have permission to view the applicant list.');
      return;
    }

    if (scholarship.title === 'Priority Courses Scholarship') {
      this.router.navigate(['/admin/priority-courses-ranking']);
    } else if (scholarship.title === 'One Family One College Graduate Scholarship') {
      this.router.navigate(['/admin/one-poor-fam-ranking']);
    }
      else if (scholarship.title === 'STAN C') {
      this.router.navigate(['/admin/stan-c-ranking']);
    }
    else {
      this.router.navigate(['/admin/applicantList'], {
        queryParams: { scholarship: scholarship.title }
      });
    }
}

// -- TOP 35 for Priority Courses 
  get availableCourses(): string[] {
    const courses = this.topByCourse
      .map(item => item.current_course)
      .filter(c => c && c !== 'N/A');
    return [...new Set(courses)].sort();
  }

  get filteredTopByCourse() {
    if (!this.selectedCourse) return this.topByCourse;
    return this.topByCourse.filter(item => item.current_course === this.selectedCourse);
  }

  get paginatedTopByCourse() {
    const start = (this.courseRankPage - 1) * this.courseRankItemsPerPage;
    return this.filteredTopByCourse.slice(start, start + this.courseRankItemsPerPage);
  }

  get courseRankTotalPages(): number {
    return Math.ceil(this.filteredTopByCourse.length / this.courseRankItemsPerPage);
  }

  get courseRankPageNumbers(): number[] {
    return Array.from({ length: this.courseRankTotalPages }, (_, i) => i + 1);
  }

  onCourseFilterChange(): void {
    this.courseRankPage = 1;
  }

  loadTopByMunicipality(): void {
    this.munLoading = true;
    this.adminService.getTopByMunicipality({
      page:              this.munRankPage,
      scholarship_type:  this.selectedMunScholarship || undefined,
      municipality:      this.selectedMunicipality   || undefined,
    }).subscribe({
      next: (res) => {
        this.topByMunicipality      = res.data;
        this.munRankTotal           = res.total;
        this.munRankTotalPages      = res.total_pages;
        this.munRankPageNumbers     = Array.from({ length: res.total_pages }, (_, i) => i + 1);
        this.availableMunicipalities = res.available_municipalities;
        this.availableScholarships  = res.available_scholarships;
        this.munLoading             = false;
      },
      error: () => { this.munLoading = false; }
    });
  }

  onMunFilterChange(): void {
    this.munRankPage = 1;
    this.loadTopByMunicipality();
  }

  onMunPageChange(page: number): void {
    this.munRankPage = page;
    this.loadTopByMunicipality();
  }
}
