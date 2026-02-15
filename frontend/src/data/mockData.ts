// Mock Data for PinkRibbon

export interface Hospital {
  id: string;
  name: string;
  type: string;
  address: string;
  city: string;
  zip: string;
  distance: number; // miles
  rating: number; // 0-5
  metrics: {
    overallRating: number; // 1-5 stars
    mspbComparison: number; // Medicare Spending Per Beneficiary ratio (<1 is cheaper)
    mortalityComparison: number; // 1-5 scale
    safetyComparison: number; // 1-5 scale
    readmissionComparison: number; // 1-5 scale
    patientExperience: number; // 1-5 scale
    estOutOfPocket: number; // dollars
  };
  details: {
    ownership: string;
    beds: number;
    accreditations: string[];
    languages: string[];
  };
  coordinates: {
    lat: number;
    lng: number;
  };
  isInNetwork: boolean;
  offersTreatments: string[]; // List of treatment plan IDs
}

export const HOSPITALS: Hospital[] = [
  {
    id: 'h1',
    name: 'Stanford Health Care',
    type: 'Academic Medical Center',
    address: '300 Pasteur Dr',
    city: 'Stanford',
    zip: '94305',
    distance: 4.2,
    rating: 4.8,
    metrics: {
      overallRating: 5.0,
      mspbComparison: 1.05, // Slightly more expensive
      mortalityComparison: 5,
      safetyComparison: 5,
      readmissionComparison: 4,
      patientExperience: 5,
      estOutOfPocket: 3200,
    },
    details: {
      ownership: 'Non-profit',
      beds: 613,
      accreditations: ['NCI Comprehensive Cancer Center', 'Magnet Recognition'],
      languages: ['English', 'Spanish', 'Mandarin', 'Vietnamese'],
    },
    coordinates: { lat: 37.435, lng: -122.175 },
    isInNetwork: true,
    offersTreatments: ['t1', 't2', 't3', 't4', 't5'],
  },
  {
    id: 'h2',
    name: 'Sequoia Hospital',
    type: 'Community Hospital',
    address: '170 Alameda de las Pulgas',
    city: 'Redwood City',
    zip: '94062',
    distance: 8.5,
    rating: 4.2,
    metrics: {
      overallRating: 4.0,
      mspbComparison: 0.92, // Cheaper
      mortalityComparison: 4,
      safetyComparison: 4,
      readmissionComparison: 3,
      patientExperience: 4,
      estOutOfPocket: 1800,
    },
    details: {
      ownership: 'Dignity Health',
      beds: 208,
      accreditations: ['Joint Commission'],
      languages: ['English', 'Spanish'],
    },
    coordinates: { lat: 37.485, lng: -122.255 },
    isInNetwork: true,
    offersTreatments: ['t1', 't2'],
  },
  {
    id: 'h3',
    name: 'Kaiser Permanente Redwood City',
    type: 'Integrated Health System',
    address: '1150 Veterans Blvd',
    city: 'Redwood City',
    zip: '94063',
    distance: 9.1,
    rating: 4.5,
    metrics: {
      overallRating: 5.0,
      mspbComparison: 0.85, // Much cheaper/efficient
      mortalityComparison: 5,
      safetyComparison: 5,
      readmissionComparison: 5,
      patientExperience: 4,
      estOutOfPocket: 500,
    },
    details: {
      ownership: 'Non-profit',
      beds: 149,
      accreditations: ['Joint Commission', 'Stroke Center'],
      languages: ['English', 'Spanish', 'Tagalog'],
    },
    coordinates: { lat: 37.495, lng: -122.215 },
    isInNetwork: false,
    offersTreatments: ['t1', 't2', 't3'],
  },
   {
    id: 'h4',
    name: 'El Camino Health',
    type: 'Community Hospital',
    address: '2500 Grant Rd',
    city: 'Mountain View',
    zip: '94040',
    distance: 12.3,
    rating: 4.7,
    metrics: {
      overallRating: 5.0,
      mspbComparison: 0.98, // Average
      mortalityComparison: 5,
      safetyComparison: 5,
      readmissionComparison: 4,
      patientExperience: 5,
      estOutOfPocket: 2400,
    },
    details: {
      ownership: 'Non-profit District',
      beds: 443,
      accreditations: ['Magnet Recognition'],
      languages: ['English', 'Spanish', 'Mandarin', 'Hindi'],
    },
    coordinates: { lat: 37.365, lng: -122.085 },
    isInNetwork: true,
    offersTreatments: ['t1', 't2', 't3', 't4'],
  },
];

