import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';

import { CATEGORIES, CategoryId, BusDetails, FACILITIES } from '../../data/fleet-store';
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

  facilityId: string = 'facility_a';
  facilityName: string = 'Facility A';

  // animation states
  isSheetOpen = false;
  isSheetVisible = false;

  // editing state includes current + target category
  editing:
    | {
        fromCatId: CategoryId;
        toCatId: CategoryId;
        bus: BusDetails;
      }
    | null = null;

  constructor(private route: ActivatedRoute, private fleet: FleetService) {
    // this is really important. subscribe so it works when route param changes without reloading page
    this.route.paramMap.subscribe((params) => {
      this.facilityId = params.get('facilityId') ?? 'facility_a';
      this.facilityName =
        this.facilities.find((f) => f.id === this.facilityId)?.name ?? this.facilityId;

      // optional: close editor when switching facility
      this.isSheetOpen = false;
      this.isSheetVisible = false;
      this.editing = null;
    });
  }

  board() {
    return this.fleet.getBoard(this.facilityId);
  }

  startEdit(catId: CategoryId, bus: BusDetails) {
    this.editing = { fromCatId: catId, toCatId: catId, bus: { ...bus } };

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
    }, 200);
  }

  saveEdit() {
    if (!this.editing) return;

    const { fromCatId, toCatId, bus } = this.editing;

    // Yes my option: keep bus.status consistent with the category label
    const toLabel = this.categories.find((c) => c.id === toCatId)?.label ?? bus.status;

    // 1) update details (save values the user edited)
    this.fleet.updateBus(this.facilityId, fromCatId, bus.id, {
      status: toLabel, // << keeps it matched with category
      lastService: bus.lastService,
      notes: bus.notes,
    });

    // 2) move bus to another category if changed
    if (fromCatId !== toCatId) {
      this.fleet.moveBusCategory(this.facilityId, fromCatId, toCatId, bus.id);
    }

    this.cancelEdit();
  }
}
