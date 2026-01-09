import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';

import { BusDetails, CategoryId } from '../../../data/fleet-store';

export interface FacilityColumnVm {
  id: CategoryId;
  label: string;
  dropListId: string;
  buses: BusDetails[];
  count: number;
}

@Component({
  selector: 'app-facility-columns',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  templateUrl: './facility-columns.component.html',
  styleUrl: './facility-columns.component.scss',
})
export class FacilityColumnsComponent {
  /** Columns view-model coming from VehicleManagementComponent */
  @Input() columns: FacilityColumnVm[] = [];

  /** IDs of all drop lists that can connect to these columns (search row + other columns) */
  @Input() connectedDropListIds: string[] = [];

  /** Background image URL for bus cards */
  @Input() busImageUrl = '';

  /** Emit when something is dropped into a column */
  @Output() columnDrop = new EventEmitter<{
    toCategory: CategoryId;
    event: CdkDragDrop<BusDetails[]>;
  }>();

  /** Emit when user double-clicks a bus (open snapshot) */
  @Output() snapshotRequested = new EventEmitter<{
    bus: BusDetails;
    statusLabel: string;
  }>();

  trackByCategoryId = (_: number, col: FacilityColumnVm) => col.id;
  trackByBusId = (_: number, bus: BusDetails) => bus.id;

  onDrop(colId: CategoryId, event: CdkDragDrop<BusDetails[]>) {
    this.columnDrop.emit({ toCategory: colId, event });
  }

  onOpenSnapshot(bus: BusDetails, statusLabel: string) {
    this.snapshotRequested.emit({ bus, statusLabel });
  }
}
