import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

/**
 * Die CreateRoomComponent ist ein Dialog Fenster, der es dem Spieler ermöglicht, einen Spiel Raum zu erstellen.
 */
@Component({
  selector: 'app-create-room',
  templateUrl: './create-room.component.html',
  styleUrls: ['./create-room.component.css'],
  standalone: true,
  imports: [FormsModule]
})
export class CreateRoomComponent {
  @Output() close = new EventEmitter<void>();
  @Output() createRoom = new EventEmitter<{maxPlayers: number, noOfQuestions: number}>();

  protected maxPlayers: number = 2;
  protected noOfQuestions: number = 10 ;

  onClose() {
    this.close.emit();
  }

  //Wir überprüfen, ob die Anzahl der Spieler und Fragen größer als 0 ist. Wenn ja, wird ein Event emittiert.
  onCreateRoom() {
    if (this.maxPlayers>0 && this.noOfQuestions>0) {
      this.createRoom.emit({
        maxPlayers: this.maxPlayers,
        noOfQuestions: this.noOfQuestions
      });
    }
  }
}
