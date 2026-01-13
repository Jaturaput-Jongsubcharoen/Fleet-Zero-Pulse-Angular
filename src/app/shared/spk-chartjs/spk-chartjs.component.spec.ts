import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpkChartjsComponent } from './spk-chartjs.component';

describe('SpkChartjsComponent', () => {
  let component: SpkChartjsComponent;
  let fixture: ComponentFixture<SpkChartjsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpkChartjsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpkChartjsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
