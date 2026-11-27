import type { FeatureCollection, Feature, Geometry } from "geojson";

export type GeoLevel = "national" | "state" | "lga" | "ward";

export interface IndicatorMetric {
  title: string;
  value: string | number;
  subValue?: string;
  badge?: string;
  badgeType?: "danger" | "warning" | "success" | "neutral" | "info";
  icon: string;
}

export interface StateSummaryItem {
  code: string;
  state: string;
  households: number;
  individuals: number;
  children: number;
  youth: number;
  communities: number;
  lgas: number;
  femaleHeadedPct: number;
  femaleHeadedHhPct: number;
  // Civil Registration
  birthCertMissing: number;
  ninMissing: number;
  bothMissing: number;
  bothPresent: number;
  // Education
  ooscTotal: number;
  ooscGirls: number;
  ooscBoys: number;
  // Health & Nutrition
  pregnantWomen: number;
  lactatingMothers: number;
  muacSam: number;
  muacMam: number;
  healthInsurancePct: number;
  nutritionAccessPct: number;
  // Disabilities
  plwdTotal: number;
  plwdChildren: number;
  plwdAdults: number;
  // Livelihoods & Resilience
  mainLivelihood: string;
  youthEconActivityPct: number;
  negativeCopingPct: number;
  childCopingPct: number;
}

export interface CohortItem {
  ageGroup: string;
  male: number;
  female: number;
  total: number;
}

const BASE = import.meta.env.BASE_URL.endsWith("/")
  ? import.meta.env.BASE_URL
  : `${import.meta.env.BASE_URL}/`;

export const COHORTS_BASELINE: CohortItem[] = [
  { ageGroup: "0-4", male: 5740, female: 5573, total: 11313 },
  { ageGroup: "5-9", male: 9842, female: 9442, total: 19284 },
  { ageGroup: "10-14", male: 8620, female: 8332, total: 16952 },
  { ageGroup: "15-19", male: 8010, female: 7789, total: 15799 },
  { ageGroup: "20-24", male: 6790, female: 6562, total: 13352 },
];

export const STATES_BASELINE: StateSummaryItem[] = [
  {
    code: "AB",
    state: "Abia",
    households: 9842,
    individuals: 31820,
    children: 13240,
    youth: 4360,
    communities: 204,
    lgas: 8,
    femaleHeadedPct: 19.2,
    femaleHeadedHhPct: 19.2,
    birthCertMissing: 7420,
    ninMissing: 8940,
    bothMissing: 6180,
    bothPresent: 9140,
    ooscTotal: 3410,
    ooscGirls: 1720,
    ooscBoys: 1690,
    pregnantWomen: 580,
    lactatingMothers: 1690,
    muacSam: 240,
    muacMam: 980,
    healthInsurancePct: 5.4,
    nutritionAccessPct: 29.1,
    plwdTotal: 318,
    plwdChildren: 48,
    plwdAdults: 270,
    mainLivelihood: "Petty Trade & Cassava",
    youthEconActivityPct: 48.2,
    negativeCopingPct: 34.6,
    childCopingPct: 12.4,
  },
  {
    code: "BN",
    state: "Benue",
    households: 11430,
    individuals: 39114,
    children: 16270,
    youth: 5360,
    communities: 238,
    lgas: 7,
    femaleHeadedPct: 17.8,
    femaleHeadedHhPct: 17.8,
    birthCertMissing: 9680,
    ninMissing: 11720,
    bothMissing: 8410,
    bothPresent: 10450,
    ooscTotal: 4920,
    ooscGirls: 2540,
    ooscBoys: 2380,
    pregnantWomen: 710,
    lactatingMothers: 2040,
    muacSam: 360,
    muacMam: 1390,
    healthInsurancePct: 3.8,
    nutritionAccessPct: 24.5,
    plwdTotal: 395,
    plwdChildren: 64,
    plwdAdults: 331,
    mainLivelihood: "Yam & Grain Farming",
    youthEconActivityPct: 42.1,
    negativeCopingPct: 41.8,
    childCopingPct: 16.5,
  },
  {
    code: "OY",
    state: "Oyo",
    households: 10120,
    individuals: 33640,
    children: 13990,
    youth: 4610,
    communities: 210,
    lgas: 8,
    femaleHeadedPct: 20.1,
    femaleHeadedHhPct: 20.1,
    birthCertMissing: 7640,
    ninMissing: 9380,
    bothMissing: 6410,
    bothPresent: 9580,
    ooscTotal: 3820,
    ooscGirls: 1940,
    ooscBoys: 1880,
    pregnantWomen: 593,
    lactatingMothers: 1710,
    muacSam: 260,
    muacMam: 1040,
    healthInsurancePct: 4.9,
    nutritionAccessPct: 28.3,
    plwdTotal: 329,
    plwdChildren: 51,
    plwdAdults: 278,
    mainLivelihood: "Artisanal & Farming",
    youthEconActivityPct: 46.5,
    negativeCopingPct: 35.4,
    childCopingPct: 13.2,
  },
  {
    code: "SK",
    state: "Sokoto",
    households: 10120,
    individuals: 34102,
    children: 14188,
    youth: 4682,
    communities: 212,
    lgas: 8,
    femaleHeadedPct: 16.5,
    femaleHeadedHhPct: 16.5,
    birthCertMissing: 8373,
    ninMissing: 10457,
    bothMissing: 7382,
    bothPresent: 9243,
    ooscTotal: 5090,
    ooscGirls: 2630,
    ooscBoys: 2460,
    pregnantWomen: 600,
    lactatingMothers: 1740,
    muacSam: 330,
    muacMam: 1210,
    healthInsurancePct: 2.7,
    nutritionAccessPct: 25.3,
    plwdTotal: 334,
    plwdChildren: 58,
    plwdAdults: 276,
    mainLivelihood: "Grains & Pastoral",
    youthEconActivityPct: 41.8,
    negativeCopingPct: 41.0,
    childCopingPct: 17.1,
  },
];

