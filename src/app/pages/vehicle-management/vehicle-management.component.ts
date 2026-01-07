import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { FormsModule } from '@angular/forms';

import { BusSnapshotComponent } from '../../components/bus-snapshot/bus-snapshot.component';
import {
  CATEGORIES,
  FACILITIES,
  CategoryId,
  Board,
  BusDetails,
  FacilityId,
} from '../../data/fleet-store';
import { FleetService } from '../../data/fleet.service';

type Facility = { id: FacilityId; name: string };

@Component({
  selector: 'app-vehicle-management',
  standalone: true,
  imports: [CommonModule, DragDropModule, FormsModule, BusSnapshotComponent],
  templateUrl: './vehicle-management.component.html',
  styleUrl: './vehicle-management.component.scss',
})
export class VehicleManagementComponent {
  title = 'Fleet Pulse';
  subtitle = 'Vehicle Management Dashboard';

  readonly facilities = FACILITIES;
  categories = CATEGORIES;

  selectedFacilityId: FacilityId = this.facilities[0].id;

  // Search
  searchQuery = '';
  searchResults: BusDetails[] = [];
  searchMetaById: Record<
    string,
    { categoryId: CategoryId; categoryLabel: string } | undefined
  > = {};

  // Snapshot modal
  selectedBus:
    | (BusDetails & {
        facilityId?: FacilityId;
        statusLabel?: string;
        batteryPct?: number | null;
        alerts?: string[] | null;
      })
    | null = null;

  isSnapshotOpen = false;

  // ---- Bay modal (custom, like your snapshot modal) ----
  isBayModalOpen = false;
  isBayModalVisible = false;

  bayOptions: number[] = [];
  baySelected: number | null = null;

  pendingMove:
    | { busId: string; fromCatId: CategoryId; toCatId: CategoryId; toIndex: number }
    | null = null;

  bayErrorMsg = '';

  constructor(private fleet: FleetService) {}

  // Bus silhouette image depends on selected facility (yard)
  getFacilityBusImageUrl(): string {
    const map: Record<FacilityId, string> = {
      'Miller BRT': '/assets/york-region-transit_Miller-brt.png',
      'Miller SE': '/assets/york-region-transit_Miller-se.png',
      MOB1: '/assets/york-region-transit_mob1.png',
      MOB2: '/assets/york-region-transit_mob2.png',
      'TOK North': '/assets/york-region-transit_tok-north.png',
      'TOK West': '/assets/york-region-transit_tok-west.png',
    };

    return (
      map[this.selectedFacilityId] ?? '/assets/york-region-transit_Miller-brt.png'
    );
  }

  // Board
  get board(): Board {
    return this.fleet.getBoard(this.selectedFacilityId);
  }

  get selectedFacility(): Facility {
    return (
      this.facilities.find((f) => f.id === this.selectedFacilityId) ??
      this.facilities[0]
    );
  }

  get showSearchRow(): boolean {
    return this.searchQuery.trim().length > 0;
  }

  get searchDropListId(): string {
    return `search__${this.selectedFacilityId}`;
  }

  get connectedDropListIds(): string[] {
    const colIds = this.categories.map((c) => this.dropListId(c.id));
    return this.showSearchRow ? [...colIds, this.searchDropListId] : colIds;
  }

  dropListId(categoryId: CategoryId): string {
    return `${this.selectedFacilityId}__${categoryId}`;
  }

  count(categoryId: CategoryId): number {
    return this.board[categoryId].length;
  }

  facilityTotal(facilityId: FacilityId): number {
    const b = this.fleet.getBoard(facilityId);
    return this.categories.reduce((sum, c) => sum + b[c.id].length, 0);
  }

  onSelectFacility(facilityId: FacilityId) {
    this.selectedFacilityId = facilityId;

    this.searchQuery = '';
    this.searchResults = [];
    this.searchMetaById = {};
  }

  onSearchChange(value: string) {
    this.searchQuery = value;
    this.refreshSearch();
  }

  clearSearch() {
    this.searchQuery = '';
    this.searchResults = [];
    this.searchMetaById = {};
  }

