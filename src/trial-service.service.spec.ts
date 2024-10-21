import { TestBed } from '@angular/core/testing';

import { TrialServiceService } from './trial-service.service';

describe('TrialServiceService', () => {
  let service: TrialServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TrialServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
