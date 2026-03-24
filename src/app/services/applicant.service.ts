import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

// --- PRODUCTION ---
// const API_URL = environment.apiUrl+'qsas-backend/';

// --- DEVELOPMENT SSL ---
const API_URL = environment.apiUrl;


export interface District {
  id: number;
  name: string;
}
export interface Municipality {
  id: number;
  district_id: number;
  name: string;
  points: number;
}
export interface LocationOption {
  value: string;
  points: number;
}

@Injectable({
  providedIn: 'root'
})

export class ApplicantService {

constructor(private http: HttpClient) {}
  getDistrictsAndMunicipalities(): Observable<{ districts: District[], municipalities: Municipality[] }> {
    // DEVELOPMENT SSL
    return this.http.get<{ districts: District[], municipalities: Municipality[] }>(`${API_URL}/districts-municipalities`); 
    // PRODUCTION
    // return this.http.get<{ districts: District[], municipalities: Municipality[] }>(`${API_URL}applicant/fetchDistrictAndMunicipality`);

  }
  getLocationOptions(category: 'hometown' | 'barangay_accessibility' | 'hard_to_reach'): Observable<LocationOption[]> {
    // DEVELOPMENT SSL
    return this.http.get<LocationOption[]>(`${API_URL}/applicant/getLocationOptions/${category}`);
    // PRODUCTION
    // return this.http.get<LocationOption[]>(`${API_URL}applicant/getLocationOptions/${category}`);
  }
  // Submit application
  submitInformation(formData: FormData): Observable<any> {
    // DEVELOPMENT SSL
    return this.http.post(`${API_URL}/submit`, formData);
    // PRODUCTION
    // return this.http.post(`${API_URL}applicant/submit`, formData);

  }
  // check for existing data 
  checkDuplicate(data: any) {
    // DEVELOPMENT SSL
  return this.http.post<any>(API_URL + '/checkDuplicate', data);
  // PRODUCTION
  // return this.http.post<any>(API_URL + 'applicant/checkDuplicate', data);

  }
  // verify secret password 
  verifySecret(applicantId: number, answer: string) {
    // DEVELOPMENT SSL
    return this.http.post<any>(API_URL + '/verifySecret', { applicantId, answer });
    // PRODUCTION
    // return this.http.post<any>(API_URL + 'applicant/verifySecret', { applicantId, answer });

  }
  
  // update existing applicant 
  updateApplicant(formData: FormData): Observable<any> {
    // DEVELOPMENT SSL
    return this.http.post(`${API_URL}/update`, formData);
    // PRODUCTION
    // return this.http.post(`${API_URL}applicant/update`, formData);

  }

  // Get applicants list
  getApplicants(): Observable<any[]> {
    // DEVELOPMENT SSL
    return this.http.get<any[]>(`${API_URL}/list`);
    // PRODUCTION
    // return this.http.get<any[]>(`${API_URL}list`);
  }

  // Get applicant by ID
  getApplicant(id: number): Observable<any> {
    // DEVELOPMENT SSL
    return this.http.get<any>(`${API_URL}/${id}`);
    // PRODUCTION
    // return this.http.get<any>(`${API_URL}${id}`);
  }

  getAssessmentAnswers(application_ref_no: string) {
    // DEVELOPMENT SSL
    return this.http.get(`${API_URL}/assessment/get/${application_ref_no}`);
    // PRODUCTION
    // return this.http.get(`${API_URL}applicant/getAssessmentAnswers/${application_ref_no}`);
  }

  // updateScholarshipType(applicationRefNo: string, scholarshipType: string) {
  updateScholarshipType(
    applicationRefNo: string,
    scholarshipType: string,
    priorityCourse?: string 
  ) {
    // DEVELOPMENT SSL
    return this.http.post(`${API_URL}/applicant/applyScholarship`, {
    // PRODUCTION
    // return this.http.post(`${API_URL}applicant/applyScholarship`, {
      applicationRefNo,
      scholarshipType,
      ...(priorityCourse ? { priorityCourse } : {}) 
    });
  }

  getAppliedScholarships(refNo: string): Observable<string[]> {
    // DEVELOPMENT SSL
    return this.http.get<{ data: string[] }>(`${environment.apiUrl}/applicant/getAppliedScholarships?ref_no=${refNo}`)
    // PRODUCTION
    // return this.http.get<{ data: string[] }>(`${API_URL}applicant/getAppliedScholarships?ref_no=${refNo}`)
      .pipe(map(res => res.data));
  }

  
}