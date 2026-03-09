import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApplicantService } from '../../services/applicant.service';
import { LoaderService } from '../../services/loader.service';
import { AdminService } from '../../services/admin.service';
import { AuthService } from '../../services/auth.service';
import { forkJoin } from 'rxjs';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ToastService } from '../../services/toast.service';
import { Location } from '@angular/common';

interface Question {
  id: string;
  question: string;
  options: { text: string; points: number }[];
  selectedAnswer?: string;
  type: 'mcq' | 'short'; 
  weight?: number;
}

interface AssessmentResponse {
  success: boolean;
  data?: any[];
  message?: string;
}

@Component({
  selector: 'app-admin-assessment-form',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    MatDialogModule
  ],
  templateUrl: './admin-assessment-form.component.html',
  styleUrl: './admin-assessment-form.component.css'
})
export class AdminAssessmentFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private adminService = inject(AdminService);
  private applicantService = inject(ApplicantService);
  private authService = inject(AuthService);
  private loader = inject(LoaderService);
  private dialog = inject(MatDialog);
  private toast = inject(ToastService);
  private location = inject(Location);

  applicationRefNo = '';
  assessorIdNo = '';
  questions: Question[] = [];
  blankCopy: { [key: string]: Question } = {};
  isLoading = true;
  currentPage: number = 1;
  itemsPerPage: number = 5;

  ngOnInit(): void {
    this.applicationRefNo = this.route.snapshot.paramMap.get('refNo') ?? '';

    const currentUser = this.authService.getCurrentUser();
    this.assessorIdNo = currentUser?.idNo || '';

    this.loadAssessment();
  }

  loadAssessment(): void {
    this.loader.show();

    forkJoin({
      applicant: this.applicantService.getAssessmentAnswers(this.applicationRefNo),
      assessor: this.adminService.getAssessmentAnswers(this.applicationRefNo),
      questions: this.adminService.getQuestions()
    }).subscribe({
      next: (results) => {
        const applicantRes = results.applicant as AssessmentResponse;
        const assessorRes = results.assessor as AssessmentResponse;
        const questionsRes = results.questions;

        if (questionsRes.success && questionsRes.data) {
          this.questions = questionsRes.data
            .filter(q => q.is_active === 1)
            .map(q => ({
              id: q.id,
              question: q.question, 
              options: q.options,
              selectedAnswer: '',
              type: q.type ,
              weight: 0
            }));

          this.blankCopy = {};
          this.questions.forEach(q => {
            this.blankCopy[q.id] = { ...q, weight: 0 };
          });

          // Fill applicant answers
          if (applicantRes?.success && applicantRes.data) {
            applicantRes.data.forEach(saved => {
              const q = this.questions.find(q => q.id === saved.id);
              if (q) {
                // for both MCQ and short answers
                q.selectedAnswer = saved.answer;
              }
            });
          }

        // Fill assessor's answers, default to applicant's answer if assessor hasn't saved yet
        if (this.questions.length) {
          this.questions.forEach(q => {
            const applicantAns = q.selectedAnswer || ''; // applicant's answer
            const assessorSaved = assessorRes?.data?.find(a => a.id === q.id)?.answer;

            // Use assessor's saved answer if exists; otherwise use applicant's answer
            this.blankCopy[q.id].selectedAnswer = assessorSaved ?? applicantAns;
          });
        }
      }

        this.loader.hide();
        this.isLoading = false;
      },
      error: (error) => {
        this.toast.showError('Error to loading assessment');
        this.loader.hide();
        this.isLoading = false;
      }
    });
  }

  confirmSaveAssessment(): void {
    const answers = Object.keys(this.blankCopy).map(key => ({
      id: key,
      answer: this.blankCopy[key].selectedAnswer || '',
      weight: this.blankCopy[key].weight || 0
    }));

    const unanswered = answers.filter(a => !a.answer);
    if (unanswered.length > 0) {
      this.toast.showInfo(
        `Please answer all questions. ${unanswered.length} question(s) remaining.`
      );
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Submit Assessment',
        message: 'Are you sure you want to submit this assessment? This action will save your evaluation.',
        confirmText: 'Submit'
      }
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.saveAssessment();
      }
    });
  }

  saveAssessment(): void {
    const answers = Object.keys(this.blankCopy).map(key => ({
      id: key,
      answer: this.blankCopy[key].selectedAnswer || '',
      weight: this.blankCopy[key].weight || 0
    }));

    this.loader.show();

    const data = {
      application_ref_no: this.applicationRefNo,
      assessor_id_no: this.assessorIdNo,
      answers
    };

    this.adminService.saveAssessorEvaluation(data).subscribe({
      next: (res) => {
        this.loader.hide();
        if (res.success) {
          this.toast.showSuccess('Assessment saved successfully!');
          this.location.back();
        } else {
          this.toast.showError('Failed to save assessment: ' + res.message);
        }
      },
      error: () => {
        this.loader.hide();
        this.toast.showError('Error saving assessment. Please try again.');
      }
    });
  }

  get totalPages(): number {
    return Math.ceil(this.questions.length / this.itemsPerPage);
  }

  get paginatedQuestions(): Question[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.questions.slice(start, end);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

}