import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { QuranService } from 'src/app/services/quran..service';
import { TranslateModule } from '@ngx-translate/core';
import { addIcons } from 'ionicons';
import { libraryOutline ,bookOutline,chevronBackOutline} from 'ionicons/icons';
@Component({
  selector: 'app-surah-list',
  standalone: true,
  templateUrl: './surah-list.page.html',
  styleUrls: ['./surah-list.page.scss'],
  imports: [IonicModule, CommonModule, RouterModule, TranslateModule],
})
export class SurahListPage implements OnInit {
  surahs: any[] = [];

  constructor(private quranService: QuranService) {
    addIcons({ libraryOutline, bookOutline, chevronBackOutline });
  }

  async ngOnInit() {
    this.surahs = await this.quranService.getAllSurahs();
  }

  trackById(_: number, s: any) {
    return s.index;
  }
}

