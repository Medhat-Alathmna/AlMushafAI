import { Injectable } from '@angular/core';

export type MistakeNote = {
  id: string;
  surahId: number;
  ayahIndex: string;
  ayahText: string;
  spokenText?: string;
  createdAt: string; // ISO string
};

@Injectable({ providedIn: 'root' })
export class NotesService {
  private readonly STORAGE_KEY = 'almushaf_notes';

  addMistake(note: Omit<MistakeNote, 'id' | 'createdAt'>) {
    const payload: MistakeNote = {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2),
      createdAt: new Date().toISOString(),
      ...note,
    };
    const all = this.getAll();
    all.unshift(payload);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(all));
  }

  getAll(): MistakeNote[] {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  clear() {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}

