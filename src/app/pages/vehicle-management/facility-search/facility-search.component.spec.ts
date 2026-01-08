import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FacilitySearchComponent } from './facility-search.component';

describe('FacilitySearchComponent', () => {
  let component: FacilitySearchComponent;
  let fixture: ComponentFixture<FacilitySearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FacilitySearchComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FacilitySearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
