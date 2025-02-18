import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import {catchError, Observable, tap, throwError} from 'rxjs';
import { environment } from '../../environments/environment';

/**
 * Der QuestionService bietet Methoden zur Verwaltung von Quizfragen.
 * Er ermöglicht das Abrufen der nächsten Frage und das Einreichen von Antworten.
 */
@Injectable({
  providedIn: 'root'
})
export class QuestionService {
  private apiUrl = `${environment.apiUrl}/quiz`;

  /**
   * Konstruktor des QuestionService.
   * @param http Der HttpClient zum Senden von HTTP-Anfragen.
   */
  constructor(private http: HttpClient) { }

  /**
   * Erstellt die Authentifizierungs-Header.
   * @returns Die HttpHeaders mit dem Authentifizierungs-Token.
   */
  private getAuthHeaders(): HttpHeaders {
    const token = sessionStorage.getItem("token");

    if (!token) {
      console.error("Fehlendes Authentifizierungstoken");
      return new HttpHeaders();
    }

    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  /**
   * Ruft die nächste Frage für eine gegebene Spielsession ab
   * @param gameSessionId Die ID der Spielsession.
   * @returns Ein Observable mit der nächsten Frage.
   */
getNextQuestion(gameSessionId: string): Observable<any> {
  console.log("gameSessionId", gameSessionId);
  return this.http.post<any>(`${this.apiUrl}/getNextQuestion`, { gameSessionId }, { headers: this.getAuthHeaders() });
}

  /**
   * Erreicht die Antwort auf eine Frage ein.
   * @param submissionData Die Daten der Antwort.
   * @returns Ein Observable mit der Antwort des Servers.
   */
  submitAnswer(submissionData: any): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/submitAnswer`,
      submissionData,
      { headers: this.getAuthHeaders() }
    );
  }
}
