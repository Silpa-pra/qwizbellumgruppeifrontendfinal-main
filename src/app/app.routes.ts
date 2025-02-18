import { Routes } from '@angular/router';
import { AuthSignInUpComponent } from './auth-sign-in-up/auth-sign-in-up.component';
import {LobbyComponent} from './lobby/lobby.component';
import {GameComponent} from './game/game.component';
import {PlayerGameHistoryComponent} from './player-game-history/player-game-history.component';
import {ResultComponent} from './result/result.component';
import {QuestionComponent} from './game/question/question.component';

/**
 * Die Routen der Anwendung.
 * Definiert die Pfade und die zugehörigen Komponenten für die Navigation.
 */
export const routes: Routes = [
  { path: '', redirectTo: '/auth', pathMatch: 'full' },
  { path: 'auth', component: AuthSignInUpComponent },
  { path: 'lobby', component: LobbyComponent },
  { path: 'game', component: GameComponent },
  { path: 'history', component: PlayerGameHistoryComponent },
  {path: 'result', component: ResultComponent},
  {path: 'question', component: QuestionComponent}
];
