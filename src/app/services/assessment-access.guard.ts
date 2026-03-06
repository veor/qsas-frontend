import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AssessmentAccessGuard implements CanActivate {
  private accessGranted = false;

  constructor(private router: Router) {}

  allowAccessOnce(): void {
    this.accessGranted = true;
  }

  canActivate(): boolean {
    if (this.accessGranted) {
      this.accessGranted = false; 
      return true;
    }

    this.router.navigate(['/access-denied']);
    return false;
  }
}
