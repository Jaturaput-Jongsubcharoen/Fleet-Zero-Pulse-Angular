import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';

import { BusSnapshotComponent } from '../../components/bus-snapshot/bus-snapshot.component';

// shared data + types
import { CATEGORIES, FACILITIES, CategoryId, Board, BusDetails } from '../../data/fleet-store';
import { FleetService } from '../../data/fleet.service';

type Facility = { id: string; name: string };

@Component({
  selector: 'app-vehicle-management',
  standalone: true,
  imports: [CommonModule, DragDropModule, BusSnapshotComponent],
  templateUrl: './vehicle-management.component.html',
  styleUrl: './vehicle-management.component.scss',
})
export class VehicleManagementComponent {
  title = 'Fleet Zero Pulse';
  subtitle = 'Vehicle Management';

  facilities: Facility[] = FACILITIES;
  categories = CATEGORIES;

  selectedFacilityId = this.facilities[0].id;

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

  get selectedFacility(): Facility {
    return this.facilities.find((f) => f.id === this.selectedFacilityId)!;
  }

  // board comes from FleetService (shared store)
  get board(): Board {
    return this.fleet.getBoard(this.selectedFacilityId);
  }

  // connect all columns (now includes out_of_service automatically because categories list includes it)
  get connectedDropListIds(): string[] {
    return this.categories.map((c) => this.dropListId(c.id));
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
  }

  onDrop(categoryId: CategoryId, event: CdkDragDrop<BusDetails[]>) {
    // reorder in same column
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      return;
    }

    // move between columns (updates the shared store arrays directly)
    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex
    );
  }

  trackByBusId = (_: number, bus: BusDetails) => bus.id;
  trackByFacilityId = (_: number, f: Facility) => f.id;
  trackByCategoryId = (_: number, c: { id: string }) => c.id;
}
