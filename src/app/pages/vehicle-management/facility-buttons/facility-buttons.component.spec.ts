import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FacilityButtonsComponent } from './facility-buttons.component';

describe('FacilityButtonsComponent', () => {
  let component: FacilityButtonsComponent;
  let fixture: ComponentFixture<FacilityButtonsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FacilityButtonsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FacilityButtonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
