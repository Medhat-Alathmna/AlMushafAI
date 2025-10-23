import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MushafViewerPage } from './mushaf-viewer.page';

describe('MushafViewerPage', () => {
  let component: MushafViewerPage;
  let fixture: ComponentFixture<MushafViewerPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MushafViewerPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
