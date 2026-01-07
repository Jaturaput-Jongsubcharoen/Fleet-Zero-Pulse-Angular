export type CategoryId = 'maintenance' | 'storage' | 'in_service' | 'long_term' | 'out_of_service';

export type BusDetails = {
  id: string;
  label: string; // "Bus 101"
  status: string; // "Under Repair"
  location: BusLocation; // NEW
  lastService?: string;
  notes?: string;
};

export type Board = Record<CategoryId, BusDetails[]>;

export const CATEGORIES: { id: CategoryId; label: string }[] = [
  { id: 'maintenance', label: 'Maintenance' },
  { id: 'storage', label: 'Storage' },
  { id: 'in_service', label: 'In-Service' },
  { id: 'long_term', label: 'Long-term Maintenance' },
  { id: 'out_of_service', label: 'Out of service' },
];

export const FACILITIES = [
  { id: 'facility_a', name: 'Facility A' },
  { id: 'facility_b', name: 'Facility B' },
];

export const INITIAL_BOARDS: Record<string, Board> = {
    facility_a: {
    maintenance: [
        { id: 'bus-101', label: 'Bus 101', status: 'Under Repair', location: 'Miller BRT', lastService: '2024-01-15', notes: 'Engine maintenance' },
        { id: 'bus-102', label: 'Bus 102', status: 'Scheduled Maintenance', location: 'Miller SE', lastService: '2024-01-10', notes: 'Regular checkup' },
        { id: 'bus-103', label: 'Bus 103', status: 'Waiting Parts', location: 'MOB1', lastService: '2024-01-05', notes: 'Brake replacement needed' },
    ],
    storage: [
        { id: 'bus-104', label: 'Bus 104', status: '--', location: 'MOB2', lastService: '--', notes: '--' },
        { id: 'bus-105', label: 'Bus 105', status: '--', location: 'TOK North', lastService: '--', notes: '--' },
    ],
    in_service: [
        { id: 'bus-106', label: 'Bus 106', status: '--', location: 'TOK West', lastService: '--', notes: '--' },
        { id: 'bus-107', label: 'Bus 107', status: '--', location: 'Miller BRT', lastService: '--', notes: '--' },
        { id: 'bus-108', label: 'Bus 108', status: '--', location: 'Miller SE', lastService: '--', notes: '--' },
        { id: 'bus-109', label: 'Bus 109', status: '--', location: 'MOB1', lastService: '--', notes: '--' },
    ],
    long_term: [
        { id: 'bus-110', label: 'Bus 110', status: '--', location: 'MOB2', lastService: '--', notes: '--' },
    ],
    out_of_service: [],
    },


    facility_b: {
    maintenance: [
        { id: 'bus-201', label: 'Bus 201', status: 'Oil leak inspection', location: 'TOK North', lastService: '2024-01-12', notes: 'Check engine area' },
        { id: 'bus-202', label: 'Bus 202', status: 'Brake replacement', location: 'TOK West', lastService: '2024-01-08', notes: 'Front pads low' },
    ],
    storage: [
        { id: 'bus-203', label: 'Bus 203', status: 'Stored', location: 'Miller BRT', lastService: '2023-12-22', notes: 'Lot B row 3' },
        { id: 'bus-204', label: 'Bus 204', status: 'Stored', location: 'Miller SE', lastService: '2023-12-18', notes: 'Battery disconnected' },
    ],
    in_service: [
        { id: 'bus-205', label: 'Bus 205', status: 'On route', location: 'MOB1', lastService: '2024-01-03', notes: 'Running normal' },
        { id: 'bus-206', label: 'Bus 206', status: 'Standby', location: 'MOB2', lastService: '2024-01-06', notes: 'Ready for dispatch' },
        { id: 'bus-207', label: 'Bus 207', status: 'Charging', location: 'TOK North', lastService: '2024-01-02', notes: 'Charge check later' },
    ],
    long_term: [
        { id: 'bus-208', label: 'Bus 208', status: 'Body repair', location: 'TOK West', lastService: '2023-11-20', notes: 'Waiting for parts' },
    ],
    out_of_service: [
        { id: 'bus-209', label: 'Bus 209', status: 'Decommissioned', location: 'Miller BRT', lastService: '2023-10-01', notes: 'Do not dispatch' },
    ],
    },

};

export type BusLocation =
  | 'Miller BRT'
  | 'Miller SE'
  | 'MOB1'
  | 'MOB2'
  | 'TOK North'
  | 'TOK West';