import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SurahListPage } from './surah-list.page';

describe('SurahListPage', () => {
  let component: SurahListPage;
  let fixture: ComponentFixture<SurahListPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SurahListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