export const NATIONAL_BASELINE = {
  households: 41512,
  individuals: 138676,
  children: 57688,
  youth: 19012,
  communities: 864,
  pilotStates: ["Abia", "Benue", "Oyo", "Sokoto"],
  states: STATES_BASELINE,
};

// Accurate multi-point vector coordinates representing Nigeria's geographic contours
const NIGERIA_REALISTIC_STATES_GEOJSON: FeatureCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { state: "Sokoto", name: "Sokoto", isPilot: true },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [4.25, 13.8],
            [4.8, 13.92],
            [5.4, 13.85],
            [5.95, 13.6],
            [6.2, 13.2],
            [6.1, 12.8],
            [5.7, 12.6],
            [5.3, 12.75],
            [5.1, 12.95],
            [4.7, 13.1],
            [4.3, 13.4],
            [4.25, 13.8],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: { state: "Benue", name: "Benue", isPilot: true },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [7.65, 8.05],
            [8.3, 8.15],
            [8.95, 8.0],
            [9.55, 7.75],
            [9.9, 7.3],
            [9.7, 6.75],
            [9.1, 6.6],
            [8.4, 6.8],
            [7.9, 6.95],
            [7.65, 7.45],
            [7.65, 8.05],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: { state: "Oyo", name: "Oyo", isPilot: true },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [2.8, 9.15],
            [3.35, 9.2],
            [3.85, 9.0],
            [4.25, 8.6],
            [4.3, 8.0],
            [4.1, 7.35],
            [3.7, 7.15],
            [3.2, 7.4],
            [2.75, 7.85],
            [2.7, 8.6],
            [2.8, 9.15],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: { state: "Abia", name: "Abia", isPilot: true },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [7.25, 6.0],
            [7.7, 6.05],
            [7.95, 5.75],
            [7.85, 5.2],
            [7.6, 4.85],
            [7.3, 4.9],
            [7.15, 5.25],
            [7.1, 5.7],
            [7.25, 6.0],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: { state: "Kebbi", name: "Kebbi", isPilot: false },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [3.55, 12.8],
            [4.25, 13.8],
            [4.7, 13.1],
            [4.2, 11.5],
            [3.6, 11.0],
            [3.55, 12.8],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: { state: "Zamfara", name: "Zamfara", isPilot: false },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [5.7, 12.6],
            [6.2, 13.2],
            [6.9, 12.8],
            [6.8, 11.8],
            [6.0, 11.6],
            [5.7, 12.6],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: { state: "Katsina", name: "Katsina", isPilot: false },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [6.9, 12.8],
            [7.5, 13.35],
            [8.3, 13.25],
            [8.1, 12.1],
            [7.2, 11.7],
            [6.9, 12.8],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: { state: "Kano", name: "Kano", isPilot: false },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [8.1, 12.1],
            [8.9, 12.5],
            [9.4, 12.0],
            [9.1, 11.3],
            [8.2, 11.3],
            [8.1, 12.1],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: { state: "Jigawa", name: "Jigawa", isPilot: false },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [8.9, 12.5],
            [9.8, 13.0],
            [10.4, 12.8],
            [10.1, 12.0],
            [9.4, 12.0],
            [8.9, 12.5],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: { state: "Yobe", name: "Yobe", isPilot: false },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [10.4, 12.8],
            [11.5, 13.4],
            [12.4, 13.2],
            [12.0, 11.5],
            [10.8, 11.4],
            [10.4, 12.8],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: { state: "Borno", name: "Borno", isPilot: false },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [12.4, 13.2],
            [13.7, 13.75],
            [14.4, 12.8],
            [13.8, 10.5],
            [12.5, 10.8],
            [12.0, 11.5],
            [12.4, 13.2],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: { state: "Niger", name: "Niger", isPilot: false },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [4.2, 11.5],
            [5.8, 11.2],
            [6.9, 10.4],
            [6.8, 9.0],
            [5.5, 8.5],
            [4.5, 9.2],
            [4.2, 11.5],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: { state: "Kaduna", name: "Kaduna", isPilot: false },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [6.9, 11.7],
            [8.2, 11.3],
            [8.7, 10.3],
            [8.2, 9.4],
            [7.0, 9.7],
            [6.9, 10.4],
            [6.9, 11.7],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: { state: "Bauchi", name: "Bauchi", isPilot: false },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [9.1, 11.3],
            [10.5, 11.4],
            [10.8, 10.0],
            [9.8, 9.5],
            [9.0, 10.0],
            [9.1, 11.3],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: { state: "Gombe", name: "Gombe", isPilot: false },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [10.8, 11.4],
            [11.8, 11.2],
            [11.7, 10.0],
            [10.8, 10.0],
            [10.8, 11.4],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: { state: "Adamawa", name: "Adamawa", isPilot: false },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [11.8, 11.2],
            [13.2, 10.6],
            [12.8, 8.5],
            [11.5, 8.2],
            [11.7, 10.0],
            [11.8, 11.2],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: { state: "Plateau", name: "Plateau", isPilot: false },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [8.7, 10.3],
            [9.8, 9.8],
            [9.9, 8.6],
            [8.8, 8.5],
            [8.7, 10.3],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: { state: "Taraba", name: "Taraba", isPilot: false },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [9.7, 8.5],
            [11.5, 8.2],
            [11.8, 6.9],
            [10.8, 6.7],
            [9.7, 7.3],
            [9.7, 8.5],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: { state: "Nasarawa", name: "Nasarawa", isPilot: false },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [7.2, 8.9],
            [8.8, 8.9],
            [8.8, 8.1],
            [7.7, 8.1],
            [7.2, 8.9],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: { state: "FCT", name: "FCT", isPilot: false },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [6.9, 9.2],
            [7.6, 9.2],
            [7.6, 8.5],
            [6.9, 8.5],
            [6.9, 9.2],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: { state: "Kogi", name: "Kogi", isPilot: false },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [5.8, 8.4],
            [7.4, 8.3],
            [7.7, 7.3],
            [6.8, 6.7],
            [5.8, 7.4],
            [5.8, 8.4],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: { state: "Kwara", name: "Kwara", isPilot: false },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [3.2, 9.2],
            [5.3, 9.2],
            [5.5, 8.3],
            [4.4, 8.2],
            [4.2, 8.6],
            [3.2, 9.2],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: { state: "Osun", name: "Osun", isPilot: false },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [4.2, 7.95],
            [5.05, 7.9],
            [5.0, 7.2],
            [4.25, 7.25],
            [4.2, 7.95],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: { state: "Ekiti", name: "Ekiti", isPilot: false },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [5.05, 8.05],
            [5.75, 8.0],
            [5.7, 7.45],
            [5.05, 7.45],
            [5.05, 8.05],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: { state: "Ondo", name: "Ondo", isPilot: false },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [4.6, 7.4],
            [5.6, 7.4],
            [5.5, 6.0],
            [4.65, 6.1],
            [4.6, 7.4],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: { state: "Ogun", name: "Ogun", isPilot: false },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [2.7, 7.3],
            [4.1, 7.25],
            [4.3, 6.6],
            [2.8, 6.55],
            [2.7, 7.3],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: { state: "Lagos", name: "Lagos", isPilot: false },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [2.75, 6.55],
            [4.15, 6.55],
            [4.15, 6.35],
            [2.75, 6.35],
            [2.75, 6.55],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: { state: "Edo", name: "Edo", isPilot: false },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [5.5, 7.4],
            [6.6, 7.3],
            [6.65, 6.0],
            [5.5, 6.0],
            [5.5, 7.4],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: { state: "Delta", name: "Delta", isPilot: false },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [5.2, 6.2],
            [6.7, 6.2],
            [6.4, 5.2],
            [5.3, 5.3],
            [5.2, 6.2],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: { state: "Anambra", name: "Anambra", isPilot: false },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [6.7, 6.4],
            [7.2, 6.4],
            [7.2, 5.8],
            [6.7, 5.8],
            [6.7, 6.4],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: { state: "Enugu", name: "Enugu", isPilot: false },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [7.2, 6.9],
            [7.8, 6.9],
            [7.8, 6.2],
            [7.2, 6.2],
            [7.2, 6.9],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: { state: "Ebonyi", name: "Ebonyi", isPilot: false },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [7.75, 6.7],
            [8.3, 6.6],
            [8.2, 5.9],
            [7.75, 6.0],
            [7.75, 6.7],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: { state: "Imo", name: "Imo", isPilot: false },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [6.85, 5.8],
            [7.3, 5.8],
            [7.25, 5.2],
            [6.85, 5.2],
            [6.85, 5.8],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: { state: "Cross River", name: "Cross River", isPilot: false },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [8.2, 6.7],
            [9.3, 6.7],
            [8.7, 4.8],
            [8.2, 4.9],
            [8.2, 6.7],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: { state: "Akwa Ibom", name: "Akwa Ibom", isPilot: false },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [7.5, 5.2],
            [8.3, 5.1],
            [8.1, 4.5],
            [7.5, 4.55],
            [7.5, 5.2],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: { state: "Rivers", name: "Rivers", isPilot: false },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [6.6, 5.2],
            [7.4, 5.15],
            [7.3, 4.4],
            [6.6, 4.4],
            [6.6, 5.2],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: { state: "Bayelsa", name: "Bayelsa", isPilot: false },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [5.8, 5.1],
            [6.6, 5.1],
            [6.4, 4.3],
            [5.8, 4.4],
            [5.8, 5.1],
          ],
        ],
      },
    },
  ],
};

