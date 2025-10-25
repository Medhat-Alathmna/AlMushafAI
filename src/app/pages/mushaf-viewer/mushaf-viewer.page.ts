import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Navigation, Pagination, Zoom, Keyboard } from 'swiper/modules';
import { QuranService } from 'src/app/services/quran..service';
import { Ai } from 'src/app/services/ai.service';
import { Audio } from 'src/app/services/audio.service';
import { AlertController } from '@ionic/angular';
@Component({
  standalone: true,
  selector: 'app-mushaf-viewer',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './mushaf-viewer.page.html',
  styleUrls: ['./mushaf-viewer.page.scss'],
  imports: [IonicModule, CommonModule],
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
  viewMode: 'image' | 'text' = 'image';
  ayat: { index: string; text: string }[] = [];

  // Swiper modules
  Navigation = Navigation;
  Pagination = Pagination;
  Zoom = Zoom;
  Keyboard = Keyboard;

constructor(
    private quranService: QuranService,
    private route: ActivatedRoute,
    private audio: Audio,
    private ai: Ai,
    private alertCtrl: AlertController
  ) {}
  private AYAT_PER_PAGE = 12; 
textPages: { ayat: { index: string; text: string }[] }[] = [];
  recording = false;

async ngOnInit() {
  this.surahId = Number(this.route.snapshot.paramMap.get('id'));
  const surah: any = await this.quranService.getSurahByNumber(this.surahId);
  if (surah) {
    this.surahName = surah.titleAr || surah.title || surah.name || '';
    this.ayat = Array.isArray(surah.ayat) ? surah.ayat : [];
    this.showBasmala = this.surahId !== 9;
  }

  this.splitAyatIntoPages(); // 👈 تقسيم الآيات إلى صفحات
  await this.loadAccuratePageRange();
}
async toggleRecording() {
    if (!this.recording) {
      this.recording = true;
      await this.audio.startRecording();
    } else {
      this.recording = false;
      const spokenText = await this.audio.stopAndTranscribe();

      // دمج جميع النصوص القرآنية الحالية من الصفحة
      const quranText = this.ayat.map(a => a.text).join(' ');

      const result = await this.ai.compareRecitation(quranText, spokenText);

      const alert = await this.alertCtrl.create({
        header: 'نتيجة التلاوة',
        message: `
          <ion-progress-bar value="${result.accuracy}"></ion-progress-bar>
          <p style="margin-top:10px">${result.summary}</p>
          <p><b>عدد الأخطاء:</b> ${result.mistakes?.length || 0}</p>
        `,
        buttons: ['حسنًا'],
      });

      await alert.present();
    }
  }
// تقسيم الآيات إلى صفحات بدون كسر الآية
private splitAyatIntoPages() {
  const pages: any[] = [];
  let currentPage: any[] = [];
  let lengthCounter = 0;

  for (const a of this.ayat) {
    const textLength = a.text.length;

    if (lengthCounter + textLength > 400 && currentPage.length > 0) {
      // إذا تجاوزنا الحد التقريبي للطول نبدأ صفحة جديدة
      pages.push({ ayat: currentPage });
      currentPage = [];
      lengthCounter = 0;
    }

    currentPage.push(a);
    lengthCounter += textLength;
  }

  if (currentPage.length) pages.push({ ayat: currentPage });
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
      if (explicitEnd != null) {
        end = Number(explicitEnd);
      } else if (count != null) {
        end = start + Number(count) - 1;
      } else if (next) {
        end = Number((next as any)?.pageStart ?? (next as any)?.pages) - 1;
      } else {
        end = this.totalPages;
      }

      this.startPage = Math.max(1, Math.min(this.totalPages, start));
      this.endPage = Math.max(this.startPage, Math.min(this.totalPages, end));

      const length = Math.max(0, this.endPage - this.startPage + 1);
      this.pages = Array.from({ length }, (_, i) => (this.startPage + i).toString().padStart(3, '0'));
    } catch (e) {
      // Fallback to at least one page
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
}












