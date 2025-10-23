import { TestBed } from '@angular/core/testing';

import { Quran } from './quran..service';

describe('Quran', () => {
  let service: Quran;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Quran);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
