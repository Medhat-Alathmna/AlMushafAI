import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Navigation, Pagination, Zoom, Keyboard } from 'swiper/modules';

import { ActionModalComponent } from 'src/app/components/action-modal/action-modal.component';
import { TranslateModule } from '@ngx-translate/core';
import { NotesService } from 'src/app/services/notes.service';
import { Audio as AudioService } from 'src/app/services/audio.service';
import { QuranService } from 'src/app/services/quran..service';
import { addIcons } from 'ionicons';
import {
  readerOutline,
  bookOutline,
  optionsOutline,
  bookmarkOutline,
  informationCircleOutline,
  chevronBackOutline,
  libraryOutline,
  play,
  square,
  stop,
  mic,
  checkmarkDoneOutline,
} from 'ionicons/icons';

@Component({
  standalone: true,
  selector: 'app-mushaf-viewer',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './mushaf-viewer.page.html',
  styleUrls: ['./mushaf-viewer.page.scss'],
  imports: [IonicModule, CommonModule, ActionModalComponent, TranslateModule],
})
export class MushafViewerPage implements OnInit {
  pages: string[] = [];
  currentPage = 1;
  totalPages = 604;
  showBasmala = true;

  surahId!: number;
  surahName = '';
  startPage = 1;
  endPage = 1;
  viewMode: 'image' | 'text' = 'text';
  ayat: { index: string; text: string }[] = [];

  // Swiper modules
  Navigation = Navigation;
  Pagination = Pagination;
  Zoom = Zoom;
  Keyboard = Keyboard;

  private readonly AYAT_LEN_LIMIT = 400;
  textPages: { ayat: { index: string; text: string }[] }[] = [];