export const TREATMENT_PLANS = [
  {
    id: 't1',
    name: 'Lumpectomy + Radiation',
    description: 'Breast-conserving surgery followed by radiation therapy to eliminate remaining cancer cells.',
    icon: 'activity',
    recommended: true,
    simulation: {
      survival10Year: 88,
      recurrence5Year: 92,
      overallSurvival20Year: 78,
      qalys: 14.2,
      costTotal: 125000,
      costPocket: 30000,
      toxicities: {
        acute: [
          { name: 'Skin Reaction', value: 30, range: [20, 40] },
          { name: 'Fatigue', value: 25, range: [15, 35] }
        ],
        longTerm: [
          { name: 'Cosmetic Outcome', value: 7.5, max: 10 },
          { name: 'Lymphedema', value: 5, range: [2, 8] }
        ]
      }
    }
  },
  {
    id: 't2',
    name: 'Mastectomy',
    description: 'Surgical removal of the entire breast, with or without immediate reconstruction.',
    icon: 'shield',
    recommended: false,
    simulation: {
      survival10Year: 89, // Similar to lumpectomy+rad
      recurrence5Year: 94, // Slightly better local control
      overallSurvival20Year: 79,
      qalys: 13.5, // Lower due to body image/recovery
      costTotal: 95000,
      costPocket: 22000,
      toxicities: {
        acute: [
          { name: 'Surgical Complications', value: 12, range: [8, 16] },
          { name: 'Pain', value: 40, range: [30, 50] }
        ],
        longTerm: [
          { name: 'Cosmetic Outcome', value: 4.2, max: 10 },
          { name: 'Lymphedema', value: 15, range: [10, 20] }
        ]
      }
    }
  },
  {
    id: 't3',
    name: 'Chemotherapy + Surgery',
    description: 'Systemic therapy to shrink tumor before surgery (neoadjuvant) or after (adjuvant).',
    icon: 'zap',
    recommended: false,
    simulation: {
      survival10Year: 82,
      recurrence5Year: 85,
      overallSurvival20Year: 70,
      qalys: 12.8,
      costTotal: 180000,
      costPocket: 45000,
      toxicities: {
        acute: [
          { name: 'Neutropenia', value: 15, range: [10, 20] },
          { name: 'Nausea', value: 60, range: [50, 70] }
        ],
        longTerm: [
          { name: 'Neuropathy', value: 12, range: [8, 16] },
          { name: 'Cardiotoxicity', value: 2, range: [1, 4] }
        ]
      }
    }
  },
  {
    id: 't4',
    name: 'HER2-Targeted Therapy',
    description: 'Specialized drugs (e.g., Trastuzumab) that target HER2 protein on cancer cells.',
    icon: 'target',
    recommended: false, // Only if HER2+
    simulation: {
      survival10Year: 90, // Excellent for HER2+
      recurrence5Year: 93,
      overallSurvival20Year: 82,
      qalys: 14.5,
      costTotal: 250000,
      costPocket: 15000, // Often high coverage but expensive
      toxicities: {
        acute: [
          { name: 'Infusion Reaction', value: 5, range: [2, 8] }
        ],
        longTerm: [
          { name: 'Cardiotoxicity', value: 8, range: [4, 12] }
        ]
      }
    }
  },
  {
    id: 't5',
    name: 'Clinical Trial Enrollment',
    description: 'Access to novel therapies like immunotherapies or new targeted agents.',
    icon: 'flask',
    recommended: false,
    simulation: {
      survival10Year: 91, // Potential for better outcome
      recurrence5Year: 95,
      overallSurvival20Year: 83,
      qalys: 14.0,
      costTotal: 50000, // Often subsidized
      costPocket: 5000,
      toxicities: {
        acute: [
          { name: 'Unknown/Variable', value: 20, range: [10, 30] }
        ],
        longTerm: [
          { name: 'Unknown', value: 10, range: [5, 15] }
        ]
      }
    }
  }
];

// Generate bell curve data for charts
export const generateDistributionData = (mean: number, stdDev: number) => {
  return Array.from({ length: 50 }, (_, i) => {
    // x range from 0 to 100% survival probability? Or outcome score?
    // Let's model X as "Years of Disease Free Survival" or similar score, but prompt asks for probability density
    // Prompt: X-axis Outcome categories (Survival). 
    // Let's just make a nice curve centered around the mean.
    const x = 50 + i; // 50% to 100%
    const y = (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mean) / stdDev, 2));
    return { x, y: y * 100 };
  });
};
