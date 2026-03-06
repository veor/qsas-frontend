import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { Question } from '../admin/settings/assessment-builder/assessment-builder.component';

export interface Applicant {
  application_ref_no: string;
  name: string;
  picture: string | null;
  grade_pdf?: string | null;
  grades: { numeric_grade: number; grade_label: string }[];
  created_at: string;
  scholarship_type: string | null;
  personal_assessment: string | null;
  recommending_assessment: string | null;
  father_name: string;
  mother_name: string;
  birthdate: string;
  gender: string;
  civil_status: string;
  no_of_children: number;
  mobile_number: string;
  address: string;
  email_address: string;
  priority_weight?: number | null;
  assessment_weight?: number | null;
  hometown_location: string;
  hard_to_reach_barangays: string;
  barangay_accessibility: string;

}

const API_URL = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private http = inject(HttpClient);
// --- Applicants ---
  getApplicants(): Observable<Applicant[]> {
    return this.http.get<Applicant[]>(API_URL + '/admin/applicants');    
  }
  updateLocation(application_ref_no: string, location: {
    hometown_location: string;
    barangay_accessibility: string;
    hard_to_reach_barangays: string;
  }): Observable<any> {
    return this.http.post<any>(API_URL + '/admin/update-location', { application_ref_no, ...location });
  }
  updateGrades(application_ref_no: string, grades: { numeric_grade: number; grade_label: string }[]): Observable<any> {
    return this.http.post<any>(API_URL + '/admin/update-grades', { application_ref_no, grades });
  }
// --- Dashboard ---
  getScholarshipCounts(): Observable<{ [key: string]: number }> {
    return this.http.get<{ [key: string]: number }>(API_URL + '/admin/scholarship-counts');
  }
// --- Settings ---
  addUser(newUser: FormData): Observable<any> {
    return this.http.post<any>(API_URL + '/admin/create-user', newUser);
  }
  changePassword(data: { idNo: string, oldPassword: string, newPassword: string }): Observable<any> {
    return this.http.post<any>(API_URL + '/admin/change-password', data);
  }
  getMyPermissions(idNo: string) {
    return this.http.post<any>(API_URL + '/admin/get-my-permissions', { idNo });
  }
  updateMyPermissions(idNo: string, permissions: string[]) {
    return this.http.post<any>(API_URL + '/admin/update-my-permissions', { idNo, permissions });
  }
  getAllUsers() {
    return this.http.get<any>(API_URL + '/admin/users');
  }
  updateUser(idNo: string, userData: FormData) {
    return this.http.post<any>(API_URL + `/admin/users/${idNo}`, userData);
  }
  getQuestions() {
    return this.http.get<{ success: boolean; data: any[]; message?: string }>(
      `${API_URL}/admin/getQuestions`
    );
  }
  updateQuestion(question: Question): Observable<any> {
    return this.http.post<any>(API_URL + '/admin/updateQuestion', question);
  }
  setQuestionStatus(data: { id: string; is_active: number }) {
    return this.http.post<any>(
      API_URL + '/admin/setQuestionStatus',
      data
    );
  }
  createQuestion(data: {
    question_code: string;
    question: string;
    options: string[];
    points?: number;
  }) {
    return this.http.post<any>(
      API_URL + '/admin/createQuestion',
      data
    );
  }

// --- Save assessor's assessment answers
  saveAssessorEvaluation(data: { 
    application_ref_no: string, 
    assessor_id_no: string, 
    answers: any[] 
  }): Observable<any> {
    return this.http.post<any>(API_URL + '/admin/assessment/save', data);
  }

  getAssessmentAnswers(application_ref_no: string) {
    return this.http.get(`${API_URL}/admin/assessment/get/${application_ref_no}`);
  }

}