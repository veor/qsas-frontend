import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-applicant-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './applicant-header.component.html',
  styleUrl: './applicant-header.component.css'
})
export class ApplicantHeaderComponent {
  constructor(private router: Router) {}

  goToApply() {
    this.router.navigate(['/apply']);
  }
}