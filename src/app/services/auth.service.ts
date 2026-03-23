import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment.development';

// --- PRODUCTION ---
// const API_URL = environment.apiUrl+'/qsas-backend/';

// --- DEVELOPMENT SSL ---
const API_URL = environment.apiUrl;

export interface LoginResponse {
  success: boolean;
  token: string;
  user: {
    id: number;
    idNo: string;
    name: string;
    permissions: string[];
  };
  message: string;
}

export interface User {
  id: number;
  idNo: string;
  name: string;
    permissions: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'current_user';

  constructor() {
    // Check if user is already logged in
    this.loadStoredAuth();
  }

  login(idNo: string, password: string): Observable<LoginResponse> {
    const loginData = { idNo, password };
    // DEVELOPMENT SSL
    return this.http.post<LoginResponse>(API_URL + `/auth/login`, loginData)
    // PRODUCTION
    // return this.http.post<LoginResponse>(API_URL + `auth/login`, loginData)
      .pipe(
        tap(response => {
          if (response.success && response.token) {
            this.storeAuthData(response.token, response.user);
            this.currentUserSubject.next(response.user);
          }
        })
      );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    // Check if token is expired
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp > currentTime;
    } catch {
      return false;
    }
  }

  hasPermission(permission: string): boolean {
    const user = this.getCurrentUser();
    if (!user || !user.permissions) return false;

    return user.permissions.includes(permission);
  }

  private storeAuthData(token: string, user: User): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  private loadStoredAuth(): void {
    const token = this.getToken();
    const userStr = localStorage.getItem(this.USER_KEY);
    
    if (token && userStr && this.isLoggedIn()) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
      } catch {
        this.logout();
      }
    } else {
      this.logout();
    }
  }

  // get authorization headers for API requests
  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }
  
}
