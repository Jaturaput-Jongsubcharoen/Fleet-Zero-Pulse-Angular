import { TestBed } from '@angular/core/testing';

import { FacilityMetaService } from './facility-meta.service';

describe('FacilityMetaService', () => {
  let service: FacilityMetaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FacilityMetaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
