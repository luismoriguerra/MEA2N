/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ZonesService } from './zones.service';

describe('Service: Zones', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ZonesService]
    });
  });

  it('should ...', inject([ZonesService], (service: ZonesService) => {
    expect(service).toBeTruthy();
  }));
});