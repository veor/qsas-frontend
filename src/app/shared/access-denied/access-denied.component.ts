import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-access-denied',
  standalone: true,
  imports: [],
  templateUrl: './access-denied.component.html',
  styleUrl: './access-denied.component.css'
})
export class AccessDeniedComponent {
 constructor(private router: Router) {}

  goHome() {
    // redirect user appropriately
    if (localStorage.getItem('token')) {
      this.router.navigate(['/admin/dashboard']);
    } else {
      this.router.navigate(['/admin/login']);
    }
  }
}