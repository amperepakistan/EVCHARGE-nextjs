import type {
  MockAnprCapture,
  MockCamera,
  MockFault,
  MockHealth,
  MockMaintenanceJob,
  MockParkingBay,
  MockPart,
  MockRevenuePoint,
  MockSession,
  MockTariff,
  MockTeamMember,
} from '@/lib/mock/types';

export const mockHealth: MockHealth[] = [
  {
    terminalId: 't-khi-dha-01',
    healthScore: 98,
    internalTempC: 34,
    connectorTempC: 41,
    voltageV: 398,
    currentA: 118,
    powerKw: 47,
    coolingFanOk: true,
    doorClosed: true,
    contactorOk: true,
    isolationOk: true,
    communicationOk: true,
    lastHeartbeat: '12 seconds ago',
    recommendations: [],
  },
  {
    terminalId: 't-khi-dolmen-01',
    healthScore: 91,
    internalTempC: 46,
    connectorTempC: 58,
    voltageV: 401,
    currentA: 96,
    powerKw: 38,
    coolingFanOk: true,
    doorClosed: true,
    contactorOk: true,
    isolationOk: true,
    communicationOk: true,
    lastHeartbeat: '8 seconds ago',
    recommendations: ['Connector temperature trending high — inspect at next visit.'],
  },
  {
    terminalId: 't-mux-cantt-01',
    healthScore: 42,
    internalTempC: 71,
    connectorTempC: 79,
    voltageV: 372,
    currentA: 0,
    powerKw: 0,
    coolingFanOk: false,
    doorClosed: true,
    contactorOk: true,
    isolationOk: true,
    communicationOk: true,
    lastHeartbeat: '3 minutes ago',
    recommendations: [
      'Cooling fan not responding — replace fan assembly.',
      'Internal temperature above safe threshold; unit has derated to 0 kW.',
      'Voltage instability detected across 6 of the last 10 sessions.',
    ],
  },
  {
    terminalId: 't-lhr-dha-01',
    healthScore: 55,
    internalTempC: 29,
    connectorTempC: 30,
    voltageV: 0,
    currentA: 0,
    powerKw: 0,
    coolingFanOk: true,
    doorClosed: false,
    contactorOk: true,
    isolationOk: true,
    communicationOk: false,
    lastHeartbeat: '2 hours ago',
    recommendations: [
      'No heartbeat for 2 hours — check site connectivity.',
      'Enclosure door reported open.',
    ],
  },
  {
    terminalId: 't-lhr-gulberg-01',
    healthScore: 96,
    internalTempC: 36,
    connectorTempC: 44,
    voltageV: 399,
    currentA: 210,
    powerKw: 84,
    coolingFanOk: true,
    doorClosed: true,
    contactorOk: true,
    isolationOk: true,
    communicationOk: true,
    lastHeartbeat: '5 seconds ago',
    recommendations: [],
  },
  {
    terminalId: 't-rwp-saddar-01',
    healthScore: 88,
    internalTempC: 39,
    connectorTempC: 47,
    voltageV: 396,
    currentA: 102,
    powerKw: 40,
    coolingFanOk: true,
    doorClosed: true,
    contactorOk: true,
    isolationOk: true,
    communicationOk: true,
    lastHeartbeat: '20 seconds ago',
    recommendations: ['Charger approaching 12-month service interval.'],
  },
];

export const mockFaults: MockFault[] = [
  {
    id: 'flt-001',
    terminalId: 't-mux-cantt-01',
    code: 'TEMP_HIGH',
    label: 'Internal temperature fault',
    severity: 'critical',
    status: 'active',
    detectedAt: '2026-08-02 09:14',
    assignedTo: 'Adnan Raza',
    ticketId: 'MNT-3312',
  },
  {
    id: 'flt-002',
    terminalId: 't-lhr-dha-01',
    code: 'COMM_LOSS',
    label: 'Communication failure',
    severity: 'critical',
    status: 'active',
    detectedAt: '2026-08-02 07:40',
    assignedTo: null,
    ticketId: null,
  },
  {
    id: 'flt-003',
    terminalId: 't-khi-dolmen-01',
    code: 'CONN_TEMP',
    label: 'Connector temperature warning',
    severity: 'minor',
    status: 'acknowledged',
    detectedAt: '2026-08-01 18:02',
    assignedTo: 'Hira Malik',
    ticketId: 'MNT-3308',
  },
  {
    id: 'flt-004',
    terminalId: 't-psh-ring-01',
    code: 'GND_FAULT',
    label: 'Ground fault detected',
    severity: 'major',
    status: 'resolved',
    detectedAt: '2026-07-29 11:26',
    assignedTo: 'Adnan Raza',
    ticketId: 'MNT-3290',
  },
  {
    id: 'flt-005',
    terminalId: 't-khi-dha-01',
    code: 'LOCK_FAIL',
    label: 'Connector lock failure',
    severity: 'minor',
    status: 'resolved',
    detectedAt: '2026-07-27 15:11',
    assignedTo: 'Hira Malik',
    ticketId: 'MNT-3281',
  },
];

