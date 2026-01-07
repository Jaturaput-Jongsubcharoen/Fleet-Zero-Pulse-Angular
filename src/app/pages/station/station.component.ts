import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';

import { CATEGORIES, CategoryId, BusDetails, FACILITIES, FacilityId } from '../../data/fleet-store';
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

  // now this is a LOCATION/YARD id (FacilityId)
  facilityId: FacilityId = 'Miller BRT';
  facilityName = 'Miller BRT';

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
    // subscribe so it works when route param changes without reloading page
    this.route.paramMap.subscribe((params) => {
      const raw = (params.get('facilityId') ?? 'Miller BRT') as FacilityId;

      this.facilityId = raw;
      this.facilityName = this.facilities.find((f) => f.id === this.facilityId)?.name ?? this.facilityId;

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

  private categoryLabel(catId: CategoryId): string {
    return this.categories.find((c) => c.id === catId)?.label ?? '';
  }

  private needsBay(catId: CategoryId): boolean {
    return catId === 'maintenance' || catId === 'long_term';
  }

  // you can change these bay ranges anytime
  private randomBayNumber(): number {
    // example: bays 1..12
    return Math.floor(Math.random() * 12) + 1;
  }

  saveEdit() {
    if (!this.editing) return;

    const { fromCatId, toCatId, bus } = this.editing;

    const toLabel = this.categoryLabel(toCatId) || bus.status;

    // Decide bay rules based on category
    let nextBay: number | null | undefined = bus.bay;

    if (this.needsBay(toCatId)) {
      // if moving into Maintenance/Long-term, auto assign if missing
      if (nextBay == null) nextBay = this.randomBayNumber();
    } else {
      // if moving out of those columns, clear bay
      nextBay = null;
    }

    // 1) update details in the current list
    this.fleet.updateBus(this.facilityId, fromCatId, bus.id, {
      status: toLabel,      // keep status matched with category label
      lastService: bus.lastService,
      notes: bus.notes,
      bay: nextBay ?? undefined, // ensure bay exists only when allowed
    });

    // 2) move bus to another category if changed
    if (fromCatId !== toCatId) {
      this.fleet.moveBusCategory(this.facilityId, fromCatId, toCatId, bus.id);
    }

    this.cancelEdit();
  }
}