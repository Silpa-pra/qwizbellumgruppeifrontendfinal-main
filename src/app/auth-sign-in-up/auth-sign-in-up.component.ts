import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { GameService } from '../services/game.service';

/**
 * Die AuthSignInUpComponent verwaltet die Logik und Darstellung für die Anmeldung und Registrierung.
 * Sie ist verantwortlich für die Validierung der Formulareingaben, die Kommunikation mit dem AuthService
 * und die Navigation nach erfolgreicher Anmeldung oder Registrierung.
 */
@Component({
  selector: 'app-auth-sign-in-up',
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './auth-sign-in-up.component.html',
  standalone: true,
  styleUrl: './auth-sign-in-up.component.css',
})
export class AuthSignInUpComponent {
  signInForm: FormGroup;
  signUpForm: FormGroup;
  isActive = false;
  profileImagePreview: SafeUrl | null = null;

  /**
   * Konstruktor der AuthSignInUpComponent.
   * @param fb Der FormBuilder zum Erstellen der Formular
   * @param sanitizer Der DomSanitizer zum sicheren Anzeigen von URLs
   * @param router Der Router zum Navigieren zwischen den Seiten
   * @param authService Der AuthService zum Verwalten der Authentifizierung
   * @param gameService Der GameService zum Speichern von Spieldaten.
   */
  constructor(
    private fb: FormBuilder,
    private sanitizer: DomSanitizer,
    private router: Router,
    private authService: AuthService,
    private gameService: GameService
  ) {
    this.signInForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });

    this.signUpForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      profilePicture: [null],
    });
  }

  /**
   * Wird aufgerufen, wenn das Anmeldeformular abgeschickt wird.
   * Validiert das Formular und sendet die Anmeldedaten an den AuthService.
   */
  onSignIn() {
    if (this.signInForm.valid) {
      this.authService.login(this.signInForm.value).subscribe({
        next: (response) => {
          this.savePlayerDataLocaly(response);
          this.router.navigate(['/lobby']);
        },
        error: (err) => {
          console.error('Sign In Error:', err);
          alert('Sign In Failed: ' + (err.error?.message || 'Unknown error'));
        },
      });
    } else {
      console.log('Form is invalid', this.signInForm.errors);
    }
  }

  /**
   * Wird aufgerufen, wenn das Registrierungsformular abgeschickt wird.
   * Validiert das Formular und sendet die Registrierungsdaten an den AuthService.
   */
  onSignUp() {
    if (this.signUpForm.valid) {
      const formData = new FormData();
      const formValue = this.signUpForm.value;

      const userData = {
        username: formValue.name,
        email: formValue.email,
        password: formValue.password,
      };
      formData.append('player', new Blob([JSON.stringify(userData)], { type: 'application/json' }));

      // Profilbild nur hinzufügen, wenn es hochgeladen wurde
      if (formValue.profilePicture) {
        formData.append('profilePicture', formValue.profilePicture);
      }

      this.authService.register(formData).subscribe({
        next: (response) => {
          console.log('Registrierung erfolgreich:', response);
          this.savePlayerDataLocaly(response);
          this.router.navigate(['/lobby']);
        },
        error: (err) => {
          console.error('Fehler bei der Registrierung:', err);
          alert('Registrierung fehlgeschlagen: ' + (err.error?.message || 'Unbekannter Fehler'));
        },
      });
    } else {
      console.log('Das Formular ist ungültig:', this.signUpForm.errors);
    }
  }

  /**
   * Speichert die Spieldaten lokal im SessionStorage.
   * @param response Die Antwort des AuthService mit den Spieldaten.
   */
  savePlayerDataLocaly(response: any) {
    this.gameService.saveToSessionStorage('playerId', response.playerId);
    this.gameService.saveToSessionStorage('token', response.token);
    this.gameService.saveToSessionStorage('username', response.username);
    this.gameService.saveToSessionStorage('profileImage', response.profileImage);
  }

  /**
   * Wird aufgerufen, wenn eine Datei für das Profilbild ausgewählt wird.
   * Lädt die Datei und zeigt eine Vorschau des Profilbilds an.
   * @param event Das Ereignis des Dateiauswahl-Inputs.
   */
  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.signUpForm.patchValue({ profilePicture: file });

      const reader = new FileReader();
      reader.onload = () => {
        this.profileImagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  //Entfernt das ausgewählte Profilbild und setzt die Vorschau zurück.
  removeProfilePicture() {
    this.signUpForm.patchValue({ profilePicture: null });
    this.profileImagePreview = null;

    const fileInput = document.getElementById('profilePicture') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  //Schaltet das Anmelde- und Registrierungsformular um.
  togglePanel() {
    this.isActive = !this.isActive;
  }
}
