import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Navigation, Pagination, Zoom, Keyboard } from 'swiper/modules';
import { QuranService } from 'src/app/services/quran..service';

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

  constructor(private route: ActivatedRoute, private quranService: QuranService) {}

  async ngOnInit() {
    this.surahId = Number(this.route.snapshot.paramMap.get('id'));

    // Load surah data (for title), if available
    const surah: any = await this.quranService.getSurahByNumber(this.surahId);
    if (surah) {
      this.surahName = surah.titleAr || surah.title || surah.name || '';
      this.ayat = Array.isArray(surah.ayat) ? surah.ayat : [];
    }

    // Determine accurate page range using surah-list.json
    await this.loadAccuratePageRange();
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

      this.startPage = Number(current?.pages || 1);
      this.endPage = next ? Number(next.pages) - 1 : this.totalPages;

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





