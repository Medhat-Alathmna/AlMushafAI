import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'surah-list', pathMatch: 'full' },
  {
    path: 'surah-list',
    loadComponent: () =>
      import('./pages/surah-list/surah-list.page').then(m => m.SurahListPage),
  },
  {
    path: 'mushaf-viewer/:id',
    loadComponent: () =>
      import('./pages/mushaf-viewer/mushaf-viewer.page').then(m => m.MushafViewerPage),
  },
];