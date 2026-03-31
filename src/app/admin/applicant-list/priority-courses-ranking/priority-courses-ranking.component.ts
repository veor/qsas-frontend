import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService } from '../../../services/admin.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ToastService } from '../../../services/toast.service';
import { LoaderService } from '../../../services/loader.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-priority-courses-ranking',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule
  ],
  templateUrl: './priority-courses-ranking.component.html',
  styleUrl: './priority-courses-ranking.component.css'
})
export class PriorityCoursesRankingComponent implements OnInit {
  private adminService = inject(AdminService);
  private router = inject(Router);
  private toast = inject(ToastService); 
  private loader = inject(LoaderService);

  rankingData: any[] = [];
  filteredData: any[] = [];
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  isLoading: boolean = true;

  // Filters
  searchText: string = '';
  selectedCourse: string = '';
  selectedMunicipality: string = '';

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 20;

  // Filter options
  availableCourses: string[] = [];
  availableMunicipalities: string[] = [];

  rejectedApplicants: Set<string> = new Set();
  isConfirmingRejection: boolean = false;

  ngOnInit(): void {
    this.adminService.getTopByCourse().subscribe({
      next: (data) => {
        this.rankingData = this.getTop20PerCourse(data);
        this.filteredData = this.rankingData;
        this.availableCourses = [
          ...new Set(this.rankingData.map((d: any) => d.current_course).filter(Boolean))
        ].sort() as string[];
        this.availableMunicipalities = [
          ...new Set(this.rankingData.map((d: any) => d.municipality).filter(Boolean))
        ].sort() as string[];
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  getTop20PerCourse(data: any[]): any[] {
    const courseMap = new Map<string, any[]>();

    for (const item of data) {
      const course = item.current_course || 'Unknown';
      if (!courseMap.has(course)) courseMap.set(course, []);
      courseMap.get(course)!.push(item);
    }

    const result: any[] = [];
    for (const [, applicants] of courseMap) {
      const sorted = applicants
        .sort((a, b) => (b.priority_weight ?? 0) - (a.priority_weight ?? 0))
        .slice(0, 20);
      result.push(...sorted);
    }

    return result;
  }

  getAcademicLabel(value: string | number): string {
    const map: { [key: string]: string } = {
      '1': 'Graduating SHS',
      '2': 'Graduate of SHS',
      '3': '1st Year College',
      '4': '2nd Year College',
      '5': '3rd Year College',
      '6': '4th Year College (5 yr course)',
      '7': '4th Year College (Graduating Student)',
      '8': '5th Year College (Graduating Student)',
    };
    return map[String(value)] || '—';
  }

  getAcademicStatusClass(value: string | number): string {
    const v = String(value);
    if (['1', '2'].includes(v)) return 'status-badge--amber';
    if (['3', '4', '5'].includes(v)) return 'status-badge--blue';
    if (v === '6') return 'status-badge--purple';
    if (['7', '8'].includes(v)) return 'status-badge--teal';
    return '';
  }

  isAgeExcluded(age: number | null): boolean {
    if (age === null) return false;
    return age > 30;
  }

  isCivilStatusExcluded(civilStatus: string): boolean {
    if (!civilStatus) return false;
    return civilStatus.toLowerCase() !== 'single';
  }

  isExcluded(item: any): boolean {
    return this.isAgeExcluded(item.age) || this.isCivilStatusExcluded(item.civil_status);
  }

  sortBy(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.currentPage = 1;
    this.applySorting();
  }

  applySorting(): void {
    if (!this.sortColumn) return;

    this.filteredData = [...this.filteredData].sort((a, b) => {
      let valA = a[this.sortColumn];
      let valB = b[this.sortColumn];

      // Handle nulls — always push to bottom
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      // Numeric
      if (typeof valA === 'number' && typeof valB === 'number') {
        return this.sortDirection === 'asc' ? valA - valB : valB - valA;
      }

      // String
      valA = String(valA).toLowerCase();
      valB = String(valB).toLowerCase();
      if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  // Also update applyFilters to re-apply sorting after filtering
  applyFilters(): void {
    this.currentPage = 1;
    this.filteredData = this.rankingData.filter(item => {
      const matchesSearch = !this.searchText ||
        item.name?.toLowerCase().includes(this.searchText.toLowerCase());
      const matchesCourse = !this.selectedCourse || item.current_course === this.selectedCourse;
      const matchesMunicipality = !this.selectedMunicipality || item.municipality === this.selectedMunicipality;
      return matchesSearch && matchesCourse && matchesMunicipality;
    });
    this.applySorting();
  }

  clearFilters(): void {
    this.searchText = '';
    this.selectedCourse = '';
    this.selectedMunicipality = '';
    this.filteredData = this.rankingData;
    this.currentPage = 1;
  }
  
  toggleRejected(refNo: string): void {
    if (this.rejectedApplicants.has(refNo)) {
      this.rejectedApplicants.delete(refNo);
    } else {
      this.rejectedApplicants.add(refNo);
    }
  }

  isRejected(refNo: string): boolean {
    return this.rejectedApplicants.has(refNo);
  }

  confirmRejections(): void {
    if (this.rejectedApplicants.size === 0) return;

    this.isConfirmingRejection = true;
    this.loader.show(); 

    this.adminService.rejectPriorityApplicants(this.rejectedList).subscribe({
      next: (res) => {
        this.isConfirmingRejection = false;
        this.loader.hide();

        if (res.success) {
          const rejectedSet = new Set(this.rejectedApplicants);
          this.toast.showSuccess('Applicant Successfully Excluded.');

          this.rankingData = this.rankingData.filter(
            item => !rejectedSet.has(item.application_ref_no)
          );
          this.filteredData = this.filteredData.filter(
            item => !rejectedSet.has(item.application_ref_no)
          );

          this.rejectedApplicants.clear();
          this.currentPage = 1;

          if (res.failed_count > 0) {
            this.toast.showError('Some rejections failed:');
            // console.warn('Some rejections failed:', res.failed);
          }
        }
      },
      error: () => {
        this.loader.hide();
        this.isConfirmingRejection = false;
      }
    });
  }

  clearRejections(): void {
    this.rejectedApplicants.clear();
  }

  exportToExcel(): void {
    const exportData = this.filteredData.map((item, index) => ({
      '#': index + 1,
      'Name': item.name || '—',
      'Course Applied': item.current_course || '—',
      'Score': item.priority_weight !== null
        ? parseFloat(item.priority_weight).toFixed(2)
        : '—',
      'Age': item.age ?? '—',
      'Civil Status': item.civil_status || '—',
      'Academic Standing': this.getAcademicLabel(item.current_academic_status),
      'Municipality': item.municipality || '—',
      'Criteria Status': this.isExcluded(item)
        ? 'Excluded'
        : 'Qualified',
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);

    worksheet['!cols'] = [
      { wch: 5  },  // #
      { wch: 30 },  // Name
      { wch: 35 },  // Course Applied
      { wch: 10 },  // Score
      { wch: 8  },  // Age
      { wch: 15 },  // Civil Status
      { wch: 45 },  // Academic Standing
      { wch: 20 },  // Municipality
      { wch: 16 },  // Criteria Status
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Priority Courses Ranking');

    const timestamp = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(workbook, `priority-courses-ranking-${timestamp}.xlsx`);
  }

  exportSHSTopToExcel(): void {
    this.adminService.exportSHSTopByCourse().subscribe({
      next: (data) => {
        const academicMap: { [key: string]: string } = {
          '1': 'Graduating SHS',
          '2': 'Graduate of SHS',
        };

        const exportData = data.map((item, index) => ({
          '#':                    index + 1,
          'Application Ref No':   item.application_ref_no,
          'Name':                 item.name,
          'Course Applied':       item.course_applied,
          'Age':                  item.age ?? '—',
          'Civil Status':         item.civil_status,
          'Contact No':           item.contact,
          'Email':                item.email,
          'Academic Standing':    academicMap[String(item.current_academic_status)] ?? '—',
          'Municipality':         item.municipality,
          'Score':                item.priority_weight !== null
                                    ? parseFloat(String(item.priority_weight)).toFixed(2)
                                    : '—',
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        worksheet['!cols'] = [
          { wch: 5  },  // #
          { wch: 20 },  // Application Ref No
          { wch: 30 },  // Name
          { wch: 35 },  // Course Applied
          { wch: 8  },  // Age
          { wch: 15 },  // Civil Status
          { wch: 15 },  // Contact No
          { wch: 25 },  // Email
          { wch: 20 },  // Academic Standing
          { wch: 20 },  // Municipality
          { wch: 10 },  // Score
        ];

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'SHS Top 100 Per Course');

        const timestamp = new Date().toISOString().slice(0, 10);
        XLSX.writeFile(workbook, `shs-top100-per-course-${timestamp}.xlsx`);
      },
      error: () => {
        this.toast.showError('Failed to export data.');
      }
    });
  }

  get rejectedCount(): number {
    return this.rejectedApplicants.size;
  }

  get rejectedList(): string[] {
    return Array.from(this.rejectedApplicants);
  }

  get paginatedData(): any[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredData.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredData.length / this.itemsPerPage);
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get hasActiveFilters(): boolean {
    return !!(this.searchText || this.selectedCourse || this.selectedMunicipality);
  }

  goBack(): void {
    this.router.navigate(['/admin/dashboard']);
  }
}