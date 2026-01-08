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
  FacilityConfig,
} from '../../data/fleet-store';
import { FleetService } from '../../data/fleet.service';
import { FacilityStripsComponent } from './facility-strips/facility-strips.component';

type Facility = FacilityConfig;
type BayModalMode = 'internal_select';

// special id for “All facilities” view
type SelectedId = FacilityId | '__ALL__';

@Component({
  selector: 'app-vehicle-management',
  standalone: true,
  imports: [CommonModule, DragDropModule, FormsModule, BusSnapshotComponent, FacilityStripsComponent],
  templateUrl: './vehicle-management.component.html',
  styleUrl: './vehicle-management.component.scss',
})
export class VehicleManagementComponent {
  title = 'Fleet Pulse';
  subtitle = 'Vehicle Management Dashboard';

  readonly facilities = FACILITIES;
  categories = CATEGORIES;

  readonly ALL_FACILITIES_ID: SelectedId = '__ALL__';

  // default = All Facilities
  selectedFacilityId: SelectedId = this.ALL_FACILITIES_ID;

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

  // ---- Bay modal (custom) ----
  isBayModalOpen = false;
  isBayModalVisible = false;

  bayModalMode: BayModalMode = 'internal_select';

  bayOptions: number[] = [];
  baySelected: number | null = null;

  pendingMove:
    | {
        busId: string;
        fromCatId: CategoryId;
        toCatId: CategoryId;
        toIndex: number;
        fromFacilityId: FacilityId;
      }
    | null = null;

  bayErrorMsg = '';

  constructor(private fleet: FleetService) {}

  // type guard: narrows SelectedId -> '__ALL__'
  private isAllSelected(id: SelectedId): id is '__ALL__' {
    return id === this.ALL_FACILITIES_ID;
  }

  // whenever you need a single FacilityId (image, label fallback, etc.)
  private get resolvedFacilityId(): FacilityId {
    if (this.isAllSelected(this.selectedFacilityId)) {
      // Use first facility as default when "All" is selected
      return this.facilities[0]?.id;
    }
    return this.selectedFacilityId;
  }

  // label for board title
  get selectedFacilityLabel(): string {
    return this.isAllSelected(this.selectedFacilityId)
      ? 'All Facilities'
      : this.selectedFacility.name;
  }

  // Bus silhouette image (no hardcoded map; driven by FACILITIES config)
  getFacilityBusImageUrl(): string {
    const facId = this.resolvedFacilityId;
    const fac = this.facilities.find((f) => f.id === facId);

    // Fallback: first facility’s image, or a generic one
    return (
      fac?.image ??
      this.facilities[0]?.image ??
      '/assets/york-region-transit_Miller-brt.png'
    );
  }

  // Board (either single facility OR merged)
  get board(): Board {
    if (this.isAllSelected(this.selectedFacilityId)) {
      return this.fleet.getMergedBoard(this.facilities.map((f) => f.id));
    }
    return this.fleet.getBoard(this.selectedFacilityId); // narrowed by guard
  }

  get selectedFacility(): Facility {
    if (this.isAllSelected(this.selectedFacilityId)) {
      const base =
        this.facilities.find((f) => f.id === this.resolvedFacilityId) ??
        this.facilities[0];

      return {
        ...base,
        name: 'All Facilities',
      };
    }

    return (
      this.facilities.find((f) => f.id === this.selectedFacilityId) ??
      this.facilities[0]
    );
  }

  get showSearchRow(): boolean {
    return this.searchQuery.trim().length > 0;
  }

  get searchDropListId(): string {
    const scope = this.isAllSelected(this.selectedFacilityId)
      ? 'ALL'
      : this.selectedFacilityId;
    return `search__${scope}`;
  }

  get connectedDropListIds(): string[] {
    const colIds = this.categories.map((c) => this.dropListId(c.id));
    return this.showSearchRow ? [...colIds, this.searchDropListId] : colIds;
  }

  dropListId(categoryId: CategoryId): string {
    const scope = this.isAllSelected(this.selectedFacilityId)
      ? 'ALL'
      : this.selectedFacilityId;
    return `${scope}__${categoryId}`;
  }

  count(categoryId: CategoryId): number {
    return this.board[categoryId].length;
  }

