import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AdminService } from '../../../services/admin.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-stan-c-ranking',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './stan-c-ranking.component.html',
  styleUrl: './stan-c-ranking.component.css'
})

export class StanCRankingComponent implements OnInit {
  private adminService = inject(AdminService);
  private router       = inject(Router);

  rankingData: any[]   = [];
  filteredData: any[]  = [];
  isLoading: boolean   = true;

  searchText: string          = '';
  selectedMunicipality: string = '';

  currentPage: number    = 1;
  itemsPerPage: number   = 20;

  availableMunicipalities: string[] = [];

  sortColumn: string             = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  rejectedApplicants: Set<string> = new Set();
  isConfirmingRejection: boolean  = false;

  ngOnInit(): void {
    this.adminService.getTopByStanC().subscribe({
      next: (data) => {
        this.rankingData  = data;
        this.filteredData = data;
        this.availableMunicipalities = [
          ...new Set(data.map((d: any) => d.municipality).filter(Boolean))
        ].sort() as string[];
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  applyFilters(): void {
    this.currentPage  = 1;
    this.filteredData = this.rankingData.filter(item => {
      const matchesSearch      = !this.searchText ||
        item.name?.toLowerCase().includes(this.searchText.toLowerCase());
      const matchesMunicipality = !this.selectedMunicipality ||
        item.municipality === this.selectedMunicipality;
      return matchesSearch && matchesMunicipality;
    });
    this.applySorting();
  }

  clearFilters(): void {
    this.searchText           = '';
    this.selectedMunicipality = '';
    this.filteredData         = this.rankingData;
    this.currentPage          = 1;
    this.applySorting();
  }

  sortBy(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn    = column;
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

      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      if (typeof valA === 'number' && typeof valB === 'number') {
        return this.sortDirection === 'asc' ? valA - valB : valB - valA;
      }

      valA = String(valA).toLowerCase();
      valB = String(valB).toLowerCase();
      if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return this.sortDirection === 'asc' ?  1 : -1;
      return 0;
    });
  }

  get paginatedData(): any[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredData.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredData.length / this.itemsPerPage) || 1;
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get hasActiveFilters(): boolean {
    return !!(this.searchText || this.selectedMunicipality);
  }

  // --- Exclusion criteria ---
  isAgeExcluded(age: number | null): boolean {
    return age !== null && age > 30;
  }

  isCivilStatusExcluded(civilStatus: string): boolean {
    return !!civilStatus && civilStatus.toLowerCase() !== 'single';
  }

  isExcluded(item: any): boolean {
    return this.isAgeExcluded(item.age) || this.isCivilStatusExcluded(item.civil_status);
  }

  // --- Academic label ---
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

  // --- Rejection ---
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

  get rejectedCount(): number {
    return this.rejectedApplicants.size;
  }

  get rejectedList(): string[] {
    return Array.from(this.rejectedApplicants);
  }

  clearRejections(): void {
    this.rejectedApplicants.clear();
  }

  confirmRejections(): void {
    if (this.rejectedApplicants.size === 0) return;
    this.isConfirmingRejection = true;

    this.adminService.rejectStanCApplicants(this.rejectedList).subscribe({
      next: (res) => {
        this.isConfirmingRejection = false;
        if (res.success) {
          const rejectedSet    = new Set(this.rejectedApplicants);
          this.rankingData     = this.rankingData.filter(item => !rejectedSet.has(item.application_ref_no));
          this.filteredData    = this.filteredData.filter(item => !rejectedSet.has(item.application_ref_no));
          this.rejectedApplicants.clear();
          this.currentPage = 1;
        }
      },
      error: () => { this.isConfirmingRejection = false; }
    });
  }

  // --- Export ---
  exportToExcel(): void {
    const exportData = this.filteredData.map((item, index) => ({
      '#':                   index + 1,
      'Name':                item.name || '—',
      'Municipality':        item.municipality || '—',
      'Score':               item.assessment_weight !== null
        ? parseFloat(item.assessment_weight).toFixed(2)
        : '—',
      'Age':                 item.age ?? '—',
      'Civil Status':        item.civil_status || '—',
      "Father's Profession": item.fathers_profession || '—',
      "Mother's Profession": item.mothers_profession || '—',
      'Academic Standing':   this.getAcademicLabel(item.current_academic_status),
      'Criteria Status':     this.isExcluded(item) ? 'Excluded' : 'Qualified',
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    worksheet['!cols'] = [
      { wch: 5  },
      { wch: 30 },
      { wch: 20 },
      { wch: 10 },
      { wch: 8  },
      { wch: 15 },
      { wch: 25 },
      { wch: 25 },
      { wch: 45 },
      { wch: 16 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'STAN C');

    const timestamp = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(workbook, `stan-c-ranking-${timestamp}.xlsx`);
  }

  goBack(): void {
    this.router.navigate(['/admin/dashboard']);
  }
}

