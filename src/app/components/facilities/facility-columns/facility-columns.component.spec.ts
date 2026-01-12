import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FacilityColumnsComponent } from './facility-columns.component';

describe('FacilityColumnsComponent', () => {
  let component: FacilityColumnsComponent;
  let fixture: ComponentFixture<FacilityColumnsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FacilityColumnsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FacilityColumnsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
