import { TestBed } from '@angular/core/testing';

import { ContentManagement } from './content-management';

describe('ContentManagement', () => {
  let service: ContentManagement;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ContentManagement);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
