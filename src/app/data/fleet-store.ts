export type CategoryId =
  | 'maintenance'
  | 'storage'
  | 'in_service'
  | 'long_term'
  | 'out_of_service';

export type FacilityId =
  | 'Miller BRT'
  | 'Miller SE'
  | 'MOB1'
  | 'MOB2'
  | 'TOK North'
  | 'TOK West';

export type BusDetails = {
  id: string;
  label: string;
  status: string;

  // Only exists when bus is in Maintenance / Long-term
  bay?: number;

  lastService?: string;
  notes?: string;
};

export type Board = Record<CategoryId, BusDetails[]>;

export const CATEGORIES = [
  { id: 'maintenance', label: 'Maintenance' },
  { id: 'storage', label: 'Storage' },
  { id: 'in_service', label: 'In-Service' },
  { id: 'long_term', label: 'Long-term Maintenance' },
  { id: 'out_of_service', label: 'Out of service' },
] as const;

export const FACILITIES = [
  { id: 'Miller BRT', name: 'Miller BRT' },
  { id: 'Miller SE', name: 'Miller SE' },
  { id: 'MOB1', name: 'MOB1' },
  { id: 'MOB2', name: 'MOB2' },
  { id: 'TOK North', name: 'TOK North' },
  { id: 'TOK West', name: 'TOK West' },
] as const;

export const FACILITY_BAYS: Record<FacilityId, number[]> = {
  'Miller BRT': [1, 2, 3, 4, 5],
  'Miller SE': [1, 2, 3],
  MOB1: [1, 2, 3, 4],
  MOB2: [1, 2],
  'TOK North': [1, 2, 3],
  'TOK West': [1, 2, 3, 4, 5, 6],
};

export const INITIAL_BOARDS: Record<FacilityId, Board> = {
  'Miller BRT': {
    maintenance: [
      { id: 'bus-101', label: 'Bus 101', status: 'Under Repair', bay: 1, lastService: '2024-01-15', notes: 'Engine maintenance' },
      { id: 'bus-102', label: 'Bus 102', status: 'Scheduled Maintenance', bay: 2, lastService: '2024-01-10', notes: 'Regular checkup' },
      // example: maintenance bus with bay 3
      { id: 'bus-112', label: 'Bus 112', status: 'Inspection', bay: 3, lastService: '2024-01-09', notes: 'Safety check' },
    ],
    storage: [
      { id: 'bus-103', label: 'Bus 103', status: '--', lastService: '--', notes: '--' },
      { id: 'bus-111', label: 'Bus 111', status: 'Stored', lastService: '2023-12-22', notes: 'Lot A row 2' },
    ],
    in_service: [
      { id: 'bus-104', label: 'Bus 104', status: '--', lastService: '--', notes: '--' },
    ],
    long_term: [
      // example long-term bus with bay 4
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
    storage: [
      { id: 'bus-115', label: 'Bus 115', status: 'Stored', lastService: '--', notes: '--' },
    ],
    in_service: [
      { id: 'bus-106', label: 'Bus 106', status: '--', lastService: '--', notes: '--' },
    ],
    long_term: [],
    out_of_service: [],
  },

  MOB1: {
    maintenance: [],
    storage: [
      { id: 'bus-107', label: 'Bus 107', status: 'Stored', lastService: '2023-12-22', notes: 'Lot B row 3' },
    ],
    in_service: [
      { id: 'bus-108', label: 'Bus 108', status: 'On route', lastService: '2024-01-03', notes: 'Running normal' },
      // example: in_service bus (no bay)
      { id: 'bus-116', label: 'Bus 116', status: 'On route', lastService: '2024-01-02', notes: 'Normal' },
    ],
    long_term: [],
    out_of_service: [],
  },

  MOB2: {
    maintenance: [],
    storage: [
      { id: 'bus-109', label: 'Bus 109', status: '--', lastService: '--', notes: '--' },
    ],
    in_service: [],
    long_term: [
      { id: 'bus-110', label: 'Bus 110', status: 'Body repair', bay: 1, lastService: '2023-11-20', notes: 'Waiting for parts' },
    ],
    out_of_service: [],
  },

  'TOK North': {
    maintenance: [
      { id: 'bus-201', label: 'Bus 201', status: 'Oil leak inspection', bay: 1, lastService: '2024-01-12', notes: 'Check engine area' },
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