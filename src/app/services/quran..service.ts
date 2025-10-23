import { Injectable } from '@angular/core';

type SurahMeta = {
  index: string|any;
  title: string;
  titleAr: string;
  place: string;
  type: string;
  count: number;
  pages: string;
};

type Ayah = { index: string; text: string };

type SurahFile = {
  index: string;
  name: string;
  title: string;
  titleAr: string;
  ayat: Ayah[];
};

@Injectable({ providedIn: 'root' })
export class QuranService {
  private readonly SURAH_DIR = 'assets/quran-data';
  private cacheMeta: SurahMeta[] = [];
  private cacheSurahs: Map<number, SurahFile> = new Map();

  /** تحميل قائمة السور من ملفات 001.json..114.json */
  async getAllSurahs(): Promise<SurahMeta[]> {
    if (this.cacheMeta.length) return this.cacheMeta;

    const ids = Array.from({ length: 114 }, (_, i) => i + 1);
    const results = await Promise.all(
      ids.map(async (id) => {
        const file = id.toString().padStart(3, '0');
        try {
          const res = await fetch(`${this.SURAH_DIR}/${file}.json`);
          if (!res.ok) throw new Error(res.statusText);
          const data = await res.json();
          return {
            index: Number(data.index),
            title: data.title,
            titleAr: data.titleAr,
            type: data.type,
            place: data.place,
            count: data.count,
            pages: data.pages,
          } as SurahMeta;
        } catch {
          return null;
        }
      })
    );

    this.cacheMeta = results.filter((x): x is SurahMeta => x !== null);
    return this.cacheMeta;
  }

  /** تحميل سورة معينة من ملفها (مع الآيات) */
  async getSurahByNumber(id: number): Promise<SurahFile | null> {
    if (this.cacheSurahs.has(id)) return this.cacheSurahs.get(id)!;
    const file = id.toString().padStart(3, '0');
    try {
      const res = await fetch(`${this.SURAH_DIR}/${file}.json`);
      if (!res.ok) throw new Error(res.statusText);
      const data = await res.json();
      this.cacheSurahs.set(id, data);
      return data as SurahFile;
    } catch {
      console.error('❌ فشل تحميل السورة', file);
      return null;
    }
  }
}
