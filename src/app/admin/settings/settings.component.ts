import { CommonModule } from '@angular/common';
import { Component, inject, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AdminService } from '../../services/admin.service';
import { ToastService } from '../../services/toast.service';
import { AuthService } from '../../services/auth.service';
import { LoaderService } from '../../services/loader.service';
import { EditUserDialogComponent } from './edit-user-dialog/edit-user-dialog.component';
import { environment } from '../../../environments/environment.development';
import { AssessmentBuilderComponent } from "./assessment-builder/assessment-builder.component";
import { ApplicantService } from '../../services/applicant.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTabsModule,
    MatTableModule,
    MatPaginatorModule,
    MatChipsModule,
    MatDividerModule,
    MatTooltipModule,
    AssessmentBuilderComponent
],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  API_URL = environment.apiUrl; 
  private authService = inject(AuthService);
  private applicantService = inject (ApplicantService);

  userForm: FormGroup;
  passwordForm: FormGroup;
  
  availablePermissions = [
    { value: 'user.create', label: 'Create Users', icon: 'person_add' },
    { value: 'user.change_self_password', label: 'Change Own Password', icon: 'lock' },
    { value: 'user.change_user_password', label: 'Change User Passwords', icon: 'admin_panel_settings' },
    { value: 'user.edit_self_permissions', label: 'Edit Own Permissions', icon: 'security' },
    { value: 'user.edit_user_permissions', label: 'Edit User Permissions', icon: 'manage_accounts' },
    { value: 'user.can_access_users', label: 'Manage Users', icon: 'person' },
    { value: 'user.can_view_assessment', label: 'View Assessment', icon: 'person' },

    { value: 'dashboard.access', label: 'Dashboard Access', icon: 'dashboard' },
    { value: 'applicantList.access', label: 'Applicant List Access', icon: 'list' },
    { value: 'assessment.manage', label: 'Manage Assessment', icon: 'quiz' }

  ];

  // Permissions for Add User form
  newUserPermissions: string[] = [];
  
  // Permissions for current user (My Permissions)
  selectedPermissions: string[] = [];
  
  hideOld1 = true;
  hideOld2 = true;
  hideNew = true;
  hideConfirm = true;
  hideUserPassword = true;
  
  users: any[] = [];
  dataSource = new MatTableDataSource(this.users);
  displayedColumns: string[] = ['idNumber', 'name', 'designation', 'phone', 'permissions', 'actions'];
  selectedAvatar: File | null = null;
  selectedAvatarPreview: string | ArrayBuffer | null = null;
  districts: { id: number, name: string }[] = [];
  allMunicipalities: { id: number, district_id: number, name: string, points: number }[] = [];
  filteredMunicipalitiesForUser: { id: number, district_id: number, name: string, points: number }[] = []; 
  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private toast: ToastService,
    private loaderService: LoaderService,
    private dialog: MatDialog
  ) {
    this.userForm = this.fb.group({
      idNo: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      first_name: ['', [Validators.required, Validators.minLength(2)]],
      middle_name: [''],
      last_name: ['', [Validators.required, Validators.minLength(2)]],
      designation: [''],
      phone: ['', [Validators.pattern(/^\+?[\d\s-()]+$/)]],
      password: ['', [Validators.required, this.passwordValidator]],
      district: [null],     
      municipality: [null],
    });

    this.passwordForm = this.fb.group({
      oldPassword1: ['', Validators.required],
      oldPassword2: ['', Validators.required],
      newPassword: ['', [Validators.required, this.passwordValidator]],
      confirmPassword: ['', [Validators.required, this.passwordValidator]],
    });
  }

  get canCreateUser(): boolean {
    return this.authService.hasPermission('user.create');
  }

  get canChangePassword(): boolean {
    return this.authService.hasPermission('user.change_self_password');
  }

  get canChangePermissions(): boolean {
    return this.authService.hasPermission('user.edit_self_permissions');
  }

  get canAccessUsers(): boolean {
    return this.authService.hasPermission('user.can_access_users');
  }

  get canAccessQuestionsManagement(): boolean {
    return this.authService.hasPermission('assessment.manage');
  }

  // ngOnInit() {
  //   this.loadUsers();
  //   this.loadCurrentUserPermissions();
  // }
  ngOnInit() {
    this.loadUsers();
    this.loadCurrentUserPermissions();

    // Load districts and municipalities
    this.applicantService.getDistrictsAndMunicipalities().subscribe({
      next: (res) => {
        this.districts = res.districts;
        this.allMunicipalities = res.municipalities;
      },
      error: () => this.toast.showError('Failed to load districts/municipalities')
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    // Set page size to 5
    this.paginator.pageSize = 5;
  }

  loadCurrentUserPermissions() {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.loaderService.show();
      this.adminService.getMyPermissions(currentUser.idNo).subscribe({
        next: (res) => {
          if (res.status === 'success') {
            this.selectedPermissions = res.permissions || [];
          }
          this.loaderService.hide();
        },
        error: () => {
          this.toast.showError('Failed to load permissions');
          this.loaderService.hide();
        }
      });
    }
  }

  // Toggle for Add User
  toggleNewUserPermission(event: MatCheckboxChange, permission: string) {
    if (event.checked) {
      if (!this.newUserPermissions.includes(permission)) {
        this.newUserPermissions.push(permission);
      }
    } else {
      this.newUserPermissions = this.newUserPermissions.filter(p => p !== permission);
    }
  }

  // Toggle for My Permissions
  toggleMyPermission(event: MatCheckboxChange, permission: string) {
    if (event.checked) {
      if (!this.selectedPermissions.includes(permission)) {
        this.selectedPermissions.push(permission);
      }
    } else {
      this.selectedPermissions = this.selectedPermissions.filter(p => p !== permission);
    }
  }

  passwordValidator = (control: any) => {
    const value = control.value || '';
    if (!value) return null;
    
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{12,}$/;
    if (!regex.test(value)) {
      return { invalidPassword: true };
    }
    return null;
  };

  getPasswordErrorMessage(controlName: string): string {
    const control = this.userForm.get(controlName) || this.passwordForm.get(controlName);
    if (control?.hasError('required')) {
      return 'Password is required';
    }
    if (control?.hasError('invalidPassword')) {
      return 'Password must be at least 12 characters with uppercase, lowercase, number, and special character';
    }
    return '';
  }

  // --- Create User ---
  // onSubmit() {
  //   if (this.userForm.valid) {
  //     const formData = new FormData();

  //     Object.keys(this.userForm.value).forEach(key => {
  //       formData.append(key, this.userForm.value[key]);
  //     });

  //     formData.append('permissions', JSON.stringify(this.newUserPermissions));

  //     if (this.selectedAvatar) {
  //       formData.append('avatar', this.selectedAvatar);
  //     }

  //     this.loaderService.show();
  //     this.adminService.addUser(formData).subscribe({
  //       next: (res) => {
  //         this.toast.showSuccess(res.message || 'User created successfully');
  //         this.userForm.reset();
  //         this.newUserPermissions = [];
  //         this.selectedAvatar = null;
  //         this.selectedAvatarPreview = null;
  //         this.loadUsers();
  //         this.loaderService.hide();
  //       },
  //       error: (err) => {
  //         this.toast.showError(err.error?.message || 'Failed to create user');
  //         this.loaderService.hide();
  //       }
  //     });
  //   }
  // }
onSubmit() {
  if (this.userForm.valid) {
    const formData = new FormData();

    Object.keys(this.userForm.value).forEach(key => {
      const value = this.userForm.value[key];
      if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });

    // Explicitly append district and municipality even if 0
    const district = this.userForm.get('district')?.value;
    const municipality = this.userForm.get('municipality')?.value;
    if (district) formData.append('district', district);
    if (municipality) formData.append('municipality', municipality);

    // permissions
    formData.append('permissions', JSON.stringify(this.newUserPermissions));

    // avatar if selected
    if (this.selectedAvatar) {
      formData.append('avatar', this.selectedAvatar);
    }

    this.loaderService.show();
    this.adminService.addUser(formData).subscribe({
      next: (res) => {
        this.toast.showSuccess(res.message || 'User created successfully');
        this.userForm.reset();
        this.newUserPermissions = [];
        this.selectedAvatar = null;
        this.selectedAvatarPreview = null;
        this.filteredMunicipalitiesForUser = [];
        this.loadUsers();
        this.loaderService.hide();
      },
      error: (err) => {
        this.toast.showError(err.error?.message || 'Failed to create user');
        this.loaderService.hide();
      }
    });
  }
}

  // --- Change Password ---
  onChangePassword() {
    if (this.passwordForm.valid) {
      const { oldPassword1, oldPassword2, newPassword, confirmPassword } = this.passwordForm.value;

      if (oldPassword1 !== oldPassword2) {
        this.toast.showError('Old passwords do not match');
        return;
      }

      if (newPassword !== confirmPassword) {
        this.toast.showError('New password and confirmation do not match');
        return;
      }

      this.loaderService.show();
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser) {
        this.toast.showError('No user logged in');
        this.loaderService.hide();
        return;
      }

      this.adminService.changePassword({
        idNo: currentUser.idNo,
        oldPassword: oldPassword1,
        newPassword
      }).subscribe({
        next: (res) => {
          if (res.status === 'success') {
            this.toast.showSuccess(res.message);
            this.passwordForm.reset();
          } else {
            this.toast.showError(res.message);
          }
          this.loaderService.hide();
        },
        error: (err) => {
          this.toast.showError(err.error?.message || 'Failed to change password');
          this.loaderService.hide();
        }
      });
    }
  }

  // --- Save updated permissions ---
  updatePermissions() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    this.loaderService.show();
    this.adminService.updateMyPermissions(currentUser.idNo, this.selectedPermissions).subscribe({
      next: (res) => {
        if (res.status === 'success') {
          this.toast.showSuccess(res.message);
        } else {
          this.toast.showError(res.message);
        }
        this.loaderService.hide();
      },
      error: () => {
        this.toast.showError('Failed to update permissions');
        this.loaderService.hide();
      }
    });
  }

  loadUsers() {
    this.loaderService.show();
    this.adminService.getAllUsers().subscribe({
      next: (res) => {
        if (res.status === 'success') {
          this.users = res.data || [];
          this.dataSource.data = this.users;
        } else {
          this.toast.showError(res.message || 'Failed to fetch users');
        }
        this.loaderService.hide();
      },
      error: () => {
        this.toast.showError('Failed to fetch users');
        this.loaderService.hide();
      }
    });
  }

  onEditUser(user: any) {
    const dialogRef = this.dialog.open(EditUserDialogComponent, {
      width: '90vw',
      maxWidth: '900px',
      maxHeight: '90vh',
      data: { ...user },
      disableClose: false,
      panelClass: 'custom-dialog-container'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loaderService.show();
        this.adminService.updateUser(user.id_number, result).subscribe({
          next: (res) => {
            this.toast.showSuccess(res.message || 'User updated successfully');
            this.loadUsers();
            this.loaderService.hide();
          },
          error: (err) => {
            this.toast.showError(err.error?.message || 'Failed to update user');
            this.loaderService.hide();
          }
        });
      }
    });
  }

  getPermissionLabel(permission: string): string {
    const perm = this.availablePermissions.find(p => p.value === permission);
    return perm ? perm.label : permission;
  }

  getUserPermissions(user: any): string[] {
    return user.permissions || [];
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedAvatar = input.files[0];

      // Preview
      const reader = new FileReader();
      reader.onload = e => this.selectedAvatarPreview = reader.result;
      reader.readAsDataURL(this.selectedAvatar);
    }
  }

  onUserDistrictChange(districtId: number) {
    this.filteredMunicipalitiesForUser = this.allMunicipalities.filter(
      m => m.district_id === +districtId
    );
    this.userForm.patchValue({ municipality: null });
  }

}