  private refreshSearch() {
    const q = this.searchQuery.trim().toLowerCase();

    if (!q) {
      this.searchResults = [];
      this.searchMetaById = {};
      return;
    }

    const results: BusDetails[] = [];
    const meta: Record<
      string,
      { categoryId: CategoryId; categoryLabel: string } | undefined
    > = {};

    for (const cat of this.categories) {
      const list = this.board[cat.id];

      for (const bus of list) {
        const labelMatch = (bus.label ?? '').toLowerCase().includes(q);

        // match bay search: "bay 3" or "3"
        const bayText = typeof bus.bay === 'number' ? `bay ${bus.bay}` : '';
        const bayMatch =
          bayText.includes(q) || String(bus.bay ?? '').includes(q);

        if (labelMatch || bayMatch) {
          results.push(bus);
          meta[bus.id] = { categoryId: cat.id, categoryLabel: cat.label };
        }
      }
    }

    this.searchResults = results;
    this.searchMetaById = meta;
  }

  private findBusCategoryId(busId: string): CategoryId | null {
    for (const cat of this.categories) {
      if (this.board[cat.id].some((b) => b.id === busId)) return cat.id;
    }
    return null;
  }

  onDrop(toCategory: CategoryId, event: CdkDragDrop<BusDetails[]>) {
    // reorder in same column
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      return;
    }

    const movedBus = event.item.data as BusDetails;

    // find original category (works both from search and normal columns)
    const fromCategory = this.findBusCategoryId(movedBus.id);
    if (!fromCategory) return;

    const movingIntoBayColumn =
      toCategory === 'maintenance' || toCategory === 'long_term';
    const hasBay = typeof movedBus.bay === 'number';

    // If moving into Maintenance / Long-term and bay is missing -> open custom modal
    if (movingIntoBayColumn && !hasBay) {
      this.openBayModal(movedBus.id, fromCategory, toCategory, event.currentIndex);
      return;
    }

    // otherwise move immediately (service will clear bay when leaving bay columns)
    // IMPORTANT: pass event.currentIndex so the bus is inserted where you dropped
    this.fleet.moveBusCategory(
      this.selectedFacilityId,
      fromCategory,
      toCategory,
      movedBus.id,
      undefined,
      event.currentIndex
    );

    if (this.showSearchRow) this.refreshSearch();
  }

  // ---------- Bay Modal ----------
  private openBayModal(
    busId: string,
    fromCatId: CategoryId,
    toCatId: CategoryId,
    toIndex: number
  ) {
    this.pendingMove = { busId, fromCatId, toCatId, toIndex };

    // available bays excluding already-taken bays in maintenance+long_term
    this.bayOptions = this.fleet.getAvailableBays(this.selectedFacilityId, busId);
    this.baySelected = this.bayOptions.length ? this.bayOptions[0] : null;

    this.bayErrorMsg = '';

    this.isBayModalOpen = true;
    requestAnimationFrame(() => (this.isBayModalVisible = true));
  }

  cancelBayModal() {
    this.isBayModalVisible = false;

    setTimeout(() => {
      this.isBayModalOpen = false;
      this.pendingMove = null;
      this.bayOptions = [];
      this.baySelected = null;
      this.bayErrorMsg = '';
    }, 200);
  }

  confirmBayModal() {
    if (!this.pendingMove) return;

    const bay = this.baySelected;
    if (typeof bay !== 'number') {
      this.bayErrorMsg = 'Please select a bay number.';
      return;
    }

    const res = this.fleet.moveBusCategory(
      this.selectedFacilityId,
      this.pendingMove.fromCatId,
      this.pendingMove.toCatId,
      this.pendingMove.busId,
      bay,
      this.pendingMove.toIndex
    );

    if (!res.ok) {
      if (res.reason === 'bay_taken') this.bayErrorMsg = 'That bay is already taken.';
      else if (res.reason === 'bay_invalid')
        this.bayErrorMsg = 'That bay is not allowed for this facility.';
      else this.bayErrorMsg = 'Bay number is required.';
      return;
    }

    if (this.showSearchRow) this.refreshSearch();
    this.cancelBayModal();
  }

  // Snapshot modal
  openBusSnapshot(bus: BusDetails, statusLabel: string) {
    this.selectedBus = {
      ...bus,
      facilityId: this.selectedFacilityId,
      statusLabel,
      batteryPct: null,
      alerts: [],
    };
    this.isSnapshotOpen = true;
  }

  closeBusSnapshot() {
    this.isSnapshotOpen = false;
  }

  trackByBusId = (_: number, bus: BusDetails) => bus.id;
  trackByFacilityId = (_: number, f: Facility) => f.id;
  trackByCategoryId = (_: number, c: { id: string }) => c.id;
}