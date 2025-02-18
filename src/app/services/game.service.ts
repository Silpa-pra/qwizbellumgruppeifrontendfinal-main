import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

/**
 * Der GameService bietet Methoden zur Verwaltung von Spielen.
 * Er ermöglicht das Erstellen, Beitreten und Verlassen von Spielen sowie das Abrufen von Spielhistorien
 */
@Injectable({
  providedIn: 'root',
})
export class GameService {
  private gameUrl = `${environment.apiUrl}/game`;
  private playerUrl = `${environment.apiUrl}/players`;


  /**
   * Konstruktor des GameService.
   * @param http Der HttpClient zum Senden von HTTP-Anfragen.
   */
  constructor(private http: HttpClient) {}



  private getAuthHeaders(): HttpHeaders {
    const token = this.getFromSessionStorage("token");
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  /**
   * Erstellt ein Solo-Spiel.
   * @returns Ein Observable mit der Antwort des Servers.
   */
  createSoloGame(): Observable<any> {
    return this.createGame(5, 1);
  }

  /**
   * Erstellt ein Multi-Spiel.
   * @param noOfQuestions Anzahl der Fragen im Spiel.
   * @param noOfPlayers Anzahl der Spieler im Spiel.
   * @returns Ein Observable mit der Antwort des Servers.
   */
  createMultiGame(noOfQuestions: number, noOfPlayers: number): Observable<any> {
    //heire parameter angeben
    return this.createGame(noOfQuestions, noOfPlayers);
  }

  /**
   * Erstellt ein Spiel.
   * @param numberOfQuestions Anzahl der Fragen im Spiel.
   * @param maxPlayers Maximale Anzahl der Spieler im Spiel.
   * @returns Ein Observable mit der Antwort des Servers.
   */
  public createGame(numberOfQuestions: number, maxPlayers: number): Observable<any> {
    const playerId = this.getFromSessionStorage("playerId");
    const body = {
      numberOfQuestions,
      maxPlayers,
      playerIds: [playerId]
    };
    return this.http.post(`${this.gameUrl}/create`, body, { headers: this.getAuthHeaders() });
  }

  /**
   * Ruft offene Spiele ab.
   * @returns Ein Observable mit einer Liste der offenen Spiele.
   */
  getOpenGames(): Observable<any[]> {
    return this.http.get<any[]>(`${this.gameUrl}/OpenGames`, { headers: this.getAuthHeaders() });
  }

  /**
   * Ruft die Spielhistorie eines Spielers ab.
   * @param playerId Die ID des Spielers.
   * @returns Ein Observable mit der Spielhistorie des Spielers.
   */
 getPlayerHistory(playerId: string): Observable<any[]> {
  console.log("playerId", playerId);

  const body = { playerId };

  return this.http.post<any[]>(`${environment.apiUrl}/score/history`, body, {
    headers: this.getAuthHeaders(),
  });
}

  /**
   * Tritt einem Spiel bei.
   * @param gameSessionID Die ID der Spielsession.
   * @returns Ein Observable mit der Antwort des Servers.
   */
  joinGame(gameSessionID: string): Observable<any> {
    const playerId = this.getFromSessionStorage("playerId");

    const body = {
      gameId: gameSessionID,
      playerId: playerId
    };

    return this.http.post(`${this.gameUrl}/join`, body, { headers: this.getAuthHeaders() });
}

  /**
   * Verlässt ein Spiel.
   * @param gameSessionID Die ID der Spielsession.
   * @returns Ein Observable mit der Antwort des Servers.
   */
leaveGame(gameSessionID: string): Observable<any> {
  const playerId = this.getFromSessionStorage("playerId");

  const body = {
    gameId: gameSessionID,
    playerId: playerId
  };

  return this.http.post(`${this.gameUrl}/leave`, body, { headers: this.getAuthHeaders() });
}

  /**
   * Überprüft den Spielstart.
   * @param gameSessionID Die ID der Spielsession.
   * @returns Ein Observable mit der Antwort des Servers.
   */
  checkGameStart(gameSessionID: string): Observable<any> {
    const body = {
      gameSessionId: gameSessionID
    };

    return this.http.post(`${this.gameUrl}/start`, body, { headers: this.getAuthHeaders() });
  }

  /**
   * Ruft die Rangliste ab.
   * @returns Ein Observable mit der Rangliste.
   */
  getLeaderboard(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/score/getLeaders`, { headers: this.getAuthHeaders() });
  }

  /**
   * Ruft die Anzahl der kürzlich gespielten Spiele ab.
   * @returns Ein Observable mit der Anzahl der kürzlich gespielten Spiele.
   */
  getRecentGamesCount(): Observable<number> {
    return this.http.get<number>(`${environment.apiUrl}/game/recentGamesCount`, { headers: this.getAuthHeaders() });
  }

  /**
   * Ruft die Gesamtanzahl der Spieler ab.
   * @returns Ein Observable mit der Gesamtanzahl der Spieler.
   */
  getTotalPlayersCount(): Observable<number> {
    return this.http.get<number>(`${this.playerUrl}/count`);
  }

  /**
   * Speichert einen Wert im SessionStorage.
   * @param key Der Schlüssel, unter dem der Wert gespeichert werden soll.
   * @param value Der zu speichernde Wert.
   */
  saveToSessionStorage(key: string, value: string) {
    sessionStorage.setItem(key, value);
  }

  /**
   * Ruft die Spieldetails für eine Spielsession ab.
   * @param gameSessionId Die ID der Spielsession.
   * @returns Ein Observable mit den Spieldetails.
   */
  getPlayerDetailsForGame(gameSessionId: string): Observable<any[]> {
    const body = { gameSessionId };

    return this.http.post<any[]>(`${this.playerUrl}/gamePlayers`, body, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    });
  }

  notifyOthersOfLeftPlayer(gameSessionId: string, playerId: string): Observable<any> {
    const body = { gameSessionId, playerId };
    return this.http.post(`${this.gameUrl}/notifyLeave`, body, { headers: this.getAuthHeaders() });
  }

  /**
   * Ruft einen Wert aus dem SessionStorage ab.
   * @param key Der Schlüssel, unter dem der Wert gespeichert ist.
   * @returns Der gespeicherte Wert oder null, wenn der Schlüssel nicht existiert.
   */
  getFromSessionStorage(key: string): string | null {
    return sessionStorage.getItem(key);
  }

}
