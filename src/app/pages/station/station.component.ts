import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CATEGORIES, CategoryId, BusDetails, FACILITIES } from '../../data/fleet-store';
import { FleetService } from '../../data/fleet.service';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';


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

  facilityId = '';
  facilityName = '';

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
    this.facilityId = this.route.snapshot.paramMap.get('facilityId') ?? 'facility_a';
    this.facilityName = this.facilities.find((f) => f.id === this.facilityId)?.name ?? this.facilityId;
  }

  board() {
    return this.fleet.getBoard(this.facilityId);
  }

  startEdit(catId: CategoryId, bus: BusDetails) {
    this.editing = { fromCatId: catId, toCatId: catId, bus: { ...bus } };

    this.isSheetOpen = true;       // create DOM
    requestAnimationFrame(() => {  // trigger CSS transition
      this.isSheetVisible = true;
    });
  }

  cancelEdit() {
    // animate out first
    this.isSheetVisible = false;

    setTimeout(() => {
      this.isSheetOpen = false;
      this.editing = null;
    }, 200);
  }

  saveEdit() {
    if (!this.editing) return;

    const { fromCatId, toCatId, bus } = this.editing;

    // 1) update details in current list
    this.fleet.updateBus(this.facilityId, fromCatId, bus.id, {
      status: bus.status,
      lastService: bus.lastService,
      notes: bus.notes,
    });

    // 2) move bus to another category if changed
    if (fromCatId !== toCatId) {
      this.fleet.moveBusCategory(this.facilityId, fromCatId, toCatId, bus.id);
    }

    // close with animation
    this.cancelEdit();
  }
}
