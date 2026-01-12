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

  // merge multiple facilities into one board (READ-ONLY view)
  getMergedBoard(facilityIds: FacilityId[]): Board {
    const empty: Board = {
      maintenance: [],
      long_term: [],
      third_party: [],
      storage: [],
      in_service: [],
      out_of_service: [],
    };

    for (const fid of facilityIds) {
      const b = this.boards[fid];

      // IMPORTANT: clone bus objects so drag preview/search doesn't mutate originals
      for (const cat of Object.keys(empty) as CategoryId[]) {
        empty[cat].push(...b[cat].map((x) => ({ ...x })));
      }
    }

    return empty;
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

    const isInternalBayColumn = toCategory === 'maintenance' || toCategory === 'long_term';

    if (isInternalBayColumn) {
      const chosenBay = bay ?? bus.bay;

      if (typeof chosenBay !== 'number' || !Number.isFinite(chosenBay)) {
        fromList.splice(idx, 0, bus);
        return { ok: false, reason: 'bay_required' };
      }

      const normalizedBay = Math.trunc(chosenBay);

      if (normalizedBay <= 0) {
        fromList.splice(idx, 0, bus);
        return { ok: false, reason: 'bay_invalid' };
      }

      const allowed = FACILITY_BAYS[facilityId] ?? [];
      if (!allowed.includes(normalizedBay)) {
        fromList.splice(idx, 0, bus);
        return { ok: false, reason: 'bay_invalid' };
      }

      const taken = this.getTakenBaysInternal(facilityId, bus.id);
      if (taken.has(normalizedBay)) {
        fromList.splice(idx, 0, bus);
        return { ok: false, reason: 'bay_taken' };
      }

      bus.bay = normalizedBay;
    } else {
      // moving into non-bay columns (including off-site) remove bay
      delete bus.bay;
    }

    const safeIndex =
      typeof toIndex === 'number'
        ? Math.max(0, Math.min(toIndex, toList.length))
        : toList.length;

    toList.splice(safeIndex, 0, bus);
    return { ok: true };
  }

  // Only for internal bay columns (maintenance + long_term)
  getAvailableBays(facilityId: FacilityId, excludeBusId?: string): number[] {
    const allowed = FACILITY_BAYS[facilityId] ?? [];
    const taken = this.getTakenBaysInternal(facilityId, excludeBusId);
    return allowed.filter((b) => !taken.has(b));
  }

  private getTakenBaysInternal(facilityId: FacilityId, excludeBusId?: string): Set<number> {
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
