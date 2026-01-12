import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';

import {
  CATEGORIES,
  CategoryId,
  BusDetails,
  FACILITIES,
  FacilityId,
  Board,
} from '../../data/fleet-store';
import { FleetService } from '../../data/fleet.service';

@Component({
  selector: 'app-station',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './station.component.html',
  styleUrl: './station.component.scss',
})
export class StationComponent {
  categories = CATEGORIES;
  facilities = FACILITIES;

  facilityId: FacilityId = 'Miller BRT';
  facilityName = 'Miller BRT';

  // Always hold a real Board object
  boardData: Board = this.createEmptyBoard();

  // animation states
  isSheetOpen = false;
  isSheetVisible = false;

  // bay options for maintenance/long_term (facility-controlled)
  bayOptions: number[] = [];

  // error message for edit validation
  editErrorMsg = '';

  editing:
    | {
        fromCatId: CategoryId;
        toCatId: CategoryId;
        bus: BusDetails; // copy for editing
      }
    | null = null;

  // Map old route slugs like /station/facility_a to your FacilityId values
  private readonly ROUTE_TO_FACILITY: Record<string, FacilityId> = {
    facility_a: 'Miller BRT',
    facility_b: 'Miller SE',
    tok_north: 'TOK North',
    tok_west: 'TOK West',
    // MOB1/MOB2 removed from the domain, so no mapping needed anymore
  };

  constructor(private route: ActivatedRoute, private fleet: FleetService) {
    this.route.paramMap.subscribe((params) => {
      const rawParam = (params.get('facilityId') ?? 'Miller BRT').trim();

      // 1) Convert route param to a valid FacilityId
      const mapped = this.ROUTE_TO_FACILITY[rawParam];
      const isDirectFacilityId = this.facilities.some(
        (f) => f.id === (rawParam as FacilityId)
      );

      this.facilityId =
        mapped ?? (isDirectFacilityId ? (rawParam as FacilityId) : 'Miller BRT');

      // 2) Set display name
      this.facilityName =
        this.facilities.find((f) => f.id === this.facilityId)?.name ??
        this.facilityId;

      // 3) Always set a safe board
      this.boardData =
        this.fleet.getBoard(this.facilityId) ?? this.createEmptyBoard();

      // reset editor state when switching facility
      this.isSheetOpen = false;
      this.isSheetVisible = false;
      this.editing = null;
      this.bayOptions = [];
      this.editErrorMsg = '';
    });
  }

  // Expose board for the template
  get board(): Board {
    return this.boardData;
  }

  startEdit(catId: CategoryId, bus: BusDetails) {
    this.editing = { fromCatId: catId, toCatId: catId, bus: { ...bus } };

    this.editErrorMsg = '';
    this.refreshBayOptions();

    this.isSheetOpen = true;
    requestAnimationFrame(() => {
      this.isSheetVisible = true;
    });
  }

  cancelEdit() {
    this.isSheetVisible = false;

    setTimeout(() => {
      this.isSheetOpen = false;
      this.editing = null;
      this.bayOptions = [];
      this.editErrorMsg = '';
    }, 200);
  }

  onEditCategoryChange() {
    if (!this.editing) return;

    const toCat = this.editing.toCatId;

    if (!this.needsBay(toCat)) {
      delete this.editing.bus.bay;
    }

    this.editErrorMsg = '';
    this.refreshBayOptions();
  }

  private refreshBayOptions() {
    if (!this.editing) {
      this.bayOptions = [];
      return;
    }

    const toCat = this.editing.toCatId;

    if (toCat === 'maintenance' || toCat === 'long_term') {
      this.bayOptions = this.fleet.getAvailableBays(
        this.facilityId,
        this.editing.bus.id
      );

      if (
        typeof this.editing.bus.bay === 'number' &&
        !this.bayOptions.includes(this.editing.bus.bay)
      ) {
        delete this.editing.bus.bay;
      }
    } else {
      this.bayOptions = [];
    }
  }

  private categoryLabel(catId: CategoryId): string {
    return this.categories.find((c) => c.id === catId)?.label ?? '';
  }

  private needsBay(catId: CategoryId): boolean {
    // third_party is NOT bay-required anymore
    return catId === 'maintenance' || catId === 'long_term';
  }

  saveEdit() {
    if (!this.editing) return;

    const { fromCatId, toCatId, bus } = this.editing;

    // validation for bay
    if (this.needsBay(toCatId)) {
      const chosen = bus.bay;

      if (typeof chosen !== 'number' || Number.isNaN(chosen)) {
        this.editErrorMsg = 'Bay number is required for this category.';
        return;
      }

      if (!this.bayOptions.includes(chosen)) {
        this.editErrorMsg =
          'That bay is not available. Please choose another.';
        return;
      }
    } else {
      delete bus.bay;
    }

    const toLabel = this.categoryLabel(toCatId) || bus.status;

    // 1) update details in original category
    this.fleet.updateBus(this.facilityId, fromCatId, bus.id, {
      status: toLabel,
      lastService: bus.lastService,
      notes: bus.notes,
      bay: this.needsBay(toCatId) ? bus.bay : undefined,
    });

    // 2) move bus if category changed
    if (fromCatId !== toCatId) {
      const res = this.fleet.moveBusCategory(
        this.facilityId,
        fromCatId,
        toCatId,
        bus.id,
        bus.bay
      );

      if (!res.ok) {
        if (res.reason === 'bay_taken')
          this.editErrorMsg = 'That bay is already taken.';
        else if (res.reason === 'bay_invalid')
          this.editErrorMsg =
            'That bay is not allowed for this facility.';
        else this.editErrorMsg = 'Bay number is required.';
        return;
      }

      // refresh local board reference
      this.boardData =
        this.fleet.getBoard(this.facilityId) ?? this.createEmptyBoard();
    }

    this.cancelEdit();
  }

  private createEmptyBoard(): Board {
    const empty = {} as Board;
    for (const c of this.categories) {
      empty[c.id] = [];
    }
    return empty;
  }
}