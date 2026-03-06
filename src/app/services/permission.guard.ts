import { Injectable, inject } from "@angular/core";
import { CanMatch, Router, Route, UrlSegment } from "@angular/router";
import { AuthService } from "./auth.service";

@Injectable({
  providedIn: 'root'
})
export class PermissionGuard implements CanMatch {
  private authService = inject(AuthService);
  private router = inject(Router);

  canMatch(route: Route, segments: UrlSegment[]): boolean {
    const requiredPermission = route.data?.['permission'];
    if (!requiredPermission) return true; // no permission required

    if (this.authService.hasPermission(requiredPermission)) {
      return true;
    } else {
      this.router.navigate(['/access-denied']);
      return false;
    }
  }
}