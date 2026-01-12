import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FacilityBayComponent } from './facility-bay.component';

describe('FacilityBayComponent', () => {
  let component: FacilityBayComponent;
  let fixture: ComponentFixture<FacilityBayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FacilityBayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FacilityBayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