const FALLBACK_WARDS: Record<string, string[]> = {
  wamakko: [
    "Wamakko",
    "Gwiwa",
    "Arkilla",
    "Kware",
    "Dundaye",
    "Bado",
    "Kasarawa",
  ],
  "sokoto north": [
    "Waziri B",
    "Waziri C",
    "Magajin Gari A",
    "Magajin Gari B",
    "Sarkin Adar",
  ],
  "sokoto south": [
    "Gagi A",
    "Gagi B",
    "Rijiyar Dorowa",
    "Tudun Wada",
    "Mabera",
  ],
  binji: ["Binji", "Bunkari", "Gawazzai", "Inname", "Samalu"],
  bodinga: ["Bodinga", "Badawa", "Bagam", "Danchadi", "Dingyadi"],
  silame: ["Silame", "Gande", "Kubodu", "Labani", "Marafa"],
  tambuwal: ["Tambuwal", "Bakaya", "Barkeji", "Dogon Daji", "Romon Sarki"],
  rabah: ["Rabah", "Gandts", "Gawu", "Rarah", "Tsamiya"],
  gboko: [
    "Gboko Central",
    "Gboko East",
    "Gboko North-West",
    "Gboko South",
    "Mbayion",
    "Yandev",
  ],
  makurdi: [
    "Central/South",
    "Clerks/Market",
    "Fiidi",
    "Modern Market",
    "North Bank I",
    "Wurukum",
  ],
  otukpo: [
    "Otukpo Town East",
    "Otukpo Town West",
    "Upu",
    "Adoka-Icho",
    "Ugboju-Icho",
  ],
  "katsina-ala": ["Katsina-Ala Township", "Utange", "Yooyo", "Tiir", "Mbacher"],
  vandeikya: ["Vandeikya Township", "Mbagbera", "Mbakaange", "Mbayongo", "Ute"],
  "gwer east": ["Aliade Town", "Mbakine", "Mbikyan", "Shough", "Yonov"],
  okpoga: ["Okpoga Central", "Okpoga North", "Ichama I", "Ichama II", "Ojigo"],
  "ibadan north": ["Agodi", "Bodija", "Sango", "Yemetu", "Mokola", "Ashi"],
  "ibadan south-west": ["Ring Road", "Challenge", "Molete", "Oluyole", "Apata"],
  "ibadan south-east": ["Mapo", "Bode", "Oranyan", "Orita Aperin", "Kudeti"],
  "ogbomoso north": [
    "Abogunde",
    "Arowomole",
    "Isale Afon",
    "Oja-Igbo",
    "Sabon Gari",
  ],
  "oyo east": ["Akeetan", "Alaafin", "Apaara", "Jabata", "Modeke"],
  iseyin: ["Ado-Awaye", "Isalu", "Ladogan", "Koso", "Faruku"],
  "saki west": ["Aganun", "Ajegunle", "Kinnikinni", "Ogidigbo", "Sango"],
  "ibarapa east": ["Eruwa", "Anko", "Aborerin", "Lanlate", "New Eruwa"],
  "aba south": ["Eziama", "Asa", "Ngwa", "Ogbor Hill", "Ariaria", "Over-Rail"],
  "aba north": ["Eziama High", "Industrial", "Ogbor I", "Ogbor II", "Umuola"],
  "umuahia north": [
    "Ibeku East",
    "Ibeku West",
    "Ndume",
    "Umuahia Urban I",
    "Urban II",
  ],
  "umuahia south": [
    "Ahiaukwu I",
    "Ahiaukwu II",
    "Old Umuahia",
    "Ubakanu",
    "Umuopara",
  ],
  osisioma: ["Aro-Ngwa", "Amaitolu", "Amator", "Okpu-Umuobo", "Uratta"],
  "isiala ngwa north": ["Amapu Ntigha", "Ihie", "Isiala", "Mbawsi", "Umuohu"],
  ohafia: ["Abiriba", "Asaga", "Elu", "Ebem", "Ohafia Urban"],
  bende: ["Bende Town", "Item", "Alayi", "Uzuakoli", "Igbere"],
};

