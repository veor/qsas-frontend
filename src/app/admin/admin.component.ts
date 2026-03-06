import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoaderService } from '../services/loader.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule
  ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private loaderService = inject(LoaderService);
  
  loginData = {
    idNo: '',
    password: ''
  };
  
  isLoading = false;
  showPassword = false;
  errorMessage = '';


  onSubmit() {
    if (this.loginData.idNo && this.loginData.password) {
      this.errorMessage = '';
      this.loaderService.show(); 

      this.authService.login(this.loginData.idNo, this.loginData.password).subscribe({
        next: (response) => {
          this.loaderService.hide(); 
          console.log('Login successful:', response);
          this.router.navigate(['/admin/dashboard']);
        },
        error: (error) => {
          this.loaderService.hide(); 
          console.error('Login failed:', error);
          this.errorMessage = error.error?.message || 'Login failed. Please check your credentials.';
        }
      });
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  goToApply() {
    this.router.navigate(['/apply']);
  }
}
