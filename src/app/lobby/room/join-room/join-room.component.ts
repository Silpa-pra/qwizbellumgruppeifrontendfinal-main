import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../../../services/game.service';
import { Router, RouterModule } from '@angular/router'; ;

/**
 * Die JoinRoomComponent ermöglicht es dem Benutzer, offenen Spielräumen beizutreten.
 * Sie zeigt eine Liste der verfügbaren Spiele an und bietet Funktionen zum Beitreten und Verlassen von Spielräumen.
 */
@Component({
  selector: 'app-join-room',
  templateUrl: './join-room.component.html',
  standalone: true,
  imports: [CommonModule, RouterModule],
  styleUrl: './join-room.component.css'
})
export class JoinRoomComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  @Output() joinRoom = new EventEmitter<string>();

  games: any[] = [];
  errorMessage: string | null = null;
  successMessage: string | null = null;
  isJoining: boolean = false;

  /**
   * Konstruktor der JoinRoomComponent.
   * @param gameService Der GameService zum Abrufen und Verwalten von Spielen.
   * @param router Der Router zum Navigieren zwischen den Seiten.
   */
  constructor(
    private gameService: GameService,
    private router: Router) {}

  // Wird beim Initialisieren der Komponente aufgerufen
  ngOnInit(): void {
    this.loadOpenGames();
  }

  //Lädt offene Spiele vom GameService.
  private loadOpenGames(): void {
    this.gameService.getOpenGames().subscribe({
      next: (games) => {
        this.games = games || [];
      },
      error: (error) => {
        console.error('Error loading open games:', error);
        this.games = [];
      }
    });
  }

  onClose(): void {
    this.close.emit();
  }

  /**
   * Beitretten zu einem Spielraum.
   * @param gameSessionId Die ID der Spielsession, der beigetreten werden soll.
   */
  onJoinRoom(gameSessionId: string): void {
    this.errorMessage = null; // Fehler zurücksetzen, bevor ein neuer Request gemacht wird
    this.isJoining = true;
    this.gameService.joinGame(gameSessionId).subscribe({
      next: (response) => {
        this.successMessage = response.message
        this.loadOpenGames();
        this.router.navigate(['/game'], {queryParams: {mode: 'multiplayer', gameSessionId: gameSessionId}});
      },
      error: (error) => {
        this.errorMessage = error.error?.error || "An error occurred while joining the game.";
        console.error('Error joining game:', this.errorMessage);
        this.isJoining = false;
      }
    });
  }

  /**
   * Verlassen eines Spielraums.
   * @param gameSessionID Die ID der Spielsession, die verlassen werden soll.
   */
  onLeaveRoom(gameSessionID: string): void {
    this.errorMessage = null;
    this.successMessage = null;

    this.gameService.leaveGame(gameSessionID).subscribe({
      next: (response) => {
        this.successMessage = response.message || "You have successfully left the game!";
        this.loadOpenGames();
      },
      error: (error) => {
        this.errorMessage = error.error?.error || "An error occurred while leaving the game.";
        console.error('Error leaving game:', this.errorMessage);
      }
    });
  }

}