  facilityTotal(facilityId: FacilityId): number {
    const b = this.fleet.getBoard(facilityId);
    return this.categories.reduce((sum, c) => sum + b[c.id].length, 0);
  }

  allFacilitiesTotal(): number {
    return this.facilities.reduce(
      (sum, f) => sum + this.facilityTotal(f.id),
      0
    );
  }

  onSelectAllFacilities() {
    this.selectedFacilityId = this.ALL_FACILITIES_ID;
    this.searchQuery = '';
    this.searchResults = [];
    this.searchMetaById = {};
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

  private findBusFacilityId(busId: string): FacilityId | null {
    for (const f of this.facilities) {
      const b = this.fleet.getBoard(f.id);
      for (const cat of this.categories) {
        if (b[cat.id].some((x) => x.id === busId)) return f.id;
      }
    }
    return null;
  }

  onDrop(toCategory: CategoryId, event: CdkDragDrop<BusDetails[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      return;
    }

    const movedBus = event.item.data as BusDetails;

    const fromCategory = this.findBusCategoryId(movedBus.id);
    if (!fromCategory) return;

    let fromFacilityId: FacilityId | null;

    if (this.isAllSelected(this.selectedFacilityId)) {
      fromFacilityId = this.findBusFacilityId(movedBus.id);
    } else {
      fromFacilityId = this.selectedFacilityId;
    }

    if (!fromFacilityId) return;

    const movingIntoInternalBay =
      toCategory === 'maintenance' || toCategory === 'long_term';
    const hasBay = typeof movedBus.bay === 'number';

    if (movingIntoInternalBay && !hasBay) {
      this.openBayModalInternalSelect(
        movedBus.id,
        fromCategory,
        toCategory,
        event.currentIndex,
        fromFacilityId
      );
      return;
    }

    this.fleet.moveBusCategory(
      fromFacilityId,
      fromCategory,
      toCategory,
      movedBus.id,
      undefined,
      event.currentIndex
    );

    if (this.showSearchRow) this.refreshSearch();
  }

  // ---------- Bay Modal ----------
  private openBayModalInternalSelect(
    busId: string,
    fromCatId: CategoryId,
    toCatId: CategoryId,
    toIndex: number,
    fromFacilityId: FacilityId
  ) {
    this.pendingMove = { busId, fromCatId, toCatId, toIndex, fromFacilityId };
    this.bayModalMode = 'internal_select';

    this.bayOptions = this.fleet.getAvailableBays(fromFacilityId, busId);
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

      this.bayModalMode = 'internal_select';
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
      this.pendingMove.fromFacilityId,
      this.pendingMove.fromCatId,
      this.pendingMove.toCatId,
      this.pendingMove.busId,
      bay,
      this.pendingMove.toIndex
    );

    if (!res.ok) {
      if (res.reason === 'bay_taken')
        this.bayErrorMsg = 'That bay is already taken.';
      else if (res.reason === 'bay_invalid')
        this.bayErrorMsg = 'That bay is not valid.';
      else this.bayErrorMsg = 'Bay number is required.';
      return;
    }

    if (this.showSearchRow) this.refreshSearch();
    this.cancelBayModal();
  }

  // Snapshot modal
  openBusSnapshot(bus: BusDetails, statusLabel: string) {
    const resolvedFacilityId: FacilityId | undefined = this.isAllSelected(
      this.selectedFacilityId
    )
      ? this.findBusFacilityId(bus.id) ?? undefined
      : this.selectedFacilityId;

    this.selectedBus = {
      ...bus,
      facilityId: resolvedFacilityId,
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

  
  // helper: null when "All Facilities"
  get selectedFacilityOrNull(): Facility | null {
    return this.isAllSelected(this.selectedFacilityId) ? null : this.selectedFacility;
  }

  get selectedFacilityTotal(): number {
    return this.isAllSelected(this.selectedFacilityId)
      ? this.allFacilitiesTotal()
      : this.facilityTotal(this.selectedFacility.id);
  }

  get statusCountsForSelected() {
    return this.categories.map((c) => ({
      id: c.id,
      label: c.label,
      count: this.board[c.id].length,
    }));
  }
}