import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { FormsModule } from '@angular/forms';

import { BusSnapshotComponent } from '../../components/bus-snapshot/bus-snapshot.component';
import { CATEGORIES, FACILITIES, CategoryId, Board, BusDetails } from '../../data/fleet-store';
import { FleetService } from '../../data/fleet.service';

type Facility = { id: string; name: string };

@Component({
  selector: 'app-vehicle-management',
  standalone: true,
  imports: [CommonModule, DragDropModule, FormsModule, BusSnapshotComponent],
  templateUrl: './vehicle-management.component.html',
  styleUrl: './vehicle-management.component.scss',
})
export class VehicleManagementComponent {
  title = 'Fleet Zero Pulse';
  subtitle = 'Vehicle Management';

  facilities: Facility[] = FACILITIES;
  categories = CATEGORIES;

  selectedFacilityId = this.facilities[0].id;

  // Search
  searchQuery = '';
  searchResults: BusDetails[] = [];

  // allow undefined so ?. is valid and warning disappears
  searchMetaById: Record<
    string,
    { categoryId: CategoryId; categoryLabel: string } | undefined
  > = {};

  // Snapshot modal
  selectedBus:
    | (BusDetails & {
        facilityId?: string;
        statusLabel?: string;
        batteryPct?: number | null;
        alerts?: string[] | null;
      })
    | null = null;

  isSnapshotOpen = false;

  constructor(private fleet: FleetService) {}

  // placing images in: src/assets/
  // and referencing them with /assets/...
  getFacilityBusImageUrl(): string {
    const map: Record<string, string> = {
      facility_a: '/assets/york-region-transit-facility-a.png',
      facility_b: '/assets/york-region-transit-facility-b.png',
    };
    return map[this.selectedFacilityId] ?? '/assets/york-region-transit-facility-a.png';
  }

  // Board
  get board(): Board {
    return this.fleet.getBoard(this.selectedFacilityId);
  }

  get selectedFacility(): Facility {
    return this.facilities.find((f) => f.id === this.selectedFacilityId) ?? this.facilities[0];
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

  facilityTotal(facilityId: string): number {
    const b = this.fleet.getBoard(facilityId);
    return this.categories.reduce((sum, c) => sum + b[c.id].length, 0);
  }

  onSelectFacility(facilityId: string) {
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
    const meta: Record<string, { categoryId: CategoryId; categoryLabel: string } | undefined> = {};

    for (const cat of this.categories) {
      const list = this.board[cat.id];
      for (const bus of list) {
        const labelMatch = (bus.label ?? '').toLowerCase().includes(q);
        const locMatch = String((bus as any).location ?? '').toLowerCase().includes(q);

        if (labelMatch || locMatch) {
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

  onDrop(categoryId: CategoryId, event: CdkDragDrop<BusDetails[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      return;
    }

    const movedBus = event.item.data as BusDetails;

    // From SEARCH to real column
    if (event.previousContainer.id === this.searchDropListId) {
      const fromCat = this.findBusCategoryId(movedBus.id);
      if (!fromCat) return;

      const fromList = this.board[fromCat];
      const toList = this.board[categoryId];

      const idx = fromList.findIndex((b) => b.id === movedBus.id);
      if (idx === -1) return;

      const [busObj] = fromList.splice(idx, 1);
      toList.splice(event.currentIndex, 0, busObj);

      this.refreshSearch();
      return;
    }

    // Normal column-to-column
    const prev = event.previousContainer.data;
    const next = event.container.data;

    const [busObj] = prev.splice(event.previousIndex, 1);
    next.splice(event.currentIndex, 0, busObj);

    if (this.showSearchRow) this.refreshSearch();
  }

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
