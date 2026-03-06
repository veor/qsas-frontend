import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApplicantHeaderComponent } from "../../shared/applicant-header/applicant-header.component";
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Router } from '@angular/router';
import { ToastService } from '../../services/toast.service';
import { LoaderService } from '../../services/loader.service';
import { AssessmentService } from '../../services/assessment.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DataPrivacyDialogComponent } from './data-privacy-dialog/data-privacy-dialog.component';

export type QuestionType = 'mcq' | 'short';

interface Question {
  id: string;
  question: string;
  options: string[];
  selectedAnswer?: string;
  type: QuestionType;
}

interface AssessmentAnswer {
  id: string;
  answer: string;
}

@Component({
  selector: 'app-assessment-form',
  standalone: true,
  imports: [
    ApplicantHeaderComponent,
    CommonModule, 
    FormsModule,
    MatProgressBarModule,
    MatDialogModule
  ],
        
  templateUrl: './assessment-form.component.html',
  styleUrl: './assessment-form.component.css'
})
export class AssessmentFormComponent {
  private assessmentService = inject(AssessmentService);
  private router = inject(Router);
  private toast = inject(ToastService);
  private loader = inject(LoaderService);
  private dialog = inject(MatDialog);

  questions: Question[] = [];
  applicationRefNo: string = '';
  isLoading: any;
  currentPage: number = 1;
  itemsPerPage: number = 10;

  ngOnInit() {
    const navState = history.state;
    this.applicationRefNo = navState?.applicationRefNo || '';
    this.loader.show();

    this.assessmentService.getAssessmentQuestions().subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          this.questions = res.data.map((q: Question) => ({
            ...q,
            selectedAnswer: q.selectedAnswer?.trim() ? q.selectedAnswer.trim() : ''
          }));
          this.loader.hide()
        } else {
          this.loader.hide();
        }
      },
    });
  }

  prefillAnswers(savedAnswers: AssessmentAnswer[]): void {
    savedAnswers.forEach(({ id, answer }) => {
      if (!answer) return; 

      const question = this.questions.find(q => q.id === id);
      if (question) {
        question.selectedAnswer = answer;
      }
    });
  }

  isFormValid(): boolean {
    return this.questions.every(q => typeof q.selectedAnswer === 'string' && q.selectedAnswer.trim() !== '');
  }

  onSubmit(): void {
    if (!this.isFormValid()) {
      this.toast.showError('Please answer all questions before submitting.');
      return;
    }

    if (!this.applicationRefNo) {
      this.toast.showError('Missing application reference number.');
      return;
    }

    // Open Data Privacy Dialog
    const dialogRef = this.dialog.open(DataPrivacyDialogComponent, {
      width: '500px'
    });

    dialogRef.afterClosed().subscribe((concur: boolean) => {
      if (!concur) {
        this.toast.showInfo('You must concur with the Data Privacy Notice to submit.');
        return;
      }

      const answers: AssessmentAnswer[] = this.questions.map(q => ({
        id: q.id,
        answer: q.selectedAnswer ?? ''
      }));

      this.loader.show();

      this.assessmentService
        .saveAssessmentAnswers(this.applicationRefNo, answers)
        .subscribe({
          next: () => {
            this.loader.hide();
            this.toast.showSuccess('Assessment saved successfully!');
            this.router.navigate(['apply/programs'], {
              state: {
                applicationRefNo: this.applicationRefNo
              }
            });
            localStorage.setItem('applicationRefNo', this.applicationRefNo);
          },
          error: () => {
            this.loader.hide();
            this.toast.showError('Failed to save assessment.');
          }
        });
    });
  }

  onAnswerChange(questionId: string, answer: string) {
    const question = this.questions.find(q => q.id === questionId);
    if (question) {
      // Trim input to avoid empty spaces being counted as answered
      question.selectedAnswer = (answer ?? '').trim();
    }
  }

  onShortAnswerChange(questionId: string, event: Event): void {
    const input = event.target as HTMLInputElement | null;
    if (!input) return;

    const question = this.questions.find(q => q.id === questionId);
    if (question) {
      question.selectedAnswer = input.value.trim();
    }
  }

  getAnsweredCount(): number {
    return this.questions.filter(q =>
      typeof q.selectedAnswer === 'string' &&
      q.selectedAnswer.trim().length > 0
    ).length;
  }

  get progressPercent(): number {
    if (!this.questions.length) return 0;
    return (this.getAnsweredCount() / this.questions.length) * 100;
  }

  get totalPages(): number {
    return Math.ceil(this.questions.length / this.itemsPerPage);
  }

  get paginatedQuestions(): Question[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    // No need to clone; questions array itself stores answers
    return this.questions.slice(start, end);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  trackById(index: number, question: Question) {
    return question.id;
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