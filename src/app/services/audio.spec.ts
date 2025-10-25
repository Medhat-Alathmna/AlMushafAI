import { TestBed } from '@angular/core/testing';

import { Audio } from './audio.service';

describe('Audio', () => {
  let service: Audio;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Audio);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
