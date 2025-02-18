import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * Die AppComponent ist die Hauptkomponente der Anwendung.
 * Sie stellt den Einstiegspunkt der Anwendung dar und enthält den RouterOutlet für die Navigation.
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  standalone: true
})
export class AppComponent {
  title = 'QuizbellumFrontend';
}
