import { Injectable } from '@angular/core';

type SurahMeta = {
  index: number;
  title: string;
  titleAr?: string;
  place?: string;
  type?: string;
  count: number;
  pages: number; // start page
};

type Ayah = { index: string; text: string };

type SurahFile = {
  index: string | number;
  name?: string;
  title?: string;
  titleAr?: string;
  ayat?: Ayah[];
  pages?: string | number;
};

@Injectable({ providedIn: 'root' })
export class QuranService {
  private readonly SURAH_DIR = 'assets/quran-data';
  private cacheMeta: SurahMeta[] = [];
  private cacheSurahs: Map<number, SurahFile> = new Map();

  // Load consolidated metadata if available; fallback to per-file probing
  async getAllSurahs(): Promise<SurahMeta[]> {
    if (this.cacheMeta.length) return this.cacheMeta;

    try {
      const res = await fetch(`${this.SURAH_DIR}/surah-list.json`);
      if (res.ok) {
        const list = await res.json();
        const mapped: SurahMeta[] = (Array.isArray(list) ? list : []).map((d: any) => ({
          index: Number(d.index),
          title: d.title ?? '',
          // tolerate common misspellings/casing for Arabic title
          titleAr: d.titleAr ?? d.titlarAR ?? d.titlarAr ?? d.titleAR ?? d.TitleAr ?? '',
          type: d.type ?? '',
          place: d.place ?? '',
          count: Number(d.count ?? 0),
          // start page can be in pages or pageStart
          pages: Number(d.pageStart ?? d.pages ?? 1),
        }));
        this.cacheMeta = mapped.sort((a, b) => a.index - b.index);
        if (this.cacheMeta.length) return this.cacheMeta;
      }
    } catch {
      // ignore and proceed to fallback
    }

    const ids = Array.from({ length: 114 }, (_, i) => i + 1);
    const results = await Promise.all(
      ids.map(async (id) => {
        const file = id.toString().padStart(3, '0');
        try {
          const res = await fetch(`${this.SURAH_DIR}/${file}.json`);
          if (!res.ok) throw new Error(res.statusText);
          const data: any = await res.json();
          return {
            index: Number(data.index ?? id),
            title: data.title ?? '',
            titleAr: data.titleAr ?? data.name ?? '',
            type: data.type ?? '',
            place: data.place ?? '',
            count: Number(data.count ?? (data.ayat?.length ?? 0)),
            pages: Number(data.pages ?? 1),
          } as SurahMeta;
        } catch {
          return null;
        }
      })
    );

    this.cacheMeta = results.filter((x): x is SurahMeta => x !== null);
    return this.cacheMeta;
  }

  // Load a single surah file by number
  async getSurahByNumber(id: number): Promise<SurahFile | null> {
    if (this.cacheSurahs.has(id)) return this.cacheSurahs.get(id)!;
    const file = id.toString().padStart(3, '0');
    try {
      const res = await fetch(`${this.SURAH_DIR}/${file}.json`);
      if (!res.ok) throw new Error(res.statusText);
      const data = (await res.json()) as SurahFile;
      this.cacheSurahs.set(id, data);
      return data;
    } catch {
      console.error('Failed to load surah file', file);
      return null;
    }
  }
  
}
