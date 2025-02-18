import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgClass, CommonModule } from '@angular/common';
import { ResultService } from '../services/result.service';

interface GameResult {
  playerId: string;
  playerName: string;
  points: number;
  status: string; // Neu hinzugefügt (WON, LOST, UNDECIDED)
}

/**
 * Die ResultComponent zeigt die Ergebnisse eines Spiels an.
 * Sie lädt die Ergebnisse aus dem ResultService und berechnet den Rang des aktuellen Spielers.
 */
@Component({
  selector: 'app-result',
  standalone: true,
  imports: [NgClass, CommonModule],
  templateUrl: './result.component.html',
  styleUrl: './result.component.css'
})
export class ResultComponent implements OnInit {
  status: string = 'UNDECIDED'; // Standardwert UNDECIDED
  score: number = 0;
  gameSessionId: string = '';
  playerId: string = '';
  gameResults: GameResult[] = [];
  matchDetails: GameResult[] = [];
  yourRank: number = 0;
  currentPlayer: string = '';


  /**
   * Konstruktor der ResultComponent
   * @param route Die ActivatedRoute zum Abrufen der URL-Parameter,
   * @param router Der Router zum Navigieren zwischen den Seiten,
   * @param resultService Der ResultService zum Abrufen der Spielergebnisse.
   */
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private resultService: ResultService
  ) {}

  // Wird beim Initialisieren der Komponente aufgerufen
  ngOnInit(): void {
    this.checkParameters();
    this.loadResults();
  }

  // URL-Parameter auslesen
  checkParameters(): void {
    this.route.queryParams.subscribe(params => {
      this.gameSessionId = params['gameSessionId'] || '';
      this.playerId = params['playerId'] || '';
    });
  }

  //Lädt die Ergebnisse aus dem ResultService.
  loadResults(): void {
    const storedResult = this.resultService.getResult();

    if (!storedResult || storedResult.length === 0) {
      console.error("Fehler: Kein gespeichertes Ergebnis gefunden!");
      this.status = "UNDECIDED"; // Standardwert setzen
      return;
    }

    this.gameResults = storedResult;
    this.updateStatusFromResult();
    this.calculateYourRank();
    this.prepareMatchDetails();

    // Setzt die Spielername
    const currentPlayerData = this.gameResults.find(player => player.playerId === this.playerId);
    if (currentPlayerData) {
      this.currentPlayer = currentPlayerData.playerName;
    } else {
      console.error("Fehler: Kein gültiger Spielername gefunden.");
    }
  }

  //Aktualisiert den Status des aktuellen Spielers basierend auf den Ergebnissen
  updateStatusFromResult(): void {
    if (!this.gameResults || this.gameResults.length === 0) {
      console.error("Fehler: `gameResults` ist leer oder nicht geladen.");
      this.status = "UNDECIDED";
      return;
    }

    const currentPlayer = this.gameResults.find(player => player.playerId === this.playerId);

    if (!currentPlayer) {
      console.error("Fehler: Spieler nicht in den Ergebnissen gefunden!");
      this.status = "UNDECIDED";
      return;
    }

    this.score = currentPlayer.points;
    this.status = currentPlayer.status || "UNDECIDED";
  }


  //Berechnet das Ranking des aktuellen Spielers.
  calculateYourRank(): void {
    const sortedPlayers = this.gameResults.slice().sort((a, b) => b.points - a.points);
    const currentPlayerIndex = sortedPlayers.findIndex(player => player.playerId === this.playerId);
    this.yourRank = currentPlayerIndex + 1;
  }

  // Liste der anderen Spieler vorbereiten
  prepareMatchDetails(): void {
    this.matchDetails = this.gameResults.filter(player => player.playerId !== this.playerId);
  }

  //Spiel verlassen
  onExit(): void {
    this.resultService.clearResult();
    this.router.navigate(['/lobby']);
  }

}