export const mockMaintenance: MockMaintenanceJob[] = [
  {
    id: 'MNT-3312',
    terminalId: 't-mux-cantt-01',
    title: 'Replace cooling fan assembly',
    status: 'in_progress',
    scheduledFor: '2026-08-02',
    technician: 'Adnan Raza',
    partsUsed: ['FAN-120-DC'],
  },
  {
    id: 'MNT-3308',
    terminalId: 't-khi-dolmen-01',
    title: 'Inspect connector thermal paste',
    status: 'scheduled',
    scheduledFor: '2026-08-05',
    technician: 'Hira Malik',
    partsUsed: [],
  },
  {
    id: 'MNT-3315',
    terminalId: 't-rwp-saddar-01',
    title: '12-month preventive service',
    status: 'scheduled',
    scheduledFor: '2026-08-09',
    technician: 'Adnan Raza',
    partsUsed: [],
  },
  {
    id: 'MNT-3290',
    terminalId: 't-psh-ring-01',
    title: 'Ground fault investigation',
    status: 'completed',
    scheduledFor: '2026-07-29',
    technician: 'Adnan Raza',
    partsUsed: ['RCD-40A', 'CBL-GND-2M'],
  },
];

export const mockParts: MockPart[] = [
  { sku: 'FAN-120-DC', name: 'Cooling fan, 120mm DC', inStock: 3, reorderAt: 4 },
  { sku: 'CCS2-CBL-5M', name: 'CCS2 cable assembly, 5m', inStock: 6, reorderAt: 3 },
  { sku: 'RCD-40A', name: 'Residual current device, 40A', inStock: 2, reorderAt: 3 },
  { sku: 'PWR-MOD-30', name: 'Power module, 30 kW', inStock: 1, reorderAt: 2 },
  { sku: 'CBL-GND-2M', name: 'Grounding cable, 2m', inStock: 11, reorderAt: 5 },
];

export const mockTeam: MockTeamMember[] = [
  {
    id: 'tm-1',
    name: 'Bilal Ahmed',
    email: 'bilal@voltgrid.pk',
    role: 'Station Manager',
    active: true,
    lastActive: '2 minutes ago',
  },
  {
    id: 'tm-2',
    name: 'Adnan Raza',
    email: 'adnan@voltgrid.pk',
    role: 'Technician',
    active: true,
    lastActive: '18 minutes ago',
  },
  {
    id: 'tm-3',
    name: 'Hira Malik',
    email: 'hira@voltgrid.pk',
    role: 'Technician',
    active: true,
    lastActive: '1 hour ago',
  },
  {
    id: 'tm-4',
    name: 'Faisal Nadeem',
    email: 'faisal@voltgrid.pk',
    role: 'Finance',
    active: true,
    lastActive: 'Yesterday',
  },
  {
    id: 'tm-5',
    name: 'Ayesha Khan',
    email: 'ayesha@voltgrid.pk',
    role: 'Support Agent',
    active: false,
    lastActive: '3 weeks ago',
  },
  {
    id: 'tm-6',
    name: 'Usman Tariq',
    email: 'usman@voltgrid.pk',
    role: 'Operator',
    active: true,
    lastActive: '5 hours ago',
  },
];

export const mockTariffs: MockTariff[] = [
  {
    id: 'tar-flat',
    name: 'Standard DC',
    model: 'flat',
    summary: 'OMR 0.052 / kWh, all hours',
    appliedToTerminalIds: ['t-khi-dha-01', 't-rwp-saddar-01'],
  },
  {
    id: 'tar-peak',
    name: 'Metro Peak/Off-peak',
    model: 'dynamic',
    summary: 'OMR 0.058 peak (18:00–23:00) · OMR 0.042 off-peak',
    appliedToTerminalIds: ['t-khi-dolmen-01', 't-lhr-gulberg-01'],
  },
  {
    id: 'tar-hybrid',
    name: 'Motorway Hybrid',
    model: 'hybrid',
    summary: 'OMR 0.048 / kWh + OMR 0.020 / min occupancy',
    appliedToTerminalIds: ['t-hyd-m9-01', 't-mux-cantt-01'],
  },
  {
    id: 'tar-ac',
    name: 'AC Destination',
    model: 'time',
    summary: 'OMR 0.012 / min, capped at OMR 1.800',
    appliedToTerminalIds: ['t-khi-korangi-01', 't-isb-f7-01'],
  },
];