  // UI state
  isRecording = false;
  isModalOpen = false;
  modalTitle = '';
  modalBody = '';
  mistakesMap: Record<string, boolean> = {};
  currentAyah: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private quranService: QuranService,
    private audio: AudioService,
    private notes: NotesService,
  ) {
    addIcons({
      readerOutline,
      bookOutline,
      optionsOutline,
      bookmarkOutline,
      informationCircleOutline,
      chevronBackOutline,
      libraryOutline,
      play,
      square,
      stop,
      mic,
      checkmarkDoneOutline,
    });
  }

  async ngOnInit() {
    this.surahId = Number(this.route.snapshot.paramMap.get('id'));
    const surah: any = await this.quranService.getSurahByNumber(this.surahId);

    if (surah) {
      this.surahName = surah.titleAr || surah.title || surah.name || '';
      this.ayat = Array.isArray(surah.ayat) ? surah.ayat : [];
      this.showBasmala = this.surahId !== 9;
    }

    this.splitAyatIntoPages();
    await this.loadAccuratePageRange();
    const firstAyah = this.textPages?.[0]?.ayat?.[0]?.index;
    if (firstAyah) this.currentAyah = String(firstAyah);
  }

  private splitAyatIntoPages() {
    const pages: any[] = [];
    let current: any[] = [];
    let len = 0;

    for (const a of this.ayat) {
      const l = (a?.text || '').length;
      if (len + l > this.AYAT_LEN_LIMIT && current.length) {
        pages.push({ ayat: current });
        current = [];
        len = 0;
      }
      current.push(a);
      len += l;
    }
    if (current.length) pages.push({ ayat: current });
    this.textPages = pages;
  }

  private async loadAccuratePageRange() {
    try {
      const res = await fetch('assets/quran-data/surah-list.json');
      if (!res.ok) throw new Error('surah-list not found');
      const list: any[] = await res.json();
      const idx = this.surahId.toString().padStart(3, '0');

      const sorted = list.slice().sort((a, b) => Number(a.index) - Number(b.index));
      const currentIndex = sorted.findIndex((s) => s.index === idx);
      const current = currentIndex >= 0 ? sorted[currentIndex] : null;
      const next = currentIndex >= 0 ? sorted[currentIndex + 1] : null;

      const start = Number((current as any)?.pageStart ?? (current as any)?.pages ?? 1);
      const explicitEnd = (current as any)?.pageEnd;
      const count = (current as any)?.pageCount;

      let end: number;
      if (explicitEnd != null) end = Number(explicitEnd);
      else if (count != null) end = start + Number(count) - 1;
      else if (next) end = Number((next as any)?.pageStart ?? (next as any)?.pages) - 1;
      else end = this.totalPages;

      this.startPage = Math.max(1, Math.min(this.totalPages, start));
      this.endPage = Math.max(this.startPage, Math.min(this.totalPages, end));

      const length = Math.max(0, this.endPage - this.startPage + 1);
      this.pages = Array.from({ length }, (_, i) => (this.startPage + i).toString().padStart(3, '0'));
    } catch {
      this.startPage = 1;
      this.endPage = Math.min(this.startPage, this.totalPages);
      this.pages = [this.startPage.toString().padStart(3, '0')];
    }
  }

  onSlideChange(swiper: any) {
    this.currentPage = swiper.activeIndex + 1;
  }

  getImageSrc(page: string | number): string {
    const name = Number(page).toString().padStart(3, '0');
    return `assets/quran-pages/${name}.png`;
  }

  trackByIndex(index: number) { return index; }

  onModeChange(ev: any) {
    this.viewMode = ev?.detail?.value === 'text' ? 'text' : 'image';
  }

  openModal(kind: string) {
    this.isModalOpen = true;
    if (kind === 'settings') {
      this.modalTitle = 'Settings';
      this.modalBody = '<p>Display options will be here.</p>';
    } else if (kind === 'bookmark') {
      this.modalTitle = 'Bookmark';
      this.modalBody = '<p>Bookmark feature coming soon.</p>';
    } else {
      this.modalTitle = 'Surah Info';
      this.modalBody = `<p>Surah: ${this.surahName || this.surahId}</p><p>Pages: ${this.startPage} - ${this.endPage}</p>`;
    }
  }

  async onRecordToggle() {
    try {
      if (!this.isRecording) {
        await this.audio.startRecording();
        this.isRecording = true;
      } else {
        await this.onAyahComplete();
      }
    } catch {
      this.isRecording = false;
    }
  }

  async onStop() {
    if (!this.isRecording) return;
    try {
      await this.audio.stopAndTranscribe();
    } catch {
      // ignore stop errors
    } finally {
      this.isRecording = false;
    }
  }

  async onAyahComplete() {
    try {
      const text = await this.audio.stopAndTranscribe();
      this.isRecording = false;
      const currentIdx = this.currentAyah || this.textPages?.[0]?.ayat?.[0]?.index;
      if (text && currentIdx) {
        const ayah = this.ayat.find(a => String(a.index) === String(currentIdx));
        if (ayah) {
          const ok = this.isTranscriptMatchingAyah(text, ayah.text || '');
          this.mistakesMap[String(ayah.index)] = !ok;
          if (!ok) {
            this.notes.addMistake({
              surahId: this.surahId,
              ayahIndex: String(ayah.index),
              ayahText: ayah.text,
              spokenText: text,
            });
          }
        }
      }
      const next = this.findNextAyahIndex(String(currentIdx ?? ''));
      if (next) this.currentAyah = next;
    } catch {
      this.isRecording = false;
    }
  }

  isMistake(idx: string) { return !!this.mistakesMap[String(idx)]; }

  isActiveAyah(idx: string) {
    return String(idx) === this.currentAyah;
  }

  setActiveAyah(idx: string) {
    this.currentAyah = String(idx);
  }

  onTextSlideChange(ev: any) {
    const pageIdx = (ev && ev.activeIndex !== undefined)
      ? ev.activeIndex
      : (ev?.target?.swiper?.activeIndex ?? 0);
    const first = this.textPages?.[pageIdx]?.ayat?.[0]?.index;
    if (first) this.currentAyah = String(first);
  }

  private analyzeTranscript(text: string) {
    const nt = this.normalizeArabic(text);
    for (const a of this.ayat) {
      const na = this.normalizeArabic(a.text || '');
      const probe = na.slice(0, Math.max(10, Math.floor(na.length * 0.4)));
      const ok = probe ? nt.includes(probe) : true;
      this.mistakesMap[a.index] = !ok;
    }
  }

  private isTranscriptMatchingAyah(transcript: string, ayahText: string): boolean {
    const nt = this.normalizeArabic(transcript);
    const na = this.normalizeArabic(ayahText || '');
    const probe = na.slice(0, Math.max(10, Math.floor(na.length * 0.4)));
    return probe ? nt.includes(probe) : true;
  }

  private findNextAyahIndex(currentIdx: string): string | null {
    const arr = this.ayat || [];
    const i = arr.findIndex(a => String(a.index) === String(currentIdx));
    if (i >= 0 && i + 1 < arr.length) return String(arr[i + 1].index);
    return null;
  }

  private normalizeArabic(s: string): string {
    try {
      return (s || '')
        .replace(/[\u0610-\u061A\u064B-\u065F\u06D6-\u06ED]/g, '')
        .replace(/[\u06F0-\u06F9]/g, d => String.fromCharCode(d.charCodeAt(0) - 0x06F0 + 0x30))
        .replace(/[\u0660-\u0669]/g, d => String.fromCharCode(d.charCodeAt(0) - 0x0660 + 0x30))
        .replace(/[^\p{L}\p{N}\s]/gu, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    } catch { return s || ''; }
  }
   onPlay() {
    (this.audio as any).playLast?.();
  }
}



