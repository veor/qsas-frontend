import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor(private snackBar: MatSnackBar) {}

  showSuccess(message: string, duration: number = 3000) {
    this.snackBar.open(message, 'Close', {
      duration,
      panelClass: ['toast-success']
    });
  }

  showError(message: string, duration: number = 3000) {
    this.snackBar.open(message, 'Close', {
      duration,
      panelClass: ['toast-error']
    });
  }

  showInfo(message: string, duration: number = 3000) {
    this.snackBar.open(message, 'Close', {
      duration,
      panelClass: ['toast-info']
    });
  }
}