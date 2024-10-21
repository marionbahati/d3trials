import { TestBed } from '@angular/core/testing';

import { GraphdataService } from './graphdata.service';

describe('GraphdataService', () => {
  let service: GraphdataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GraphdataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
