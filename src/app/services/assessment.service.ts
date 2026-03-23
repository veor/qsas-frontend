import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { Observable } from 'rxjs';

// --- PRODUCTION ---
// const API_URL = environment.apiUrl+'/qsas-backend/';

// --- DEVELOPMENT SSL ---
const API_URL = environment.apiUrl;

export interface Question {
  id: string;
  question: string;
  options: string[];
  selectedAnswer?: string;
}

export interface AssessmentAnswer {
  id: string;
  answer: string;
}

@Injectable({
  providedIn: 'root'
})

export class AssessmentService {

constructor(
  private http: HttpClient
) {}

  // Fetch questions from AssessmentController
  getAssessmentQuestions(): Observable<{ success: boolean; data: Question[] }> {
    // DEVELOPMENT SSL
    return this.http.get<{ success: boolean; data: Question[] }>(`${API_URL}/assessment/getQuestions`); 
    // PRODUCTION
    // return this.http.get<{ success: boolean; data: Question[] }>(`${API_URL}assessment/getQuestions`); 

  }

  // Store answers from AssessmentController
  saveAssessmentAnswers(application_ref_no: string, answers: any) {
    // DEVELOPMENT SSL
    return this.http.post(`${API_URL}/assessment/save`, { 
    // PRODUCTION
    // return this.http.post(`${API_URL}assessment/saveAssessmentAnswers`, { 
      application_ref_no,
      answers
    });
  }

}
