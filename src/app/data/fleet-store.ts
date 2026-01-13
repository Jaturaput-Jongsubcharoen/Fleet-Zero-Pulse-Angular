export type CategoryId =
  | 'maintenance'
  | 'third_party'
  | 'storage'
  | 'in_service'
  | 'long_term'
  | 'out_of_service';

export type FacilityId =
  | 'Miller BRT'
  | 'Miller SE'
  | 'TOK North'
  | 'TOK West';

export type FacilityConfig = {
  id: FacilityId;
  name: string;
  image: string;   // bus silhouette path
};

export type BusDetails = {
  id: string;
  label: string;
  status: string;
  bay?: number;
  lastService?: string;
  notes?: string;
};

export type Board = Record<CategoryId, BusDetails[]>;

export type CategoryConfig = {
  id: CategoryId;
  label: string;
  color: string;
};

export const CATEGORIES: readonly CategoryConfig[] = [
  { id: 'storage',        label: 'Storage',               color: '#6259ca' },
  { id: 'in_service',     label: 'In-Service',            color: '#53caed' },
  { id: 'out_of_service', label: 'Out of service',        color: '#01b8ff' },
  { id: 'maintenance',    label: 'Maintenance',           color: '#f16d75' },
  { id: 'long_term',      label: 'Long-term Maintenance', color: '#29ccbb' },
  { id: 'third_party',    label: 'Off-Site Maintenance',  color: '#19b159' },
] as const;


export const FACILITIES: readonly FacilityConfig[] = [
  {
    id: 'Miller BRT',
    name: 'Miller BRT',
    image: '/assets/york-region-transit_Miller-brt.png',
  },
  {
    id: 'Miller SE',
    name: 'Miller SE',
    image: '/assets/york-region-transit_Miller-se.png',
  },
  {
    id: 'TOK North',
    name: 'TOK North',
    image: '/assets/york-region-transit_tok-north.png',
  },
  {
    id: 'TOK West',
    name: 'TOK West',
    image: '/assets/york-region-transit_tok-west.png',
  },
] as const;

export const FACILITY_BAYS: Record<FacilityId, number[]> = {
  'Miller BRT': [1, 2, 3, 4, 5],
  'Miller SE': [1, 2, 3],
  'TOK North': [1, 2, 3],
  'TOK West': [1, 2, 3, 4, 5, 6],
};

export const INITIAL_BOARDS: Record<FacilityId, Board> = {
  'Miller BRT': {
    maintenance: [
      { id: 'bus-101', label: 'Bus 101', status: 'Under Repair', bay: 1, lastService: '2024-01-15', notes: 'Engine maintenance' },
      { id: 'bus-102', label: 'Bus 102', status: 'Scheduled Maintenance', bay: 2, lastService: '2024-01-10', notes: 'Regular checkup' },
      { id: 'bus-112', label: 'Bus 112', status: 'Inspection', bay: 3, lastService: '2024-01-09', notes: 'Safety check' },
    ],
    third_party: [
      { id: 'bus-120', label: 'Bus 120', status: 'Vendor repair', lastService: '--', notes: 'Sent to external shop' },
      { id: 'bus-121', label: 'Bus 121', status: 'Awaiting vendor', lastService: '--', notes: 'Needs bay number at vendor' },
    ],
    storage: [
      { id: 'bus-103', label: 'Bus 103', status: '--', lastService: '--', notes: '--' },
      { id: 'bus-111', label: 'Bus 111', status: 'Stored', lastService: '2023-12-22', notes: 'Lot A row 2' },
    ],
    in_service: [
      { id: 'bus-104', label: 'Bus 104', status: '--', lastService: '--', notes: '--' },
    ],
    long_term: [
      { id: 'bus-113', label: 'Bus 113', status: 'Long-term Repair', bay: 4, lastService: '2023-11-20', notes: 'Awaiting parts' },
    ],
    out_of_service: [
      { id: 'bus-114', label: 'Bus 114', status: 'Decommissioned', lastService: '2023-10-01', notes: 'Do not dispatch' },
    ],
  },

  'Miller SE': {
    maintenance: [
      { id: 'bus-105', label: 'Bus 105', status: 'Waiting Parts', bay: 1, lastService: '2024-01-05', notes: 'Brake replacement needed' },
    ],
    third_party: [
      { id: 'bus-122', label: 'Bus 122', status: 'External diagnostics', lastService: '--', notes: 'Sent off-site' },
    ],
    storage: [
      { id: 'bus-115', label: 'Bus 115', status: 'Stored', lastService: '--', notes: '--' },
    ],
    in_service: [
      { id: 'bus-106', label: 'Bus 106', status: '--', lastService: '--', notes: '--' },
    ],
    long_term: [],
    out_of_service: [],
  },

  'TOK North': {
    maintenance: [
      { id: 'bus-201', label: 'Bus 201', status: 'Oil leak inspection', bay: 1, lastService: '2024-01-12', notes: 'Check engine area' },
    ],
    third_party: [
      { id: 'bus-207', label: 'Bus 207', status: 'External inspection', lastService: '--', notes: 'Vendor checking issue' },
    ],
    storage: [
      { id: 'bus-202', label: 'Bus 202', status: 'Stored', lastService: '--', notes: '--' },
    ],
    in_service: [],
    long_term: [],
    out_of_service: [],
  },

  'TOK West': {
    maintenance: [
      { id: 'bus-203', label: 'Bus 203', status: 'Brake replacement', bay: 1, lastService: '2024-01-08', notes: 'Front pads low' },
    ],
    third_party: [
      { id: 'bus-208', label: 'Bus 208', status: 'Vendor repair', lastService: '--', notes: 'Off-site work' },
    ],
    storage: [],
    in_service: [
      { id: 'bus-204', label: 'Bus 204', status: 'Standby', lastService: '2024-01-06', notes: 'Ready for dispatch' },
    ],
    long_term: [
      { id: 'bus-205', label: 'Bus 205', status: 'Body repair', bay: 2, lastService: '2023-11-20', notes: 'Waiting for parts' },
    ],
    out_of_service: [
      { id: 'bus-206', label: 'Bus 206', status: 'Decommissioned', lastService: '2023-10-01', notes: 'Do not dispatch' },
    ],
  },
};
