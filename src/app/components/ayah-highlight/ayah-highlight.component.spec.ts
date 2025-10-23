import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AyahHighlightComponent } from './ayah-highlight.component';

describe('AyahHighlightComponent', () => {
  let component: AyahHighlightComponent;
  let fixture: ComponentFixture<AyahHighlightComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [AyahHighlightComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AyahHighlightComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
