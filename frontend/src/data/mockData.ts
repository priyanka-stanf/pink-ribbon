// Mock Data for CareCompass

export interface Hospital {
  id: string;
  name: string;
  type: 'Comprehensive Stroke Center' | 'Primary Stroke Center' | 'Community Hospital';
  address: string;
  city: string;
  zip: string;
  distance: number; // miles
  rating: number; // 0-5
  metrics: {
    independence90Day: number; // percentage
    independence90DayCI: number; // confidence interval +/-
    mortality30Day: number; // percentage
    estOutOfPocket: number; // dollars
    cmsTreatmentRate: number; // percentage
    doorToNeedle: number; // minutes
    beds: number;
  };
  details: {
    ownership: string;
    staff: number;
    safetyGrade: 'A' | 'B' | 'C' | 'D' | 'F';
    infectionRate: 'Better' | 'Average' | 'Worse';
    readmissionRate: 'Better' | 'Average' | 'Worse';
    complicationRate: 'Better' | 'Average' | 'Worse';
    volumeAnnual: number;
  };
  costs: {
    edEvaluation: number;
    imaging: number;
    medication: number;
    procedure: number;
    icu: number;
    rehab: number;
    total: number;
  };
  coordinates: {
    lat: number;
    lng: number;
  };
  isInNetwork: boolean;
}

export const HOSPITALS: Hospital[] = [
  {
    id: 'h1',
    name: 'Stanford Health Care',
    type: 'Comprehensive Stroke Center',
    address: '300 Pasteur Dr',
    city: 'Stanford',
    zip: '94305',
    distance: 4.2,
    rating: 4.8,
    metrics: {
      independence90Day: 63,
      independence90DayCI: 5,
      mortality30Day: 8.2,
      estOutOfPocket: 2400,
      cmsTreatmentRate: 87,
      doorToNeedle: 45,
      beds: 324,
    },
    details: {
      ownership: 'Non-profit',
      staff: 1500,
      safetyGrade: 'A',
      infectionRate: 'Better',
      readmissionRate: 'Average',
      complicationRate: 'Better',
      volumeAnnual: 450,
    },
    costs: {
      edEvaluation: 1200,
      imaging: 3500,
      medication: 8000,
      procedure: 25000,
      icu: 15000,
      rehab: 5000,
      total: 57700,
    },
    coordinates: { lat: 37.435, lng: -122.175 },
    isInNetwork: true,
  },
  {
    id: 'h2',
    name: 'Sequoia Hospital',
    type: 'Primary Stroke Center',
    address: '170 Alameda de las Pulgas',
    city: 'Redwood City',
    zip: '94062',
    distance: 8.5,
    rating: 4.2,
    metrics: {
      independence90Day: 47,
      independence90DayCI: 6,
      mortality30Day: 10.5,
      estOutOfPocket: 1800,
      cmsTreatmentRate: 71,
      doorToNeedle: 58,
      beds: 200,
    },
    details: {
      ownership: 'Non-profit',
      staff: 800,
      safetyGrade: 'B',
      infectionRate: 'Average',
      readmissionRate: 'Worse',
      complicationRate: 'Average',
      volumeAnnual: 180,
    },
    costs: {
      edEvaluation: 900,
      imaging: 2800,
      medication: 7500,
      procedure: 0, // Not applicable or transferred
      icu: 12000,
      rehab: 4000,
      total: 27200,
    },
    coordinates: { lat: 37.485, lng: -122.255 },
    isInNetwork: true,
  },
  {
    id: 'h3',
    name: 'Kaiser Permanente Redwood City',
    type: 'Comprehensive Stroke Center',
    address: '1150 Veterans Blvd',
    city: 'Redwood City',
    zip: '94063',
    distance: 9.1,
    rating: 4.5,
    metrics: {
      independence90Day: 59,
      independence90DayCI: 4,
      mortality30Day: 9.1,
      estOutOfPocket: 500, // Kaiser often lower out of pocket for members
      cmsTreatmentRate: 82,
      doorToNeedle: 42,
      beds: 240,
    },
    details: {
      ownership: 'Private',
      staff: 1100,
      safetyGrade: 'A',
      infectionRate: 'Better',
      readmissionRate: 'Better',
      complicationRate: 'Better',
      volumeAnnual: 320,
    },
    costs: {
      edEvaluation: 0,
      imaging: 0,
      medication: 0,
      procedure: 0,
      icu: 0,
      rehab: 0,
      total: 0, // Simplified for Kaiser model
    },
    coordinates: { lat: 37.495, lng: -122.215 },
    isInNetwork: false,
  },
   {
    id: 'h4',
    name: 'El Camino Health',
    type: 'Comprehensive Stroke Center',
    address: '2500 Grant Rd',
    city: 'Mountain View',
    zip: '94040',
    distance: 12.3,
    rating: 4.7,
    metrics: {
      independence90Day: 61,
      independence90DayCI: 5,
      mortality30Day: 8.5,
      estOutOfPocket: 2600,
      cmsTreatmentRate: 85,
      doorToNeedle: 40,
      beds: 300,
    },
    details: {
      ownership: 'Non-profit',
      staff: 1400,
      safetyGrade: 'A',
      infectionRate: 'Better',
      readmissionRate: 'Average',
      complicationRate: 'Better',
      volumeAnnual: 400,
    },
    costs: {
      edEvaluation: 1300,
      imaging: 3600,
      medication: 8200,
      procedure: 26000,
      icu: 16000,
      rehab: 5200,
      total: 59300,
    },
    coordinates: { lat: 37.365, lng: -122.085 },
    isInNetwork: true,
  },
];

