import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CreateRoomComponent } from './room/create-room/create-room.component';
import { JoinRoomComponent } from './room/join-room/join-room.component';
import { WebSocketService } from '../services/websocket.service';
import { GameService } from '../services/game.service';
import { NgIf, NgFor } from '@angular/common';

interface Player {
  playerName: string;
  playerId: string;
  totalScore: number;
}

@Component({
  imports: [
    RouterLink,
    NgIf,
    NgFor,
    CreateRoomComponent,
    JoinRoomComponent
  ],
  selector: 'app-lobby',
  standalone: true,
  styleUrls: ['./lobby.component.css'],
  templateUrl: './lobby.component.html'
})
export class LobbyComponent implements OnInit, OnDestroy {
  playerName: string = '';
  totalPlayers: number = 5547;
  recentGames: number = 10;
  profilePicture: string | null = null;
  showCreateRoom = false;
  showJoinRoom = false;

  leaderboard: Player[] = [];

  constructor(
    private router: Router,
    private webSocketService: WebSocketService,
    private gameService: GameService
  ) {
    console.log("I am in lobby");
  }

  // Wird beim Initialisieren der Komponente aufgerufen
  ngOnInit(): void {
    this.loadPlayerData();
    this.loadLeaderboard();
    this.loadRecentGames();
    this.loadTotalPlayers();
    this.connectToGameWebSocket();
  }


  //Stellt eine Verbindung zum WebSocket-Server für das Spiel her
  private connectToGameWebSocket(): void {
    console.log('Connecting to WebSocket...');
    const gameId = sessionStorage.getItem('gameSessionId') || '';
    this.webSocketService.initializeWebSocket(gameId);
  }


 // Entfernt WebSocket-Abonnements, um Speicherlecks zu vermeiden
  private cleanupWebSocketSubscriptions(): void {
    this.webSocketService.unsubscribeFromWaitChannel();
  }

  //Erstellt ein Solo-Spiel und navigiert zur Spielseite
  createSoloGame(): void {
    console.log("Solo game created!")
    this.gameService.createSoloGame().subscribe({
      next: (game) => {
        this.router.navigate(['/game'], {queryParams: {mode: 'single', gameSessionId: game.sessionId}});
      },
      error: (error) => {
        console.error("Error creating solo game", error);
      }
    });
  }

  /**
   * Erstellt ein Multiplayer-Spiel mit der angegebenen Anzahl von Fragen und Spielern
   *
   * @param noOfQuestions Anzahl der Fragen im Spiel
   * @param maxPlayers Maximale Anzahl der Spieler
   */
  createMultiGame(noOfQuestions: number, maxPlayers:number): void {
    this.gameService.createMultiGame(noOfQuestions, maxPlayers).subscribe({
      next: (game) => {
        console.log("Multiplayer-Spiel erstellt!", game);
        this.webSocketService.initializeWebSocket(game.sessionId);
        this.router.navigate(['/game'], {queryParams: {mode: 'multiplayer', gameSessionId: game.sessionId}});
      },
      error: (error) => {
        console.error("Fehler beim Erstellen eines Multiplayer-Spiels", error);
      }
    });
  }


  // Lädt die Spielerdaten aus dem SessionStorage
  private loadPlayerData(): void {
    this.playerName = this.gameService.getFromSessionStorage('username') || 'Guest';
    this.playerName = this.playerName.toLocaleUpperCase();

    const base64Image = this.gameService.getFromSessionStorage('profileImage');

    if (base64Image) {
      this.profilePicture = `data:image/png;base64,${base64Image}`;
    } else {
      // Wenn kein Bild vorhanden ist, wird eine zufällige Avatar-URL generiert
      this.profilePicture = `https://ui-avatars.com/api/?name=${this.playerName}&background=random&color=fff`;
    }
  }

  // Lädt die Gesamtanzahl der Spieler
  loadTotalPlayers(): void {
    this.gameService.getTotalPlayersCount().subscribe({
      next: (count) => {
        this.totalPlayers = count;
      },
      error: (error) => {
        console.error("Fehler beim Abrufen der Spieleranzahl:", error);
      }
    });
  }


//Lädt die Best liste der Spieler.
  private loadLeaderboard(): void {
    console.log("Loading leaderboard...");
    this.gameService.getLeaderboard().subscribe({
      next: (leaders) => {
        this.leaderboard = leaders;
      },
      error: (error) => {
        console.error("Fehler beim Laden der Bestenliste", error);
      }
    });
  }

  //Lädt die Anzahl der letzten Spiele.
  private loadRecentGames(): void {
    this.gameService.getRecentGamesCount().subscribe({
      next: (count) => {
        this.recentGames = count;
      },
      error: (error) => {
        console.error("Fehler beim Laden der Anzahl vergangener Spiele", error);
      }
    });
  }

  // Zeigt das Fenster zum Erstellen eines spiel raum an.
  openCreateRoom() {
    this.showCreateRoom = true;
  }

  //Zeigt das Fenster zum Beitreten eines erstellte spiel raum an.
  openJoinRoom() {
    this.showJoinRoom = true;
  }

  /**
   * Handelt einen Multiplayer-Raum mit der angegebenen Anzahl von Fragen und Spielern.
   * @param data Objekt mit der Anzahl der Fragen und der maximalen Spieleranzahl
   */
  handleCreateRoom(data: { noOfQuestions: number, maxPlayers:number}) {
    this.createMultiGame(data.noOfQuestions, data.maxPlayers);
    this.showCreateRoom = false;
  }

  handleJoinRoom(room: any) {
    this.showJoinRoom = false;
  }


  //Loggt den Spieler aus und leitet zur Anmeldeseite weiter.
  logout(): void {
    sessionStorage.clear();
    this.router.navigate(['/auth']);
  }


  // Wird beim Zerstören der Komponente aufgerufen und bereinigt WebSocket-Abonnements.
  ngOnDestroy(): void {
    this.cleanupWebSocketSubscriptions();
  }
}