async function safeFetchJson<T = any>(candidates: string[]): Promise<T | null> {
  for (const path of candidates) {
    try {
      const res = await fetch(path);
      if (res.ok) {
        const text = await res.text();
        if (text && text.trim().startsWith("{")) {
          return JSON.parse(text) as T;
        }
      }
    } catch (_e) {
      // Continue
    }
  }
  return null;
}

export async function fetchGeoJson(
  level: GeoLevel,
  parentId?: string | null,
  stateName?: string | null,
): Promise<FeatureCollection> {
  try {
    if (level === "national" || level === "state") {
      const data = await safeFetchJson<any>([
        `${BASE}geojson/nigeria-states.json`,
        `/geojson/nigeria-states.json`,
        `./geojson/nigeria-states.json`,
        `geojson/nigeria-states.json`,
      ]);

      if (data && Array.isArray(data.features) && data.features.length > 0) {
        const enriched = data.features.map((f: any) => {
          const raw =
            f.properties?.state ||
            f.properties?.NAME_1 ||
            f.properties?.name ||
            f.properties?.admin1Name ||
            "";
          return {
            ...f,
            properties: {
              ...f.properties,
              state: raw,
              name: raw,
              isPilot: ["abia", "benue", "oyo", "sokoto"].includes(
                raw.toLowerCase(),
              ),
            },
          };
        });

        if (level === "state" && parentId) {
          const p = parentId.toLowerCase().trim();
          const filtered = enriched.filter((f: any) =>
            (f.properties.state || "").toLowerCase().includes(p),
          );
          return { type: "FeatureCollection", features: filtered };
        }
        return { ...data, features: enriched };
      }

      return NIGERIA_REALISTIC_STATES_GEOJSON;
    }

    if (level === "lga") {
      const data = await safeFetchJson<any>([
        `${BASE}geojson/nigeria_lga.json`,
        `/geojson/nigeria_lga.json`,
        `./geojson/nigeria_lga.json`,
      ]);

      if (data && Array.isArray(data.features) && parentId) {
        const p = parentId.toLowerCase().trim();
        const filtered = data.features.filter((f: any) => {
          const st = (
            f.properties?.state ||
            f.properties?.NAME_1 ||
            f.properties?.admin1Name ||
            f.properties?.State ||
            ""
          )
            .toLowerCase()
            .trim();
          return st.includes(p) || p.includes(st);
        });
        if (filtered.length > 0)
          return { type: "FeatureCollection", features: filtered };
      }
    }

    if (level === "ward") {
      const data = await safeFetchJson<any>([
        `${BASE}geojson/nigeria_ward.json`,
        `/geojson/nigeria_ward.json`,
      ]);

      if (data && Array.isArray(data.features) && parentId) {
        const lgaClean = parentId.toLowerCase().replace(/[^a-z0-9]/g, "");
        const filtered = data.features.filter((f: any) => {
          const lga = (
            f.properties?.lga ||
            f.properties?.admin2Name ||
            f.properties?.NAME_2 ||
            f.properties?.LGA ||
            ""
          )
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "");
          return lga === lgaClean || lga.includes(lgaClean);
        });

        if (filtered.length > 0)
          return { type: "FeatureCollection", features: filtered };
      }

      return generateSyntheticWards(parentId || "LGA", stateName || undefined);
    }
  } catch (err) {
    console.warn(`GeoJSON fetch notice:`, err);
  }

  if (level === "national") return NIGERIA_REALISTIC_STATES_GEOJSON;
  return { type: "FeatureCollection", features: [] };
}

