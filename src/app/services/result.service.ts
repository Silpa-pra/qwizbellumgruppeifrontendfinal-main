import { Injectable } from '@angular/core';

/**
 * Der ResultService verwaltet die Spielergebnisse.
 * Er ermöglicht das Setzen, Abrufen und Löschen von Ergebnissen.
 */
@Injectable({
  providedIn: 'root'
})
export class ResultService {
  private resultData: any = null;

  /**
   * Setzt das Spielergebnis.
   * @param result Das zu speichernde Ergebnis.
   */
  setResult(result: any) {
    this.resultData = result;
  }

  /**
   * Ruft das gespeicherte Spielergebnis ab.
   * @returns Das gespeicherte Ergebnis oder null, wenn kein Ergebnis vorhanden ist.
   */
  getResult() {
    return this.resultData;
  }

  // Löscht das gespeicherte Spielergebnis.
  clearResult() {
    this.resultData = null;
  }
}
