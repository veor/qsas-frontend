import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { Question } from '../admin/settings/assessment-builder/assessment-builder.component';

// --- PRODUCTION ---
// const API_URL = environment.apiUrl+'/qsas-backend/';

// --- DEVELOPMENT SSL ---
const API_URL = environment.apiUrl;

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
  current_academic_status: number | string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private http = inject(HttpClient);

// --- Applicants ---
  getApplicants(): Observable<Applicant[]> {
    // DEVELOPMENT SSL
    return this.http.get<Applicant[]>(API_URL + '/admin/applicants'); 
    // PRODUCTION
    // return this.http.get<Applicant[]>(API_URL + 'admin/getApplicants'); 

  }
  updateLocation(application_ref_no: string, location: {
    hometown_location: string;
    barangay_accessibility: string;
    hard_to_reach_barangays: string;
  }): Observable<any> {
    // DEVELOPMENT SSL
    return this.http.post<any>(API_URL + '/admin/update-location', { application_ref_no, ...location }); 
    // PRODUCTION
    // return this.http.post<any>(API_URL + 'admin/updateLocation', { application_ref_no, ...location }); 
  }
  updateGrades(application_ref_no: string, grades: { numeric_grade: number; grade_label: string }[]): Observable<any> {
    // DEVELOPMENT SSL
    return this.http.post<any>(API_URL + '/admin/update-grades', { application_ref_no, grades }); 
    // PRODUCTION
    // return this.http.post<any>(API_URL + 'admin/updateGrades', { application_ref_no, grades }); 
  }
// --- Dashboard ---
  getScholarshipCounts(): Observable<{ [key: string]: number }> {
     // DEVELOPMENT SSL
    return this.http.get<{ [key: string]: number }>(API_URL + '/admin/scholarship-counts');
    // PRODUCTION
    // return this.http.get<{ [key: string]: number }>(API_URL + 'admin/getScholarshipCounts'); 
  }
// --- Settings ---
  addUser(newUser: FormData): Observable<any> {
    // DEVELOPMENT SSL
    return this.http.post<any>(API_URL + '/admin/create-user', newUser);
    // PRODUCTION 
    // return this.http.post<any>(API_URL + 'admin/createUser', newUser); 
  }
  changePassword(data: { idNo: string, oldPassword: string, newPassword: string }): Observable<any> {
    // DEVELOPMENT SSL
    return this.http.post<any>(API_URL + '/admin/change-password', data); 
    // PRODUCTION
    // return this.http.post<any>(API_URL + 'admin/changePassword', data); 
  }
  getMyPermissions(idNo: string) {
    // DEVELOPMENT SSL
    return this.http.post<any>(API_URL + '/admin/get-my-permissions', { idNo }); 
    // PRODUCTION
    // return this.http.post<any>(API_URL + 'admin/getMyPermissions', { idNo }); 
  }
  updateMyPermissions(idNo: string, permissions: string[]) {
    // DEVELOPMENT SSL
    return this.http.post<any>(API_URL + '/admin/update-my-permissions', { idNo, permissions }); 
    // PRODUCTION
    // return this.http.post<any>(API_URL + 'admin/updateMyPermissions', { idNo, permissions }); 
  }
  getAllUsers() {
    // DEVELOPMENT SSL
    return this.http.get<any>(API_URL + '/admin/users'); 
    // PRODUCTION
    // return this.http.get<any>(API_URL + 'admin/getAllUsers'); 
  }
  updateUser(idNo: string, userData: FormData) {
    // DEVELOPMENT SSL
    return this.http.post<any>(API_URL + `/admin/users/${idNo}`, userData); 
    // PRODUCTION
    // return this.http.post<any>(API_URL + `admin/updateUser/${idNo}`, userData); 
  }
  getQuestions() {
    return this.http.get<{ success: boolean; data: any[]; message?: string }>( 
    // DEVELOPMENT SSL
    `${API_URL}/admin/getQuestions` 
    // PRODUCTION
    // `${API_URL}admin/getQuestions` 
    );
  }
  updateQuestion(question: Question): Observable<any> {
    // DEVELOPMENT SSL
    return this.http.post<any>(API_URL + '/admin/updateQuestion', question); 
    // PRODUCTION
    // return this.http.post<any>(API_URL + 'admin/updateQuestion', question); 
  }
  setQuestionStatus(data: { id: string; is_active: number }) {
    return this.http.post<any>( 
      // DEVELOPMENT SSL
    API_URL + '/admin/setQuestionStatus', 
    // PRODUCTION
      // API_URL + 'admin/setQuestionStatus', 
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
      // DEVELOPMENT SSL
    API_URL + '/admin/createQuestion', 
    // PRODUCTION
      // API_URL + 'admin/createQuestion', 
      data
    );
  }

