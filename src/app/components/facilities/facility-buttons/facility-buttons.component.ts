import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FacilityConfig, FacilityId } from '../../../data/fleet-store';

type SelectedId = FacilityId | '__ALL__';

@Component({
  selector: 'app-facility-buttons',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './facility-buttons.component.html',
  styleUrl: './facility-buttons.component.scss',
})
export class FacilityButtonsComponent {
  @Input() facilities: readonly FacilityConfig[] = [];
  @Input() selectedFacilityId!: SelectedId;
  @Input() allFacilitiesId!: SelectedId;
  @Input() allFacilitiesTotal = 0;
  @Input() facilityTotals: Partial<Record<FacilityId, number>> = {};

  @Output() selectAllFacilities = new EventEmitter<void>();
  @Output() selectFacility = new EventEmitter<FacilityId>();

  onClickAll() {
    this.selectAllFacilities.emit();
  }

  onClickFacility(id: FacilityId) {
    this.selectFacility.emit(id);
  }

  trackByFacilityId = (_: number, f: FacilityConfig) => f.id;

  getFacilityTotalById(id: FacilityId): number {
    return this.facilityTotals[id] ?? 0;
  }
}
