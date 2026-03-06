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

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SearchPipe
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
      title: 'Stan C',
      description: 'A special scholarship program for excellence',
      applicants: 0
    }
  ];

  constructor(
    private router: Router,
    private loaderService: LoaderService,  
    private toast: ToastService  
  ) {}

 ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
    this.loaderService.show();
    
    // fetch current date
    this.http.get<{ date: string }>('/api/server-date').subscribe({
      next: (res) => {
        const dateOnly = new Date(res.date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        this.currentDate = dateOnly;
      },
      error: () => {
        this.currentDate = new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
    });

    // Fetch scholarship counts
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
          title: 'Stan C',
          description: 'A special scholarship program for excellence',
          applicants: counts['Stan C'] ?? 0
        }
      ];
      this.loaderService.hide(); // hide loader when done
    },
    error: () => {
      this.loaderService.hide(); // hide loader even on error
    }
  });
}


selectScholarship(scholarship: any) {
  if (this.authService.hasPermission('applicantList.access')) {
    this.router.navigate(['/admin/applicantList'], {
      queryParams: { scholarship: scholarship.title }
    });
  } else {
      this.toast.showError('You do not have permission to view the applicant list.');
  }
}

}
