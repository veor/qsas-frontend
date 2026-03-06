import { Component } from '@angular/core';
import { ApplicantHeaderComponent } from '../../shared/applicant-header/applicant-header.component';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-apply-introduction',
  standalone: true,
  imports: [
    ApplicantHeaderComponent,
    FormsModule,
    CommonModule
  ],
  templateUrl: './apply-introduction.component.html',
  styleUrl: './apply-introduction.component.css'
})
export class ApplyIntroductionComponent {

  accepted = false;
  showError = false;

  constructor(private router: Router) {}

  proceed() {
    if (!this.accepted) {
      this.showError = true;
      return;
    }

    this.showError = false;
    this.router.navigate(['/apply/application-form']);
  }
}
