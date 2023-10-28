import { TestBed } from '@angular/core/testing';

import { XmlServiceService } from './xml-service.service';

describe('XmlServiceService', () => {
  let service: XmlServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(XmlServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
