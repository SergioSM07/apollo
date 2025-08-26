import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModuleDetail } from './module-detail';

describe('ModuleDetail', () => {
  let component: ModuleDetail;
  let fixture: ComponentFixture<ModuleDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModuleDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModuleDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
