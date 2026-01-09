import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FacilitySearchResultComponent } from './facility-search-result.component';

describe('FacilitySearchResultComponent', () => {
  let component: FacilitySearchResultComponent;
  let fixture: ComponentFixture<FacilitySearchResultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FacilitySearchResultComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FacilitySearchResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
