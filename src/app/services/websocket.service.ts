import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import { environment } from '../../environments/environment';

/**
 * Der WebSocketService verwaltet die WebSocket-Verbindungen.
 * Er ermöglicht das Initialisieren, Abonnieren und Schließen von WebSocket-Verbindungen.
 */
@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private stompClient: any;
  private gameMessageSubject = new Subject<any>();
  private socketUrl: string = `${environment.websocketUrl}`;

  /**
   * Konstruktor des WebSocketService.
   * @param http Der HttpClient zum Senden von HTTP-Anfragen.
   */
  constructor(private http: HttpClient) { }

  /**
   * Ruft das Authentifizierungs-Token aus dem SessionStorage ab.
   * @returns Das gespeicherte Token oder null, wenn kein Token vorhanden ist.
   */
  private getAuthToken(): string | null {
    return sessionStorage.getItem("token");
  }

  /**
   * Initialisiert die WebSocket-Verbindung für eine gegebene Spielsession.
   * @param gameSessionId Die ID der Spielsession.
   * @returns Ein Promise, das aufgelöst wird, wenn die Verbindung erfolgreich hergestellt wurde.
   */
  initializeWebSocket(gameSessionId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const token = this.getAuthToken();

      if (!token) {
        console.error("Kein Token gefunden");
        reject("Token fehlt");
        return;
      }

      const socket = new SockJS(`${this.socketUrl}?token=${token}`);
      this.stompClient = Stomp.over(socket);

      const headers = {
        Authorization: `Bearer ${token}`
      };

      this.stompClient.connect(headers, (frame: any) => {
        console.log('Connected: ' + frame);
        this.subscribeToGameWebsocket(gameSessionId)
        resolve();
      }, (error: any) => {
        console.error('WebSocket connection error:', error);
        reject(error);
      });
    });
  }

  /**
   * Abonniert den WebSocket-Kanal für eine gegebene Spielsession.
   * @param gameSessionId Die ID der Spielsession.
   */
  private subscribeToGameWebsocket(gameSessionId: string) {

    this.stompClient.subscribe(`/topic/game/${gameSessionId}`, (message: any) => {
      try {
        const parsedMessage = JSON.parse(message.body);
        this.gameMessageSubject.next(parsedMessage);
      } catch (error) {
        console.error("Fehler beim Verarbeiten der WebSocket-Nachricht:", error);
      }
    });

    console.log(`Subscribed to WebSocket für Spiel: ${gameSessionId}`);
  }



  /**
   * Ruft die WebSocket-Nachrichten als Observable ab.
   * @returns Ein Observable mit den WebSocket-Nachrichten.
   */
  getGameMessages() {
    return this.gameMessageSubject.asObservable();
  }

  closeConnection(): void {
    if (this.stompClient) {
      this.stompClient.disconnect(() => {
        console.log('Von WebSocket getrennt');
      });
    }
  }

  //Meldet sich vom Warte-Kanal ab
  unsubscribeFromWaitChannel() {
    console.log('Vom Warte-Kanal abgemeldet');
  }


}
