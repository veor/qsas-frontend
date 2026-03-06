import { CommonModule } from '@angular/common';
import { Component, inject, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule, MatCheckboxChange } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { AuthService } from '../../../services/auth.service';
import { environment } from '../../../../environments/environment.development';

@Component({
  selector: 'app-edit-user-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatChipsModule
  ],
  templateUrl: './edit-user-dialog.component.html',
  styleUrls: ['./edit-user-dialog.component.css']
})
export class EditUserDialogComponent {
  editForm: FormGroup;
  showPasswordFields = false;
  passwordStrength = 0;
  passwordStrengthText = '';
  passwordStrengthColor = '';
  hideNewPassword = true;
  hideConfirmPassword = true;
  availablePermissions = [
    { value: 'user.create', label: 'Create Users', icon: 'person_add', description: 'Allow user to create new accounts' },
    { value: 'user.change_self_password', label: 'Change Own Password', icon: 'lock', description: 'Allow user to change their own password' },
    { value: 'user.change_user_password', label: 'Change User Passwords', icon: 'admin_panel_settings', description: 'Allow user to change other users passwords' },
    { value: 'user.edit_self_permissions', label: 'Edit Own Permissions', icon: 'security', description: 'Allow user to modify their own permissions' },
    { value: 'user.edit_user_permissions', label: 'Edit User Permissions', icon: 'manage_accounts', description: 'Allow user to modify other users permissions' },
    { value: 'user.can_access_users', label: 'Manage Users', icon: 'person', description: 'Allow user to mange users'},
    { value: 'user.can_view_assessment', label: 'View Assessment', icon: 'person', description: 'Allow user to view the assessment'},
    { value: 'dashboard.access', label: 'Dashboard Access', icon: 'dashboard', description: 'Grant access to the main dashboard' },
    { value: 'applicantList.access', label: 'Applicant List Access', icon: 'list', description: 'Grant access to the applicant management system' },
    { value: 'assessment.manage', label: 'Manage Assessment', icon: 'quiz', description: 'Grant access to the assessment questions/options management' }

  ];


  selectedPermissions: string[] = [];
  avatarFile: File | null = null;
  avatarPreview: string | null = null;
  backendUrl = environment.apiUrl;

  private authService = inject(AuthService);

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EditUserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.editForm = this.fb.group({
      first_name: [data.first_name || '', [Validators.required, Validators.minLength(2)]],
      middle_name: [data.middle_name || ''],
      last_name: [data.last_name || '', [Validators.required, Validators.minLength(2)]],
      designation: [data.designation || ''],
      phone: [data.phone || '', [Validators.pattern(/^\+?[\d\s-()]+$/)]],
      newPassword: [''],
      confirmPassword: ['']
    });