export const mockSessions: MockSession[] = [
  {
    id: 'ses-9001',
    terminalId: 't-khi-dolmen-01',
    driverLabel: '+968 912 •••4412',
    startedAt: '2026-08-02 09:02',
    endedAt: null,
    kwhDelivered: 21.4,
    amountCharged: 1.027,
  },
  {
    id: 'ses-9000',
    terminalId: 't-isb-f7-01',
    driverLabel: '+968 923 •••8890',
    startedAt: '2026-08-02 08:41',
    endedAt: null,
    kwhDelivered: 7.2,
    amountCharged: 0.274,
  },
  {
    id: 'ses-8998',
    terminalId: 't-khi-dha-01',
    driverLabel: '+968 934 •••1120',
    startedAt: '2026-08-02 07:15',
    endedAt: '2026-08-02 08:02',
    kwhDelivered: 38.6,
    amountCharged: 2.007,
  },
  {
    id: 'ses-8995',
    terminalId: 't-lhr-gulberg-01',
    driverLabel: '+968 945 •••7734',
    startedAt: '2026-08-01 21:30',
    endedAt: '2026-08-01 22:11',
    kwhDelivered: 54.1,
    amountCharged: 2.759,
  },
  {
    id: 'ses-8990',
    terminalId: 't-khi-dolmen-01',
    driverLabel: '+968 956 •••2201',
    startedAt: '2026-08-01 17:05',
    endedAt: null,
    kwhDelivered: 0,
    amountCharged: 0,
    noShow: true,
  },
];

/** 14 days of trend data for the revenue and analytics charts. */
export const mockRevenueSeries: MockRevenuePoint[] = [
  { date: 'Jul 20', revenue: 51, energyKwh: 980 },
  { date: 'Jul 21', revenue: 49, energyKwh: 926 },
  { date: 'Jul 22', revenue: 57, energyKwh: 1078 },
  { date: 'Jul 23', revenue: 60, energyKwh: 1138 },
  { date: 'Jul 24', revenue: 65, energyKwh: 1240 },
  { date: 'Jul 25', revenue: 77, energyKwh: 1462 },
  { date: 'Jul 26', revenue: 74, energyKwh: 1400 },
  { date: 'Jul 27', revenue: 55, energyKwh: 1045 },
  { date: 'Jul 28', revenue: 58, energyKwh: 1100 },
  { date: 'Jul 29', revenue: 55, energyKwh: 1050 },
  { date: 'Jul 30', revenue: 62, energyKwh: 1183 },
  { date: 'Jul 31', revenue: 69, energyKwh: 1316 },
  { date: 'Aug 01', revenue: 79, energyKwh: 1504 },
  { date: 'Aug 02', revenue: 36, energyKwh: 676 },
];

/** Hour-of-day utilisation for the owner analytics page. */
export const mockHourlyUsage = [
  { hour: '06', sessions: 2 },
  { hour: '08', sessions: 6 },
  { hour: '10', sessions: 9 },
  { hour: '12', sessions: 12 },
  { hour: '14', sessions: 10 },
  { hour: '16', sessions: 14 },
  { hour: '18', sessions: 21 },
  { hour: '20', sessions: 18 },
  { hour: '22', sessions: 8 },
];

export const mockCameras: MockCamera[] = [
  { id: 'cam-1', label: 'Bay 1 — overhead', online: true, terminalId: 't-khi-dolmen-01' },
  { id: 'cam-2', label: 'Bay 2 — overhead', online: true, terminalId: 't-khi-dolmen-01' },
  { id: 'cam-3', label: 'Entrance barrier', online: true, terminalId: 't-khi-dha-01' },
  { id: 'cam-4', label: 'Rear lot', online: false, terminalId: 't-khi-dha-01' },
];

export const mockAnpr: MockAnprCapture[] = [
  {
    id: 'anpr-1',
    plate: 'ABC-12D',
    capturedAt: '2026-08-02 09:01',
    listStatus: 'whitelist',
    terminalId: 't-khi-dolmen-01',
  },
  {
    id: 'anpr-2',
    plate: 'DEF-34G',
    capturedAt: '2026-08-02 08:47',
    listStatus: 'unknown',
    terminalId: 't-khi-dolmen-01',
  },
  {
    id: 'anpr-3',
    plate: 'HIJ-56K',
    capturedAt: '2026-08-02 08:12',
    listStatus: 'blacklist',
    terminalId: 't-khi-dha-01',
  },
  {
    id: 'anpr-4',
    plate: 'LMN-78P',
    capturedAt: '2026-08-01 22:30',
    listStatus: 'whitelist',
    terminalId: 't-khi-dha-01',
  },
];

export const mockParkingBays: MockParkingBay[] = [
  { id: 'bay-1', label: 'Bay 1', occupiedBy: 'ev', overstayMinutes: 0 },
  { id: 'bay-2', label: 'Bay 2', occupiedBy: 'ev', overstayMinutes: 47 },
  { id: 'bay-3', label: 'Bay 3', occupiedBy: 'ice', overstayMinutes: 132 },
  { id: 'bay-4', label: 'Bay 4', occupiedBy: null, overstayMinutes: 0 },
];

export function healthFor(terminalId: string): MockHealth | undefined {
  return mockHealth.find((h) => h.terminalId === terminalId);
}

export function faultsFor(terminalId: string): MockFault[] {
  return mockFaults.filter((f) => f.terminalId === terminalId);
}

export function maintenanceFor(terminalId: string): MockMaintenanceJob[] {
  return mockMaintenance.filter((m) => m.terminalId === terminalId);
}

export function sessionsForTerminals(terminalIds: string[]): MockSession[] {
  return mockSessions.filter((s) => terminalIds.includes(s.terminalId));
}
