import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { VoiceRecorder } from 'capacitor-voice-recorder';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class Audio {
  private mediaRecorder!: MediaRecorder;
  private chunks: BlobPart[] = [];
  private stream!: MediaStream;
  private usingCapacitor = false;
  private lastUrl: string | null = null;
  private player?: HTMLAudioElement;

  constructor() {
    this.usingCapacitor = Capacitor.isNativePlatform();
  }

  async startRecording() {
    if (this.usingCapacitor) {
      const perm = await VoiceRecorder.requestAudioRecordingPermission();
      if (!perm.value) throw new Error('لم يتم منح إذن الميكروفون');
      await VoiceRecorder.startRecording();
    } else {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(this.stream);
      this.chunks = [];
      this.mediaRecorder.ondataavailable = e => this.chunks.push(e.data);
      this.mediaRecorder.start();
    }
  }

  async stopAndTranscribe(): Promise<string> {
    if (this.usingCapacitor) {
      const result = await VoiceRecorder.stopRecording();
      const base64 = result.value.recordDataBase64;
      if (!base64) throw new Error('Failed to get recording data');
      const audioBlob = this.base64ToBlob(base64, 'audio/wav');
      this.setLastUrl(audioBlob);
      return await this.sendToWhisper(audioBlob);
    } else {
      return new Promise(resolve => {
        this.mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(this.chunks, { type: 'audio/webm' });
          this.setLastUrl(audioBlob);
          const text = await this.sendToWhisper(audioBlob);
          resolve(text);
        };
        this.mediaRecorder.stop();
        this.stream.getTracks().forEach(t => t.stop());
      });
    }
  }

  playLast() {
    if (!this.lastUrl) return;
    if (!this.player) this.player = document.createElement('audio');
    this.player.src = this.lastUrl;
    this.player.play();
  }

  private setLastUrl(blob: Blob) {
    try {
      if (this.lastUrl) URL.revokeObjectURL(this.lastUrl);
      this.lastUrl = URL.createObjectURL(blob);
    } catch {}
  }

  private async sendToWhisper(audioBlob: Blob): Promise<string> {
    const formData = new FormData();
    formData.append('file', audioBlob, 'recitation.webm');
    formData.append('model', 'whisper-1');
    formData.append('language', 'ar');
    formData.append('max_tokens', '50');

    const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${environment.openaiApiKey}` },
      body: formData
    });

    const data = await res.json();
    return data.text || '';
  }

  private base64ToBlob(base64: string, mime: string): Blob {
    const byteChars = atob(base64);
    const byteNums = new Array(byteChars.length);
    for (let i = 0; i < byteChars.length; i++) byteNums[i] = byteChars.charCodeAt(i);
    const byteArray = new Uint8Array(byteNums);
    return new Blob([byteArray], { type: mime });
  }
}
