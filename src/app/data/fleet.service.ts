import { Injectable } from '@angular/core';
import { Board, BusDetails, CategoryId, INITIAL_BOARDS } from './fleet-store';

@Injectable({ providedIn: 'root' })
export class FleetService {
  private boards: Record<string, Board> = structuredClone(INITIAL_BOARDS);

  getBoard(facilityId: string): Board {
    return this.boards[facilityId];
  }

  updateBus(
    facilityId: string,
    categoryId: CategoryId,
    busId: string,
    patch: Partial<BusDetails>
  ) {
    const busList = this.boards[facilityId][categoryId];
    const idx = busList.findIndex((b) => b.id === busId);
    if (idx === -1) return;

    busList[idx] = { ...busList[idx], ...patch };
  }

  moveBusCategory(
    facilityId: string,
    fromCategory: CategoryId,
    toCategory: CategoryId,
    busId: string
  ) {
    if (fromCategory === toCategory) return;

    const fromList = this.boards[facilityId][fromCategory];
    const toList = this.boards[facilityId][toCategory];

    const idx = fromList.findIndex((b) => b.id === busId);
    if (idx === -1) return;

    const [bus] = fromList.splice(idx, 1);
    toList.unshift(bus);
  }

}