import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WebSocketService } from '../services/websocket.service';
import { GameService } from '../services/game.service';
import { QuestionService } from '../services/question.service';
import { QuestionComponent } from './question/question.component';
import { CommonModule } from '@angular/common';
import { ResultService } from '../services/result.service';

/**
 * Die GameComponent verwaltet die Logik und Darstellung des Spiels.
 * Sie ist verantwortlich für die Verbindung zum WebSocket, das Abrufen und Anzeigen von Fragen,
 * das Übermitteln von Antworten und das Anzeigen der Spielergebnisse.
 */
@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  standalone: true,
  imports: [CommonModule, QuestionComponent],
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {
  gameSessionId: string = '';
  playerId: string = '';
  gameMode: 'single' | 'multiplayer' | null = null;
  currentQuestion: any = null;
  waitForStart: boolean = true;
  allPlayers: any[] = [];
  questionTimer: number = 5;
  remainingTime: number = this.questionTimer;
  timerTimeout: any;
  iscurrentAnserCorrect: string = 'NOANSWER';//Input


  /**
   * Konstruktor der GameComponent.
   * @param route Die ActivatedRoute zum Abrufen der URL-Parameter,
   * @param router Der Router zum Navigieren zwischen den Seiten,
   * @param webSocketService Der WebSocketService zum Verwalten der WebSocket-Verbindung,
   * @param gameService Der GameService zum Abrufen von Spieldaten,
   * @param questionService Der QuestionService zum Abrufen von Fragen,
   * @param resultService Der ResultService zum Verwalten der Spielergebnisse.
   */
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private webSocketService: WebSocketService,
    private gameService: GameService,
    private questionService: QuestionService,
    private resultService: ResultService
  ) {}

  // Wird beim Initialisieren der Komponente aufgerufen
  ngOnInit(): void {
    console.log("GameComponent initialized");
    this.checkParams();
    this.connectToGameWebSocket();
    this.checkGameStart();
    this.loadPlayerDetails();
  }

  //Überprüft die URL-Parameter und setzt die Spiel- und Spieler-ID.
  checkParams(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['gameSessionId']) {
        this.gameSessionId = params['gameSessionId'];
      }
      if (params['mode'] === 'multiplayer') {
        this.gameMode = 'multiplayer';
      } else if (params['mode'] === 'single') {
        this.gameMode = 'single';
      }
      this.playerId = sessionStorage.getItem('playerId') || '';
    });
  }

  //Überprüft, ob das Spiel gestartet wurde
  checkGameStart(): void {
    if (!this.gameSessionId) {
      console.error("Fehler: `gameSessionId` fehlt beim Game Start Check.");
      return;
    }
    this.gameService.checkGameStart(this.gameSessionId).subscribe({
      next: (response) => {
        console.log('Game start response:', response);
      },
      error: (error) => {
        console.error('Fehler beim Spielstart:', error);
      },
    });
  }

  //Verbindet sich mit dem WebSocket für die gegebene Spielsession.
  connectToGameWebSocket(): void {
    if (!this.gameSessionId) {
      console.error('Fehler: Keine `gameSessionId` gefunden.');
      return;
    }

    this.webSocketService.initializeWebSocket(this.gameSessionId)
      .then(() => {
        this.listenToWebSocket();
      })
      .catch((error) => {
        console.error('Fehler bei der WebSocket-Verbindung:', error);

      });
  }

  //Hört auf eingehende WebSocket-Nachrichten und reagiert
  listenToWebSocket(): void {
    this.webSocketService.getGameMessages().subscribe((message) => {
       if (message.type === 'GAME_START') {
        this.loadPlayerDetails();
        this.waitForStart = false;
        this.askNextQuestion();
      } else if (message.type === 'QUESTION') {
        this.showQuestion(message);
      }else if (message.type === 'RESULT') {
        this.seeResult(message.results);
      }
    });
  }

  //Fragt die nächste Frage für das Spiel ab.
  askNextQuestion(): void {
    if (!this.gameSessionId) {
      console.error("Fehler: `gameSessionId` fehlt beim Abrufen der nächsten Frage.");
      return;
    }

    this.questionService.getNextQuestion(this.gameSessionId).subscribe({
      next: (response) => {
        this.checkCorrectAnswer(response.istCorrect);
      },
      error: (error) => {
        console.error('Fehler beim Abrufen der Frage:', error);
      },
    });
  }

  /**
   * Überprüft, ob die Antwort des Spielers korrekt ist.
   * @param istCorrect Gibt an, ob die Antwort korrekt ist.
   */
  checkCorrectAnswer(isCorrect: boolean): void {
    this.iscurrentAnserCorrect = isCorrect ? 'CORRECT' : 'WRONG';
  }

  handleAnswerClick(answerId: string): void {
    this.submitAnswer(answerId);
    this.checkCorrectAnswer(this.currentQuestion.correctAnswerId === answerId);
  }

  /**
   * Zeigt die aktuelle Frage an.
   * @param question Die anzuzeigende Frage.
   */
  showQuestion(question: any): void {
    console.log('Frage anzeigen:', question);
    this.currentQuestion = question;
    this.iscurrentAnserCorrect = 'NOANSWER';
    this.startTimer();

  }


  /**
   * Übermittelt die Antwort des Spielers.
   * @param answerId Die ID der Antwort des Spielers.
   */
  submitAnswer(answerId: string|null ): void {

    this.clearTimer()
    if (!this.gameSessionId || !this.playerId) {
      console.error("Fehler: `gameSessionId` oder `playerId` ist nicht gesetzt.");
      return;
    }

    let submissionData = {
      gameSessionId: this.gameSessionId,
      playerId: this.playerId,
      answerId: answerId,
    };

    this.questionService.submitAnswer(submissionData).subscribe({
      next: (response) => {
        if (!response.quizEnded) {
          this.askNextQuestion();
        }
      },
      error: (error) => {
        console.error('Fehler bei der Antwortübermittlung:', error);
      },
    });
  }

  /**
   * Zeigt die Ergebnisse des Spiels an.
   * @param results Die Ergebnisse des Spiels.
   */
  seeResult(results: any): void {
    this.resultService.setResult(results);
    this.router.navigate(['/result'], {
      queryParams: {
        gameSessionId: this.gameSessionId,
        playerId: this.playerId
      }
    });
  }

//Details der Spieler für das aktuelle Spiel laden
  loadPlayerDetails(): void {
    this.gameService.getPlayerDetailsForGame(this.gameSessionId).subscribe({
      next: (players) => {
        this.allPlayers = players.map(player => ({
          ...player,
          profileImage: player.profileImage
            ? `data:image/jpeg;base64,${player.profileImage}`
            :`https://ui-avatars.com/api/?name=${player.username}&background=random&color=fff`
        }));
      },
      error: (error) => {
        console.error("Fehler beim Abrufen der Spielerinformationen:", error);
      }
    });
  }

  //timer für Fragen starten
  startTimer(): void {
    this.clearTimer();
    this.remainingTime = this.questionTimer;
    this.timerTimeout = setInterval(() => {
      if(this.remainingTime <= 0) {
        this.clearTimer();
      this.submitAnswer(null);
      }else{
        this.remainingTime--;
      }
    },1000);
  }

//timer stoppen
  clearTimer(): void {
    if(this.timerTimeout)
    {
      clearInterval(this.timerTimeout);
      this.remainingTime = 0;
    }

  }

  //spiel verlassen und zurück an lobby
  exitGame(): void {
    this.router.navigate(['/lobby']);
  }

}