    // Load the user's current permissions
    this.selectedPermissions = [...(data.permissions || [])];
  }

  get canChangeUserPermissions(): boolean {
    return this.authService.hasPermission('user.edit_user_permissions');
  }

  get canChangeUserPassword(): boolean {
    return this.authService.hasPermission('user.change_user_password');
  }

  onPasswordInput() {
    const pw = this.editForm.get('newPassword')?.value || '';
    this.passwordStrength = this.calculateStrength(pw);
    
    if (!pw) {
      this.passwordStrengthText = '';
      this.passwordStrengthColor = '';
    } else if (this.passwordStrength < 30) {
      this.passwordStrengthText = 'Very Weak';
      this.passwordStrengthColor = '#f44336';
    } else if (this.passwordStrength < 50) {
      this.passwordStrengthText = 'Weak';
      this.passwordStrengthColor = '#ff9800';
    } else if (this.passwordStrength < 75) {
      this.passwordStrengthText = 'Medium';
      this.passwordStrengthColor = '#ff9800';
    } else if (this.passwordStrength < 90) {
      this.passwordStrengthText = 'Strong';
      this.passwordStrengthColor = '#4caf50';
    } else {
      this.passwordStrengthText = 'Very Strong';
      this.passwordStrengthColor = '#4caf50';
    }
  }

  calculateStrength(pw: string): number {
    let strength = 0;
    
    // Length check
    if (pw.length >= 8) strength += 20;
    if (pw.length >= 12) strength += 15;
    if (pw.length >= 16) strength += 10;
    
    // Character variety checks
    if (/[A-Z]/.test(pw)) strength += 15;
    if (/[a-z]/.test(pw)) strength += 15;
    if (/\d/.test(pw)) strength += 15;
    if (/[\W_]/.test(pw)) strength += 15;
    
    // Bonus for multiple special characters or numbers
    if ((pw.match(/[\W_]/g) || []).length >= 2) strength += 5;
    if ((pw.match(/\d/g) || []).length >= 2) strength += 5;
    
    return Math.min(strength, 100);
  }

  isPasswordValid(): boolean {
    const { newPassword, confirmPassword } = this.editForm.value;
    
    // If no password is entered, it's valid (no change)
    if (!newPassword && !confirmPassword) return true;
    
    // If passwords don't match
    if (newPassword !== confirmPassword) return false;
    
    // Check password strength and requirements
    if (newPassword && this.passwordStrength < 50) return false;
    
    // Check password requirements
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{12,}$/;
    return regex.test(newPassword);
  }

  getPasswordErrorMessage(): string {
    const { newPassword, confirmPassword } = this.editForm.value;
    
    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      return 'Passwords do not match';
    }
    
    if (newPassword && this.passwordStrength < 50) {
      return 'Password is too weak';
    }
    
    if (newPassword && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{12,}$/.test(newPassword)) {
      return 'Password must be at least 12 characters with uppercase, lowercase, number, and special character';
    }
    
    return '';
  }

  togglePermission(event: MatCheckboxChange, permission: string) {
    if (event.checked) {
      if (!this.selectedPermissions.includes(permission)) {
        this.selectedPermissions.push(permission);
      }
    } else {
      this.selectedPermissions = this.selectedPermissions.filter(p => p !== permission);
    }
  }

  togglePasswordFields() {
    this.showPasswordFields = !this.showPasswordFields;
    if (!this.showPasswordFields) {
      // Clear password fields when hiding
      this.editForm.patchValue({
        newPassword: '',
        confirmPassword: ''
      });
      this.passwordStrength = 0;
      this.passwordStrengthText = '';
      this.passwordStrengthColor = '';
    }
  }

  getPermissionsByCategory() {
    const categories = {
      'User Management': this.availablePermissions.filter(p => p.value.startsWith('user.')),
      'System Access': this.availablePermissions.filter(p => !p.value.startsWith('user.'))
    };
    return categories;
  }

  getSelectedPermissionsCount(): number {
    return this.selectedPermissions.length;
  }

  getTotalPermissionsCount(): number {
    return this.availablePermissions.length;
  }

  onCancel() {
    this.dialogRef.close();
  }

  onAvatarSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.avatarFile = input.files[0];

      // Show preview
      const reader = new FileReader();
      reader.onload = () => (this.avatarPreview = reader.result as string);
      reader.readAsDataURL(this.avatarFile);
    }
  }

  onSave() {
    if (this.editForm.invalid || !this.isPasswordValid()) {
      Object.keys(this.editForm.controls).forEach(key => {
        this.editForm.get(key)?.markAsTouched();
      });
      return;
    }

    const formValue = this.editForm.value;

    // reate a real FormData object
    const formData = new FormData();

    formData.append('first_name', formValue.first_name);
    formData.append('middle_name', formValue.middle_name || '');
    formData.append('last_name', formValue.last_name);
    formData.append('designation', formValue.designation || '');
    formData.append('phone', formValue.phone || '');
    formData.append('permissions', JSON.stringify(this.selectedPermissions));

    if (formValue.newPassword?.trim()) {
      formData.append('password', formValue.newPassword);
    }

    if (this.avatarFile) {
      formData.append('avatar', this.avatarFile); // real file append
    }

    // Pass FormData to the service
    this.dialogRef.close(formData);
  }

  getFormFieldErrorMessage(fieldName: string): string {
    const field = this.editForm.get(fieldName);
    if (field?.hasError('required')) {
      return `${fieldName.replace('_', ' ')} is required`;
    }
    if (field?.hasError('minlength')) {
      return `${fieldName.replace('_', ' ')} must be at least 2 characters`;
    }
    if (field?.hasError('pattern')) {
      return `Please enter a valid ${fieldName.replace('_', ' ')}`;
    }
    return '';
  }
}