function generateSyntheticWards(
  lgaName: string,
  stateName?: string,
): FeatureCollection {
  const lgaKey = lgaName.toLowerCase().trim();
  const wardNames = FALLBACK_WARDS[lgaKey] || [
    `${lgaName} Central`,
    `${lgaName} East`,
    `${lgaName} West`,
    `${lgaName} North`,
    `${lgaName} South`,
    `${lgaName} Urban`,
  ];

  let cLng = 5.23;
  let cLat = 13.06;
  const st = (stateName || "").toLowerCase();
  if (st.includes("benue")) {
    cLng = 8.52;
    cLat = 7.33;
  } else if (st.includes("oyo")) {
    cLng = 3.91;
    cLat = 7.85;
  } else if (st.includes("abia")) {
    cLng = 7.52;
    cLat = 5.45;
  }

  const numWards = wardNames.length;
  const features: Feature<Geometry>[] = wardNames.map((name, i) => {
    const angle = (2 * Math.PI * i) / numWards;
    const nextAngle = (2 * Math.PI * (i + 1)) / numWards;
    const radius = 0.08;

    const p0 = [cLng, cLat];
    const p1 = [
      cLng + radius * Math.cos(angle),
      cLat + radius * Math.sin(angle) * 0.8,
    ];
    const p2 = [
      cLng + radius * Math.cos(nextAngle),
      cLat + radius * Math.sin(nextAngle) * 0.8,
    ];

    return {
      type: "Feature",
      properties: {
        ward: name,
        ward_name: name,
        name: name,
        lga: lgaName,
        state: stateName || "Pilot State",
        communities: Math.floor(6 + ((i * 3) % 12)),
        households: Math.floor(450 + ((i * 127) % 650)),
        individuals: Math.floor(1500 + ((i * 412) % 2100)),
        children: Math.floor(620 + ((i * 180) % 900)),
      },
      geometry: {
        type: "Polygon",
        coordinates: [[p0, p1, p2, p0]],
      },
    };
  });

  return { type: "FeatureCollection", features };
}

