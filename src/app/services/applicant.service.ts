import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';


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
    return this.http.get<{ districts: District[], municipalities: Municipality[] }>(`${API_URL}/districts-municipalities`);
  }
  getLocationOptions(category: 'hometown' | 'barangay_accessibility' | 'hard_to_reach'): Observable<LocationOption[]> {
    return this.http.get<LocationOption[]>(`${API_URL}/applicant/getLocationOptions/${category}`);
  }
  // Submit application
  submitInformation(formData: FormData): Observable<any> {
    return this.http.post(`${API_URL}/submit`, formData);
  }
  // check for existing data 
  checkDuplicate(data: any) {
  return this.http.post<any>(API_URL + '/checkDuplicate', data);
  }
  // verify secret password 
  verifySecret(applicantId: number, answer: string) {
    return this.http.post<any>(API_URL + '/verifySecret', { applicantId, answer });
  }
  
  // update existing applicant 
  updateApplicant(formData: FormData): Observable<any> {
    return this.http.post(`${API_URL}/update`, formData);
  }

  // Get applicants list
  getApplicants(): Observable<any[]> {
    return this.http.get<any[]>(`${API_URL}/list`);
  }

  // Get applicant by ID
  getApplicant(id: number): Observable<any> {
    return this.http.get<any>(`${API_URL}/${id}`);
  }

  getAssessmentAnswers(application_ref_no: string) {
    return this.http.get(`${API_URL}/assessment/get/${application_ref_no}`);
  }

  updateScholarshipType(applicationRefNo: string, scholarshipType: string) {
    return this.http.post(`${API_URL}/applicant/applyScholarship`, {
      applicationRefNo,
      scholarshipType
    });
  }

  getAppliedScholarships(refNo: string): Observable<string[]> {
    return this.http.get<{ data: string[] }>(`${environment.apiUrl}/applicant/getAppliedScholarships?ref_no=${refNo}`)
      .pipe(map(res => res.data));
  }
}