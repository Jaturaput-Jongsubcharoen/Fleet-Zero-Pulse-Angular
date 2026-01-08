// src/data/facility-meta-store.ts
import { FacilityId } from './fleet-store';

export type EditableFacilityInfo = {
  address: string;
  coordinates: string;
  garageImageUrl: string;
  mechanics: number | null;
  apprentices: number | null;
  supportStaff: number | null;
  maintenanceBays: number | null;
  facilityScore: number | null;
  lastAuditDate: string | null;
};

// think of this as the sheet you’ll later replace with real Excel data
export const INITIAL_FACILITY_META: Record<FacilityId, EditableFacilityInfo> = {
  'Miller BRT': {
    address: 'Miller BRT yard address',
    coordinates: '',
    garageImageUrl: '/assets/garage-picture/miller-brt-garage.jpg',
    mechanics: null,
    apprentices: null,
    supportStaff: null,
    maintenanceBays: null,
    facilityScore: null,
    lastAuditDate: null,
  },
  'Miller SE': {
    address: 'Miller SE yard address',
    coordinates: '',
    garageImageUrl: '/assets/garage-picture/miller-se-garage.jpg',
    mechanics: null,
    apprentices: null,
    supportStaff: null,
    maintenanceBays: null,
    facilityScore: null,
    lastAuditDate: null,
  },
  'TOK North': {
    address: 'TOK North yard address',
    coordinates: '',
    garageImageUrl: '/assets/garage-picture/tok-north-garage.jpg',
    mechanics: null,
    apprentices: null,
    supportStaff: null,
    maintenanceBays: null,
    facilityScore: null,
    lastAuditDate: null,
  },
  'TOK West': {
    address: 'TOK West yard address',
    coordinates: '',
    garageImageUrl: '/assets/garage-picture/tok-west-garage.jpg',
    mechanics: null,
    apprentices: null,
    supportStaff: null,
    maintenanceBays: null,
    facilityScore: null,
    lastAuditDate: null,
  },
};

// % of garage with electric buses (non-editable for now)
export const DEFAULT_EV_SHARE: Record<FacilityId, number> = {
  'Miller BRT': 40,
  'Miller SE': 55,
  'TOK North': 35,
  'TOK West': 60,
};

// optional: default model breakdown (you can tweak per facility later)
export type ModelSegment = { label: string; pct: number };

export const DEFAULT_MODEL_BREAKDOWN: Record<FacilityId, ModelSegment[]> = {
  'Miller BRT': [
    { label: '40ft Diesel', pct: 40 },
    { label: '60ft Diesel', pct: 20 },
    { label: '40ft Electric', pct: 25 },
    { label: 'Other', pct: 15 },
  ],
  'Miller SE': [
    { label: '40ft Diesel', pct: 30 },
    { label: '60ft Diesel', pct: 30 },
    { label: '40ft Electric', pct: 25 },
    { label: 'Other', pct: 15 },
  ],
  'TOK North': [
    { label: '40ft Diesel', pct: 50 },
    { label: '60ft Diesel', pct: 10 },
    { label: '40ft Electric', pct: 25 },
    { label: 'Other', pct: 15 },
  ],
  'TOK West': [
    { label: '40ft Diesel', pct: 35 },
    { label: '60ft Diesel', pct: 15 },
    { label: '40ft Electric', pct: 30 },
    { label: 'Other', pct: 20 },
  ],
};
