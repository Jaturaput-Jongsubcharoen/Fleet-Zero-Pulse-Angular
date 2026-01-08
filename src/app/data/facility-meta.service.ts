// src/app/data/facility-meta.service.ts
import { Injectable } from '@angular/core';
import { FacilityId } from './fleet-store';
import {
  EditableFacilityInfo,
  INITIAL_FACILITY_META,
  DEFAULT_EV_SHARE,
  DEFAULT_MODEL_BREAKDOWN,
  ModelSegment,
} from './facility-meta-store';

@Injectable({ providedIn: 'root' })
export class FacilityMetaService {
  // mutable copy of the “Excel sheet”
  private editableByFacility: Record<FacilityId, EditableFacilityInfo> =
    structuredClone(INITIAL_FACILITY_META);

  getEditableInfo(fid: FacilityId): EditableFacilityInfo {
    // lazy-init in case you add new facilities later
    if (!this.editableByFacility[fid]) {
      this.editableByFacility[fid] = {
        address: '',
        coordinates: '',
        garageImageUrl: '',
        mechanics: null,
        apprentices: null,
        supportStaff: null,
        maintenanceBays: null,
        facilityScore: null,
        lastAuditDate: null,
      };
    }
    return this.editableByFacility[fid];
  }

  updateEditableInfo(fid: FacilityId, patch: Partial<EditableFacilityInfo>) {
    this.editableByFacility[fid] = {
      ...this.getEditableInfo(fid),
      ...patch,
    };
  }

  getEvShare(fid: FacilityId): number {
    return DEFAULT_EV_SHARE[fid] ?? 0;
  }

  getModelBreakdown(fid: FacilityId): ModelSegment[] {
    return DEFAULT_MODEL_BREAKDOWN[fid] ?? [];
  }
}
