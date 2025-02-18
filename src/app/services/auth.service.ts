import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';


/**
 * Der AuthService bietet Methoden zur Authentifizierung von Benutzern.
 * Er ermöglicht das Registrieren und Anmelden von Benutzern über HTTP-Anfragen.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
   private apiUrl = `${environment.apiUrl}/auth`;
  private registerUrl = `${this.apiUrl}/register`;
  private loginUrl = `${this.apiUrl}/login`;


  /**
   * Konstruktor des AuthService.
   * @param http Der HttpClient zum Senden von HTTP-Anfragen.
   */
  constructor(private http: HttpClient) {}

  /**
   * Login-Methode
   * Sendet die Anmeldedaten des Benutzers an den Server.
   * @param credentials Benutzeranmeldedaten (Username und Passwort)
   * @returns Ein Observable mit der Antwort des Servers.
   */
  login(credentials: { username: string; password: string }): Observable<any> {
    return this.http.post(this.loginUrl, credentials);
  }

  /**
   * Register-Methode
   * Sendet die Registrierungsdaten des Benutzers an den Server
   * @param formData Formulardaten mit Benutzerinformationen und Profilbild
   * @returns Ein Observable mit der Antwort des Servers
   */
  register(formData: FormData): Observable<any> {
    return this.http.post(this.registerUrl, formData);
  }

}