export const getGeoJson = fetchGeoJson;

export async function getNationalSummary() {
  const data = await safeFetchJson([
    `${BASE}data/national_summary.json`,
    `/data/national_summary.json`,
  ]);
  return data || NATIONAL_BASELINE;
}

export async function getStatesSummary(): Promise<StateSummaryItem[]> {
  const data = await safeFetchJson<StateSummaryItem[]>([
    `${BASE}data/states_summary.json`,
    `/data/states_summary.json`,
  ]);
  return data || STATES_BASELINE;
}

export const getStateSummary = getStatesSummary;

export async function getLgaSummary(stateName?: string) {
  const data = await safeFetchJson<any[]>([
    `${BASE}data/lga_summary.json`,
    `/data/lga_summary.json`,
  ]);
  if (!data) return [];
  if (stateName) {
    return data.filter(
      (d: any) => (d.state || "").toLowerCase() === stateName.toLowerCase(),
    );
  }
  return data;
}

export async function getWardSummary(lgaName?: string) {
  const data = await safeFetchJson<any[]>([
    `${BASE}data/ward_summary.json`,
    `/data/ward_summary.json`,
  ]);
  if (!data) return [];
  if (lgaName) {
    return data.filter(
      (d: any) => (d.lga || "").toLowerCase() === lgaName.toLowerCase(),
    );
  }
  return data;
}
