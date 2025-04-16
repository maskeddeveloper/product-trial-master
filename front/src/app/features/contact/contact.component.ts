import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    InputTextareaModule,
    ButtonModule,
    ToastModule
  ],
  providers: [MessageService],
  template: `
    <div class="contact-container">
      <h2>Contact</h2>
      <form [formGroup]="contactForm" (ngSubmit)="onSubmit()">
        <div class="field">
          <label for="email">Email *</label>
          <input
            id="email"
            type="email"
            pInputText
            formControlName="email"
            class="w-full"
          />
          <small
            class="p-error"
            *ngIf="contactForm.get('email')?.invalid && contactForm.get('email')?.touched"
          >
            Email est requis et doit être valide
          </small>
        </div>

        <div class="field">
          <label for="message">Message *</label>
          <textarea
            id="message"
            pInputTextarea
            formControlName="message"
            [rows]="5"
            class="w-full"
          ></textarea>
          <small
            class="p-error"
            *ngIf="contactForm.get('message')?.hasError('required') && contactForm.get('message')?.touched"
          >
            Message est requis
          </small>
          <small
            class="p-error"
            *ngIf="contactForm.get('message')?.hasError('maxlength')"
          >
            Le message ne doit pas dépasser 300 caractères
          </small>
          <div class="char-count" [class.error]="contactForm.get('message')?.hasError('maxlength')">
            {{ messageLength }}/300
          </div>
        </div>

        <button
          pButton
          type="submit"
          label="Envoyer"
          [disabled]="contactForm.invalid"
        ></button>
      </form>
    </div>
    <p-toast></p-toast>
  `,
  styles: [`
    .contact-container {
      max-width: 600px;
      margin: 2rem auto;
      padding: 1rem;
    }
    .field {
      margin-bottom: 1.5rem;
    }
    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
    }
    .char-count {
      text-align: right;
      font-size: 0.8rem;
      margin-top: 0.25rem;
    }
    .char-count.error {
      color: var(--red-500);
    }
  `]
})
export class ContactComponent {
  contactForm: FormGroup;

  get messageLength(): number {
    return this.contactForm.get('message')?.value?.length || 0;
  }

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService
  ) {
    this.contactForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      message: ['', [Validators.required, Validators.maxLength(300)]]
    });
  }

  onSubmit(): void {
    if (this.contactForm.valid) {
      // Envoyez les données au backend à cette étape
      console.log('Formulaire soumis:', this.contactForm.value);

      // Afficher le message de succès
      this.messageService.add({
        severity: 'success',
        summary: 'Succès',
        detail: 'Demande de contact envoyée avec succès'
      });

      // Réinitialiser le formulaire
      this.contactForm.reset();
    }
  }
}
