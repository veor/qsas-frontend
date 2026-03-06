import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { AdminService } from '../../../services/admin.service';
import { LoaderService } from '../../../services/loader.service';
import { ToastService } from '../../../services/toast.service';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSelectModule } from "@angular/material/select";
import { ConfirmSetStatusDialogComponent } from './confirm-set-status-dialog/confirm-set-status-dialog.component';
import { SelectQuestionTypeDialogComponent } from './select-question-type-dialog/select-question-type-dialog.component';
import { AddNewQuestionDialogComponent } from './add-new-question-dialog/add-new-question-dialog.component';
import { AddShortAnswerQuestionDialogComponent } from './add-short-answer-question-dialog/add-short-answer-question-dialog.component';
import { EditQuestionDialogComponent } from './edit-question-dialog/edit-question-dialog.component';
import { EditShortAnswerQuestionDialogComponent } from './edit-short-answer-question-dialog/edit-short-answer-question-dialog.component';

export interface Question {
  id: string;
  question: string;
  weight?: number;
  options?: { text: string; points: number }[];
  is_active?: number; 
  type?: 'mcq' | 'short'; // multiple choice question or short answer question
}

export interface QuestionOption {
  text: string;
  points: number;
}

@Component({
  selector: 'app-assessment-builder',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatTooltipModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule
],
  templateUrl: './assessment-builder.component.html',
  styleUrl: './assessment-builder.component.css',
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0', overflow: 'hidden' })),
      state('expanded', style({ height: '*', overflow: 'visible' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)'))
    ])
  ]
})
export class AssessmentBuilderComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;

  questions: Question[] = [];
  dataSource = new MatTableDataSource<Question>([]);
  expandedElement: Question | null = null;

  displayedColumns: string[] = ['expand', 'id', 'question', 'status', 'actions'];
  currentFilter: string = 'all';
  constructor(
    private adminService: AdminService,
    private loader: LoaderService,
    private toast: ToastService,
    private dialog: MatDialog
  ) {
    this.dataSource = new MatTableDataSource<Question>();
  }

  ngOnInit(): void {
    this.dataSource.filterPredicate = (data: Question, filter: string) => {
      switch (filter) {
        case 'active':
          return data.is_active === 1;

        case 'inactive':
          return data.is_active === 0;

        default:
          return true; 
      }
    };

    this.getQuestions();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.paginator) {
        this.dataSource.paginator = this.paginator;
        
        this.paginator.page.subscribe(() => {
          this.expandedElement = null;
        });
      }
    });
  }

  getQuestions(): void {
    this.loader.show();
    this.adminService.getQuestions().subscribe({
      next: (res) => {
        if (res.success) {
          this.questions = res.data || [];
          this.dataSource.data = this.questions;
          
          setTimeout(() => {
            if (this.paginator) {
              this.dataSource.paginator = this.paginator;
            }
          });
        } else {
          this.toast.showError(res.message || 'Failed to fetch questions');
        }
        this.loader.hide();
      },
      error: (err) => {
        console.error('Error fetching questions:', err);
        this.toast.showError('Failed to fetch questions');
        this.loader.hide();
      }
    });
  }

  toggleRow(element: Question): void {
    this.expandedElement = this.expandedElement === element ? null : element;
  }

  // editQuestion(question: Question, event: Event): void {
  //   event.stopPropagation();
    
  //   const dialogRef = this.dialog.open(EditQuestionDialogComponent, {
  //     width: '600px',
  //     maxWidth: '90vw',
  //     data: { ...question }
  //   });

  //   dialogRef.afterClosed().subscribe(result => {
  //     if (result) {
  //       this.updateQuestion(result);
  //     }
  //   });
  // }
  editQuestion(question: Question, event: Event): void {
    event.stopPropagation();
  console.log('Question type:', question.type);
    let dialogRef;

    if (question.type === 'short') {

      dialogRef = this.dialog.open(EditShortAnswerQuestionDialogComponent, {
        width: '600px',
        data: { ...question }
      });

    } else {

      dialogRef = this.dialog.open(EditQuestionDialogComponent, {
        width: '600px',
        data: { ...question }
      });

    }

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.updateQuestion(result);
      }
    });
  }

  updateQuestion(updatedQuestion: Question): void {
    this.loader.show();
    this.adminService.updateQuestion(updatedQuestion).subscribe({
      next: (res) => {
        if (res.success) {
          this.toast.showSuccess('Question updated successfully');
          this.getQuestions(); // Refresh the list
        } else {
          this.toast.showError(res.message || 'Failed to update question');
        }
        this.loader.hide();
      },
      error: (err) => {
        console.error('Error updating question:', err);
        this.toast.showError('Failed to update question');
        this.loader.hide();
      }
    });
  }

  confirmStatusChange(question: Question, status: number, event: Event): void {
    event.stopPropagation();

    const isDeactivating = status === 0;

    const dialogRef = this.dialog.open(ConfirmSetStatusDialogComponent, {
      width: '400px',
      data: {
        title: isDeactivating ? 'Deactivate Question' : 'Activate Question',
        message: isDeactivating
          ? 'Are you sure you want to deactivate this question? It will no longer be available.'
          : 'Are you sure you want to activate this question?',
        confirmText: isDeactivating ? 'Deactivate' : 'Activate',
        confirmColor: isDeactivating ? 'warn' : 'accent'
      }
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.setStatus(question, status);
      }
    });
  }

  setStatus(question: Question, status: number): void {
    this.loader.show();

    this.adminService.setQuestionStatus({
      id: question.id,
      is_active: status
    }).subscribe({
      next: (res) => {
        if (res.success) {
          this.toast.showSuccess(res.message);
          this.getQuestions();
        } else {
          this.toast.showError(res.message || 'Failed to update status');
        }
        this.loader.hide();
      },
      error: () => {
        this.toast.showError('Failed to update status');
        this.loader.hide();
      }
    });
  }

  applyFilter(filterValue: string): void {
    this.currentFilter = filterValue;
    this.dataSource.filter = filterValue;

    if (this.paginator) {
      this.paginator.firstPage();
    }

    this.expandedElement = null;
  }

  addQuestion(): void {

    const typeDialog = this.dialog.open(SelectQuestionTypeDialogComponent, {
      width: '350px'
    });

    typeDialog.afterClosed().subscribe(type => {

      if (!type) return;

      if (type === 'mcq') {

        const mcqDialog = this.dialog.open(AddNewQuestionDialogComponent, {
          width: '600px'
        });

        mcqDialog.afterClosed().subscribe(result => {
          if (!result) return;

          result.type = 'mcq'; // 🔥 mark type
          this.createQuestion(result);
        });

      }

      if (type === 'short') {

        const shortDialog = this.dialog.open(AddShortAnswerQuestionDialogComponent, {
          width: '600px'
        });

        shortDialog.afterClosed().subscribe(result => {
          if (!result) return;
          this.createQuestion(result);
        });

      }

    });

  }

  createQuestion(payload: any) {
    this.loader.show();

    this.adminService.createQuestion(payload).subscribe({
      next: res => {
        if (res.success) {
          this.toast.showSuccess(res.message);
          this.getQuestions();
        } else {
          this.toast.showError(res.message);
        }
        this.loader.hide();
      },
      error: () => {
        this.toast.showError('Failed to create question');
        this.loader.hide();
      }
    });
  }
}