import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameService } from '../services/game.service';

interface QuizHistory {
  gameSessionId: string;
  startTime: string;
  myScore: number;
  myStatus: string;
  playerNames: string[];
}

/**
 * Die PlayerGameHistoryComponent zeigt die Spielhistorie eines Spielers an.
 * Sie lädt die Historie aus der Datenbank.
 */
@Component({
  selector: 'app-player-game-history',
  imports: [CommonModule, FormsModule],
  templateUrl: './player-game-history.component.html',
  standalone: true,
  styleUrls: ['./player-game-history.component.css']
})

export class PlayerGameHistoryComponent implements OnInit {
  quizHistory: QuizHistory[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';

  /**
   * Konstruktor der PlayerGameHistoryComponent.
   * @param gameService Der GameService zum Abrufen der Spielhistorie.
   */
  constructor(private gameService: GameService) {}

  // Wird beim Initialisieren der Komponente aufgerufen
  ngOnInit(): void {
    this.loadHistoryFromDB();
  }

  // Lädt die Spielhistorie des Spielers aus der Datenbank
  loadHistoryFromDB(): void {
    const playerId = sessionStorage.getItem("playerId"); // Player-ID aus `sessionStorage` holen

    if (!playerId) {
      console.error("Fehler: Keine Player-ID in Session gefunden!");
      this.errorMessage = "Spieler-ID nicht gefunden!";
      this.isLoading = false;
      return;
    }

    this.gameService.getPlayerHistory(playerId).subscribe({
      next: (data) => {
        this.quizHistory = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Fehler beim Laden der Spielerhistorie:', err);
        this.errorMessage = 'Fehler beim Laden der Spielerhistorie!';
        this.isLoading = false;
      }
    });
  }
}
