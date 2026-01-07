import { Injectable } from '@angular/core';
import {
  Board,
  BusDetails,
  CategoryId,
  FacilityId,
  FACILITY_BAYS,
  INITIAL_BOARDS,
} from './fleet-store';

type MoveResult =
  | { ok: true }
  | { ok: false; reason: 'bay_required' | 'bay_invalid' | 'bay_taken' };

@Injectable({ providedIn: 'root' })
export class FleetService {
  private boards: Record<FacilityId, Board> = structuredClone(INITIAL_BOARDS);

  getBoard(facilityId: FacilityId): Board {
    return this.boards[facilityId];
  }

  updateBus(
    facilityId: FacilityId,
    categoryId: CategoryId,
    busId: string,
    patch: Partial<BusDetails>
  ) {
    const list = this.boards[facilityId][categoryId];
    const idx = list.findIndex((b) => b.id === busId);
    if (idx === -1) return;

    list[idx] = { ...list[idx], ...patch };
  }

  /**
   * Move bus. If moving into maintenance/long_term, a bay must exist:
   * - pass `bay` OR bus already has bay
   * - bay must be allowed in facility + not taken
   */
  moveBusCategory(
    facilityId: FacilityId,
    fromCategory: CategoryId,
    toCategory: CategoryId,
    busId: string,
    bay?: number,
    toIndex?: number
  ): MoveResult {
    if (fromCategory === toCategory) return { ok: true };

    const fromList = this.boards[facilityId][fromCategory];
    const toList = this.boards[facilityId][toCategory];

    const idx = fromList.findIndex((b) => b.id === busId);
    if (idx === -1) return { ok: true };

    const [bus] = fromList.splice(idx, 1);

    const movingIntoBayColumn = toCategory === 'maintenance' || toCategory === 'long_term';

    if (movingIntoBayColumn) {
      const chosenBay = bay ?? bus.bay;

      if (typeof chosenBay !== 'number') {
        fromList.splice(idx, 0, bus);
        return { ok: false, reason: 'bay_required' };
      }

      const allowed = FACILITY_BAYS[facilityId] ?? [];
      if (!allowed.includes(chosenBay)) {
        fromList.splice(idx, 0, bus);
        return { ok: false, reason: 'bay_invalid' };
      }

      const taken = this.getTakenBays(facilityId, bus.id);
      if (taken.has(chosenBay)) {
        fromList.splice(idx, 0, bus);
        return { ok: false, reason: 'bay_taken' };
      }

      bus.bay = chosenBay;
    } else {
      // leaving Maintenance/Long-term -> remove bay
      delete bus.bay;
    }

    // insert at the drop position (NOT unshift)
    const safeIndex =
      typeof toIndex === 'number'
        ? Math.max(0, Math.min(toIndex, toList.length))
        : toList.length; // default: bottom

    toList.splice(safeIndex, 0, bus);

    return { ok: true };
  }


  /**
   * Available bays for the facility (excluding bays already used
   * in maintenance + long_term). You can allow duplicates by changing this rule.
   */
  getAvailableBays(facilityId: FacilityId, excludeBusId?: string): number[] {
    const allowed = FACILITY_BAYS[facilityId] ?? [];
    const taken = this.getTakenBays(facilityId, excludeBusId);
    return allowed.filter((b) => !taken.has(b));
  }

  private getTakenBays(facilityId: FacilityId, excludeBusId?: string): Set<number> {
    const used = new Set<number>();

    const b = this.boards[facilityId];

    for (const cat of ['maintenance', 'long_term'] as const) {
      for (const bus of b[cat]) {
        if (excludeBusId && bus.id === excludeBusId) continue;
        if (typeof bus.bay === 'number') used.add(bus.bay);
      }
    }

    return used;
  }
}