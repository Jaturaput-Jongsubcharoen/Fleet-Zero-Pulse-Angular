import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

type CategoryId = 'maintenance' | 'storage' | 'in_service' | 'long_term';

type Facility = { id: string; name: string };

type Bus = { id: string; label: string };

type Board = Record<CategoryId, Bus[]>;

const CATEGORIES: { id: CategoryId; label: string }[] = [
  { id: 'maintenance', label: 'Maintenance' },
  { id: 'storage', label: 'Storage' },
  { id: 'in_service', label: 'In-Service' },
  { id: 'long_term', label: 'Long-term Maintenance' },
];

const FACILITIES: Facility[] = [
  { id: 'facility_a', name: 'Facility A' },
  { id: 'facility_b', name: 'Facility B' },
];

const INITIAL: Record<string, Board> = {
  facility_a: {
    maintenance: [
      { id: 'bus-101', label: 'Bus 101' },
      { id: 'bus-102', label: 'Bus 102' },
    ],
    storage: [
      { id: 'bus-104', label: 'Bus 104' },
      { id: 'bus-105', label: 'Bus 105' },
    ],
    in_service: [
      { id: 'bus-106', label: 'Bus 106' },
      { id: 'bus-107', label: 'Bus 107' },
      { id: 'bus-108', label: 'Bus 108' },
      { id: 'bus-109', label: 'Bus 109' },
    ],
    long_term: [
      { id: 'bus-110', label: 'Bus 110' },
      { id: 'bus-103', label: 'Bus 103' },
    ],
  },
  facility_b: {
    maintenance: [{ id: 'bus-201', label: 'Bus 201' }],
    storage: [{ id: 'bus-202', label: 'Bus 202' }],
    in_service: [
      { id: 'bus-203', label: 'Bus 203' },
      { id: 'bus-204', label: 'Bus 204' },
    ],
    long_term: [{ id: 'bus-205', label: 'Bus 205' }],
  },
};

@Component({
  selector: 'app-vehicle-management',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  templateUrl: './vehicle-management.component.html',
  styleUrl: './vehicle-management.component.scss',
})
export class VehicleManagementComponent {
  title = 'Fleet Zero Pulse';
  subtitle = 'Vehicle Management';

  facilities = FACILITIES;
  categories = CATEGORIES;

  selectedFacilityId = FACILITIES[0].id;

  selectedBus: Bus | null = null;
  isSnapshotOpen = false;

  openBusSnapshot(bus: Bus) {
    this.selectedBus = bus;
    this.isSnapshotOpen = true;
  }

  closeBusSnapshot() {
    this.isSnapshotOpen = false;
  }

  // NOTE: keep data in component state; later you can replace with API
  boards: Record<string, Board> = structuredClone(INITIAL);

  get selectedFacility(): Facility {
    return this.facilities.find((f) => f.id === this.selectedFacilityId)!;
  }

  get board(): Board {
    return this.boards[this.selectedFacilityId];
  }

  // For connecting all 4 columns together
  get connectedDropListIds(): string[] {
    return this.categories.map((c) => this.dropListId(c.id));
  }

  dropListId(categoryId: CategoryId): string {
    return `${this.selectedFacilityId}__${categoryId}`;
  }

  count(categoryId: CategoryId): number {
    return this.board[categoryId].length;
  }

  // Sidebar: total buses per facility
  facilityTotal(facilityId: string): number {
    const b = this.boards[facilityId];
    return (
      b.maintenance.length + b.storage.length + b.in_service.length + b.long_term.length
    );
  }

  onSelectFacility(facilityId: string) {
    this.selectedFacilityId = facilityId;
  }

  onDrop(categoryId: CategoryId, event: CdkDragDrop<Bus[]>) {
    // Important: event.container.data & event.previousContainer.data are the arrays in memory
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      return;
    }

    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex
    );
  }

  trackByBusId = (_: number, bus: Bus) => bus.id;
  trackByFacilityId = (_: number, f: Facility) => f.id;
  trackByCategoryId = (_: number, c: { id: string }) => c.id;
}
