import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FacilityStripsComponent } from './facility-strips.component';

describe('FacilityStripsComponent', () => {
  let component: FacilityStripsComponent;
  let fixture: ComponentFixture<FacilityStripsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FacilityStripsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FacilityStripsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
