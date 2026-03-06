import { Routes } from '@angular/router';
import { AdminComponent } from './admin/admin.component';
import { DashboardComponent } from './admin/dashboard/dashboard.component';
import { AuthGuard } from './services/auth.guard';
import { LoginGuard } from './services/login.guard';
import { SettingsComponent } from './admin/settings/settings.component';
import { ApplicantListComponent } from './admin/applicant-list/applicant-list.component';
import { ScholarshipSelectionComponent } from './applicants/scholarship-selection/scholarship-selection.component';
import { ApplicationFormComponent } from './applicants/application-form/application-form.component';
import { PermissionGuard } from './services/permission.guard';
import { AssessmentFormComponent } from './applicants/assessment-form/assessment-form.component';
import { ApplicantGuard } from './services/applicant.guard';
import { AccessDeniedComponent } from './shared/access-denied/access-denied.component';
import { AssessmentAccessGuard } from './services/assessment-access.guard';
import { AdminAssessmentFormComponent } from './admin/admin-assessment-form/admin-assessment-form.component';
import { ApplyIntroductionComponent } from './applicants/apply-introduction/apply-introduction.component';

export const routes: Routes = [
  // Default route - redirects to dashboard if logged in, otherwise to login
  { path: '', redirectTo: '/apply', pathMatch: 'full' },


 // Public applicant routes
  { 
    path: 'apply', 
    component: ApplyIntroductionComponent,
    canMatch: [ApplicantGuard]
  },
  { 
    path: 'apply/programs', 
    component: ScholarshipSelectionComponent,
    canMatch: [ApplicantGuard]
  },
  {
    path: 'apply/application-form', 
    component: ApplicationFormComponent,
    canMatch: [ApplicantGuard]
  },
  // {
  //   path: 'apply/:id', 
  //   component: ApplicationFormComponent,
  //   canMatch: [ApplicantGuard]
  // },
  {
    path: 'assessment-form', 
    component: AssessmentFormComponent,
    canActivate: [AssessmentAccessGuard]
  },

  // Login route for admin/authorized personnels
  { path: 'admin/login', component: AdminComponent, canMatch: [LoginGuard] },


  // Protected dashboard route
  {
    path: 'admin/dashboard',
    canMatch: [AuthGuard, PermissionGuard],
    data: { permission: 'dashboard.access'}, 
    component: DashboardComponent,
  },
  {
    path: 'admin/applicantList',
    canMatch: [AuthGuard, PermissionGuard],
    data: { permission: 'applicantList.access'}, 
    component: ApplicantListComponent,
  },
  {
    path: 'admin/assessment/:refNo',
    canMatch: [AuthGuard, PermissionGuard],
    data: { permission: 'applicantList.access'},
    component: AdminAssessmentFormComponent,
  },
  {
    path: 'admin/settings',
    canMatch: [AuthGuard],
    component: SettingsComponent,
  },
  {
    path: 'access-denied',
    component: AccessDeniedComponent
  },


  // Wildcard route - redirects any unknown path to login
  {
    path: '**',
    redirectTo: '/admin/login'
  }
];