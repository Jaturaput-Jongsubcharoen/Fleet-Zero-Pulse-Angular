import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  CATEGORIES,
  CategoryId,
  FacilityConfig,
  FacilityId,
} from '../../../data/fleet-store';
import { FleetService } from '../../../data/fleet.service';

// same union as in vehicle-management
type SelectedId = FacilityId | '__ALL__';

type EditableFacilityInfo = {
  address: string;
  coordinates: string;
  garageImageUrl: string;
  mechanics: number | null;
  apprentices: number | null;
  supportStaff: number | null;
  maintenanceBays: number | null;
  facilityScore: number | null;
  lastAuditDate: string | null;
};

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

  // categories are only for status breakdown
  readonly categories = CATEGORIES;

  // editable (user-controlled) fields per facility
  editableInfoByFacility: Record<FacilityId, EditableFacilityInfo> = {} as any;

  // which field is currently in "edit" mode
  editing: { facilityId: FacilityId; field: EditableFieldKey } | null = null;

  // non-editable EV share – later this can come from Excel / backend
  private readonly EV_SHARE: Record<FacilityId, number> = {
    'Miller BRT': 40,
    'Miller SE': 55,
    'TOK North': 35,
    'TOK West': 60,
  };

  constructor(private fleet: FleetService) {}

  ngOnInit() {
    // initialise editable state for each facility (placeholder defaults)
    for (const f of this.facilities) {
      if (!this.editableInfoByFacility[f.id]) {
        this.editableInfoByFacility[f.id] = {
          address: `${f.name} yard address`,
          coordinates: '',
          garageImageUrl: f.image,
          mechanics: null,
          apprentices: null,
          supportStaff: null,
          maintenanceBays: null,
          facilityScore: null,
          lastAuditDate: null,
        };
      }
    }
  }

  get isAllView(): boolean {
    return this.selectedFacilityId === this.allFacilitiesId;
  }

  // for "All Facilities" we show all; otherwise just the selected one
  get facilitiesToShow(): readonly FacilityConfig[] {
    if (this.isAllView) return this.facilities;
    const fac = this.facilities.find((f) => f.id === this.selectedFacilityId);
    return fac ? [fac] : [];
  }

  getInfo(fid: FacilityId): EditableFacilityInfo {
    return this.editableInfoByFacility[fid];
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
    return this.EV_SHARE[fid] ?? 0;
  }

  // status breakdown for “percentage of status of the buses”
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

    // filter out nulls with a proper type predicate
    return rows.filter((x): x is StatusSegment => x !== null);
  }

  // placeholder: later you can swap this out with real model data from Excel
  dummyModelBreakdown(_fid: FacilityId): { label: string; pct: number }[] {
    return [
      { label: '40ft Diesel', pct: 40 },
      { label: '60ft Diesel', pct: 20 },
      { label: '40ft Electric', pct: 25 },
      { label: 'Other', pct: 15 },
    ];
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
      // Save -> just close edit mode for now
      this.editing = null;
    } else {
      this.editing = { facilityId: fid, field };
    }
  }

  trackByFacilityId = (_: number, f: FacilityConfig) => f.id;
  trackByStatusLabel = (_: number, s: { label: string }) => s.label;
}