import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { Observable } from 'rxjs';

// --- PRODUCTION ---
// const API_URL = environment.apiUrl+'/qsas-backend/';
// --- SSL ---
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
    return this.http.get<{ success: boolean; data: Question[] }>(`${API_URL}/assessment/getQuestions`);
    // return this.http.get<{ success: boolean; data: Question[] }>(`${API_URL}assessment/getQuestions`);

  }

  // Store answers from AssessmentController
  saveAssessmentAnswers(application_ref_no: string, answers: any) {
    return this.http.post(`${API_URL}/assessment/save`, {
    // return this.http.post(`${API_URL}assessment/save`, {
      application_ref_no,
      answers
    });
  }

}
