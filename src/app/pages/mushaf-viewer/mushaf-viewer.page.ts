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

  // وحدات Swiper الحديثة
  Navigation = Navigation;
  Pagination = Pagination;
  Zoom = Zoom;
  Keyboard = Keyboard;

  constructor(private route: ActivatedRoute, private quranService: QuranService) {}

  async ngOnInit() {
    this.surahId = Number(this.route.snapshot.paramMap.get('id'));

    // تحميل بيانات السورة من الخدمة
    const surah:any = await this.quranService.getSurahByNumber(this.surahId);

    if (surah) {
      this.surahName = surah.titleAr || surah.name || '';
      this.startPage = Number(surah.pages) || 1;

      // ✳️ تقدير عدد الصفحات بناءً على عدد الآيات (كل 15 آية ≈ صفحة)
      const estimatedPageCount = Math.ceil((surah.ayat?.length || 15) / 15);
      this.endPage = Math.min(this.startPage + estimatedPageCount - 1, this.totalPages);

      // إنشاء الصفحات المطلوبة فقط
      this.pages = Array.from({ length: this.endPage - this.startPage + 1 }, (_, i) =>
        (this.startPage + i).toString().padStart(3, '0')
      );
    }
  }

  onSlideChange(swiper: any) {
    this.currentPage = swiper.activeIndex + 1;
  }
}
