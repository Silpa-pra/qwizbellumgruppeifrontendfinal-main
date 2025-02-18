import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-question',
  templateUrl: './question.component.html',
  standalone: true,
  imports: [CommonModule],
  styleUrls: ['./question.component.css'],
})
export class QuestionComponent implements OnChanges {
  @Input() currentQuestion: any;
  @Input() gameSessionId!: string;
  @Output() answerSelected = new EventEmitter<string>();
  isDisabled: boolean = false;
  selectedAnswerId: string | null = null;

  /**
   * Wird ausgeführt, wenn sich eine Eingabe (`@Input`) ändert.
   * Wenn eine neue Frage kommt, werden die Buttons wieder aktiviert.
   *
   * @param changes Enthält die Änderungen der Eingaben.
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['currentQuestion'] && changes['currentQuestion'].currentValue) {
      this.isDisabled = false;
    }
  }

  /**
   * Wird aufgerufen, wenn der Spieler eine Antwort anklickt.
   * Die Antwort wird an das `GameComponent` weitergegeben.
   * Danach werden die Buttons deaktiviert, damit der Spieler nicht mehrmals klicken kann.
   *
   * @param answerId Die ID der angeklickten Antwort.
   */
  onSelectAnswer(answerId: string): void {
    if (!this.isDisabled) {
      console.log('Ausgewählte Antwort:', answerId);
      this.answerSelected.emit(answerId);
      this.isDisabled = true;
    }
  }


  handleAnswerClick(answerId: string): void {
    this.selectedAnswerId = answerId;
    this.answerSelected.emit(answerId);
  }

  isCorrectAnswer(answerId: string): boolean {
    return this.currentQuestion.correctAnswerId === answerId;
  }
}
