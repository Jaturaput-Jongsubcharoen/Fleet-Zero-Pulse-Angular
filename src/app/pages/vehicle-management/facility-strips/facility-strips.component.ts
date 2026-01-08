import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  CATEGORIES,
  FacilityConfig,
  FacilityId,
} from '../../../data/fleet-store';
import { FleetService } from '../../../data/fleet.service';
import {
  EditableFacilityInfo,
} from '../../../data/facility-meta-store';
import { FacilityMetaService } from '../../../data/facility-meta.service';

import { ChartConfiguration, ChartType } from 'chart.js';
import { SpkChartjsComponent } from '../../../@spk/reusable-charts/spk-chartjs/spk-chartjs.component';

// same union as in vehicle-management
type SelectedId = FacilityId | '__ALL__';

type EditableFieldKey = keyof EditableFacilityInfo;

// ---- status breakdown types (for chart rows) ----
type StatusLabel = (typeof CATEGORIES)[number]['label'];
type StatusSegment = { label: StatusLabel; pct: number };

@Component({
  selector: 'app-facility-strips',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './facility-strips.component.html',
  styleUrl: './facility-strips.component.scss',
})
export class FacilityStripsComponent {
  @Input({ required: true }) facilities: readonly FacilityConfig[] = [];
  @Input({ required: true }) selectedFacilityId!: SelectedId;
  @Input({ required: true }) allFacilitiesId!: SelectedId;

  readonly categories = CATEGORIES;

  // which field is currently in "edit" mode
  editing: { facilityId: FacilityId; field: EditableFieldKey } | null = null;

  constructor(
    private fleet: FleetService,
    private facilityMeta: FacilityMetaService
  ) {}

  get isAllView(): boolean {
    return this.selectedFacilityId === this.allFacilitiesId;
  }

  get facilitiesToShow(): readonly FacilityConfig[] {
    if (this.isAllView) return this.facilities;
    const fac = this.facilities.find((f) => f.id === this.selectedFacilityId);
    return fac ? [fac] : [];
  }

  getInfo(fid: FacilityId): EditableFacilityInfo {
    return this.facilityMeta.getEditableInfo(fid);
  }

  // ---- non-editable calculated metrics ----

  vehiclesAssigned(fid: FacilityId): number {
    const board = this.fleet.getBoard(fid);
    return this.categories.reduce(
      (sum, c) => sum + board[c.id].length,
      0
    );
  }

  percentElectric(fid: FacilityId): number {
    return this.facilityMeta.getEvShare(fid);
  }

  statusBreakdown(fid: FacilityId): StatusSegment[] {
    const board = this.fleet.getBoard(fid);
    const total = this.vehiclesAssigned(fid);
    if (!total) return [];

    const rows: (StatusSegment | null)[] = this.categories.map((c) => {
      const count = board[c.id].length;
      if (!count) return null;
      const pct = Math.round((count / total) * 100);
      return { label: c.label, pct };
    });

    return rows.filter((x): x is StatusSegment => x !== null);
  }

  dummyModelBreakdown(fid: FacilityId) {
    return this.facilityMeta.getModelBreakdown(fid);
  }

  // ---- editing helpers ----

  isEditing(fid: FacilityId, field: EditableFieldKey): boolean {
    return (
      this.editing?.facilityId === fid &&
      this.editing?.field === field
    );
  }

  toggleEdit(fid: FacilityId, field: EditableFieldKey) {
    if (this.isEditing(fid, field)) {
      // for now we just close edit mode; later you can call
      // this.facilityMeta.updateEditableInfo(fid, { ... });
      this.editing = null;
    } else {
      this.editing = { facilityId: fid, field };
    }
  }

  trackByFacilityId = (_: number, f: FacilityConfig) => f.id;
  trackByStatusLabel = (_: number, s: { label: string }) => s.label;
}
