import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {  IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonTextarea, IonList, IonItem, IonLabel, IonProgressBar } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Audio } from 'src/app/services/audio.service';
import { Ai } from 'src/app/services/ai.service';

@Component({
  standalone: true,
  schemas:[CUSTOM_ELEMENTS_SCHEMA],
  selector: 'app-ai-reader',
  templateUrl: './ai-reader.page.html',
  styleUrls: ['./ai-reader.page.scss'],
  imports: [CommonModule, FormsModule, IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonTextarea, IonList, IonItem, IonLabel, IonProgressBar]
})
export class AiReaderPage {
  recording = false;
  referenceText = '';
  result: any = null;
  spokenText = '';

  constructor(private audio: Audio, private ai: Ai) {}

  async toggleRecording() {
    if (!this.recording) {
      this.recording = true;
      await this.audio.startRecording();
    } else {
      this.recording = false;
      this.spokenText = await this.audio.stopAndTranscribe();
    }
  }

  async analyzeRecitation() {
    if (!this.referenceText || !this.spokenText) return;
    this.result = await this.ai.compareRecitation(this.referenceText, this.spokenText);
  }
}
