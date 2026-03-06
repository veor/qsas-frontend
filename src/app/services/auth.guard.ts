import { Injectable, inject } from '@angular/core';
import { CanMatch, Route, Router, UrlSegment } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanMatch {
  private authService = inject(AuthService);
  private router = inject(Router);

  canMatch(route: Route, segments: UrlSegment[]): Observable<boolean> | boolean {
    if (this.authService.isLoggedIn()) {
      return true;
    } else {
      this.router.navigate(['/admin/login']);
      return false;
    }
  }
}
