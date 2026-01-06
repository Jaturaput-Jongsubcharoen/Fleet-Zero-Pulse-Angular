import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusSnapshotComponent } from './bus-snapshot.component';

describe('BusSnapshotComponent', () => {
  let component: BusSnapshotComponent;
  let fixture: ComponentFixture<BusSnapshotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BusSnapshotComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BusSnapshotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