export const MOCK_SIMULATION_DATA = {
  distribution: Array.from({ length: 100 }, (_, i) => {
    // Generate a bell-ish curve for 0-6 MRS score
    const x = i / 100 * 6;
    // Normal distribution formula approx
    const mean = 2.1;
    const stdDev = 1.2;
    const y = (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mean) / stdDev, 2));
    return { x, y: y * 100 };
  }),
  variance: [
    { name: 'Time-to-Treatment', value: 52, fill: '#00BFB3', type: 'Modifiable' },
    { name: 'Hospital Capability', value: 21, fill: '#C09BB9', type: 'Fixed' },
    { name: 'Rehab Access', value: 17, fill: '#F59E0B', type: 'Modifiable' }, // Amber
    { name: 'Insurance Friction', value: 10, fill: '#9CA3AF', type: 'Modifiable' }, // Gray
  ],
  boxPlot: HOSPITALS.map(h => ({
    name: h.name.split(' ')[0], // Shortened name
    fullName: h.name,
    outcome: h.metrics.independence90Day,
    cost: h.metrics.estOutOfPocket,
    // Box plot quartiles for outcome
    min: h.metrics.independence90Day - 15,
    q1: h.metrics.independence90Day - 8,
    median: h.metrics.independence90Day,
    q3: h.metrics.independence90Day + 6,
    max: h.metrics.independence90Day + 12,
    isCurrent: h.id === 'h1',
    type: h.type
  })),
  scatter: HOSPITALS.map(h => ({
    id: h.id,
    x: h.metrics.estOutOfPocket,
    y: h.metrics.independence90Day,
    name: h.name,
    isCurrent: h.id === 'h1'
  })),
  timeImpact: [
    { time: 0, prob: 75, scenario: 'best' },
    { time: 15, prob: 72, scenario: 'best' },
    { time: 30, prob: 68, scenario: 'yours' },
    { time: 45, prob: 63, scenario: 'yours' }, // Current
    { time: 60, prob: 58, scenario: 'delayed' },
    { time: 90, prob: 45, scenario: 'delayed' },
  ]
};