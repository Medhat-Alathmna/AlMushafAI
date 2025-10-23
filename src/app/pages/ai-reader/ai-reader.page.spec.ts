import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AiReaderPage } from './ai-reader.page';

describe('AiReaderPage', () => {
  let component: AiReaderPage;
  let fixture: ComponentFixture<AiReaderPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AiReaderPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