// --- Save assessor's assessment answers
  saveAssessorEvaluation(data: { 
    application_ref_no: string, 
    assessor_id_no: string, 
    answers: any[] 
  }): Observable<any> {
    // DEVELOPMENT SSL
    return this.http.post<any>(API_URL + '/admin/assessment/save', data); 
    // PRODUCTION
    // return this.http.post<any>(API_URL + 'admin/saveAssessorEvaluation', data); 
  }

  getAssessmentAnswers(application_ref_no: string) {
    // DEVELOPMENT SSL
    return this.http.get(`${API_URL}/admin/assessment/get/${application_ref_no}`); 
    // PRODUCTION
    // return this.http.get(`${API_URL}admin/getAssessorEvaluation/${application_ref_no}`); 
  }

// -- Top 35 Priority Courses
  getTopByCourse(): Observable<{ application_ref_no: string; current_course: string; priority_weight: number | null; name: string; civil_status: string; current_academic_status: string; municipality: string; }[]> {
    // return this.http.get<any[]>(API_URL + 'admin/getTopByCourseForPriorityCourses');
    return this.http.get<any[]>(API_URL + '/admin/top-by-course');
  }
  rejectPriorityApplicants(refNos: string[]): Observable<{
    success: boolean;
    message: string;
    failed: string[];
    failed_count: number;
  }> {
    return this.http.post<any>(
      // API_URL + 'admin/rejectPriorityApplicants',
      API_URL + '/admin/reject-priority-applicants',
      { application_ref_nos: refNos }
    );
  }
// -- Top 35 1Poor and Stan C
  getTopByMunicipality(params: { page?: number; scholarship_type?: string; municipality?: string; }): Observable<{
    data: { application_ref_no: string; municipality: string; scholarship_type: string; assessment_weight: number | null }[];
    total: number;
    page: number;
    total_pages: number;
    available_municipalities: string[];
    available_scholarships: string[];
  }> {
    const query = new URLSearchParams();
    if (params.page)              query.set('page', String(params.page));
    if (params.scholarship_type)  query.set('scholarship_type', params.scholarship_type);
    if (params.municipality)      query.set('municipality', params.municipality);

    // DEVELOPMENT SSL
    return this.http.get<any>(`${API_URL}/admin/top-by-municipality?${query.toString()}`);
    // PRODUCTION
    // return this.http.get<any>(`${API_URL}admin/getTopByMunicipality?${query.toString()}`);
  }

  getTopByOnePoorFam(): Observable<{
    application_ref_no: string;
    assessment_weight: number | null;
    name: string;
    civil_status: string;
    current_academic_status: string;
    age: number | null;
    municipality: string;
    fathers_profession: string | null;
    mothers_profession: string | null;
  }[]> {
    // return this.http.get<any[]>(API_URL + 'admin/getTopByOnePoorFam');
    return this.http.get<any[]>(API_URL + '/admin/top-by-one-poor-fam');
  }

  rejectOnePoorFamApplicants(refNos: string[]): Observable<{
    success: boolean;
    message: string;
    failed: string[];
    failed_count: number;
  }> {
    return this.http.post<any>(
      // API_URL + 'admin/rejectOnePoorFamApplicants',
      API_URL + '/admin/reject-one-poor-fam-applicants',
      { application_ref_nos: refNos }
    );
  }

  getTopByStanC(): Observable<{
    application_ref_no: string;
    assessment_weight: number | null;
    name: string;
    civil_status: string;
    current_academic_status: string;
    age: number | null;
    municipality: string;
    fathers_profession: string | null;
    mothers_profession: string | null;
  }[]> {
    // return this.http.get<any[]>(API_URL + 'admin/getTopByStanC');
    return this.http.get<any[]>(API_URL + '/admin/top-by-stan-c');
  }


  rejectStanCApplicants(refNos: string[]): Observable<{
    success: boolean;
    message: string;
    failed: string[];
    failed_count: number;
  }> {
    return this.http.post<any>(
      // API_URL + 'admin/rejectOnePoorFamApplicants',
      API_URL + '/admin/reject-stan-c-applicants',
      { application_ref_nos: refNos }
    );
  }

  exportSHSTopByCourse(): Observable<{
    application_ref_no: string;
    name: string;
    course_applied: string;
    age: number | null;
    civil_status: string;
    contact: string;
    email: string;
    current_academic_status: string;
    municipality: string;
    priority_weight: number | null;
  }[]> {
    // return this.http.get<any[]>(API_URL + 'admin/exportSHSTopByCourse');
    return this.http.get<any[]>(API_URL + '/admin/export-shs-top-by-course');
  }

  exportOnePoorFamAll(): Observable<any[]> {
    // return this.http.get<any[]>(API_URL + '/admin/exportOnePoorFamAll');
    return this.http.get<any[]>(API_URL + '/admin/export-one-poor-fam-all');
  }
  exportSTANCAll(): Observable<any[]> {
    // return this.http.get<any[]>(API_URL + '/admin/exportSTANCAll');
    return this.http.get<any[]>(API_URL + '/admin/export-stan-c-all');
  }

}