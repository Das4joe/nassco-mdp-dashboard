export type DomainId =
  | "overview"
  | "demographics"
  | "civil-registration"
  | "civilRegistration"
  | "education"
  | "health-nutrition"
  | "healthNutrition"
  | "health"
  | "disabilities"
  | "disability"
  | "livelihoods-resilience"
  | "livelihoods";

export type GeoLevel = "national" | "state" | "lga" | "ward" | "community";

export interface DrilldownState {
  level: GeoLevel;
  state: string | null;
  lga: string | null;
  ward: string | null;
  community?: string | null;
  selectedState?: string | null;
  selectedLga?: string | null;
  selectedWard?: string | null;
}

export interface GeoRecord {
  id: string;
  name: string;
  level: GeoLevel;
  households: number;
  individuals: number;
  males: number;
  females: number;
  children017: number;
  youth1824: number;
  communities: number;
  ninCoverage: number;
  femaleHeadedHhPct: number;
  birthCertCoverage: number;
  ooscTotal: number;
  plwdTotal: number;
  pregnantWomen: number;
  lactatingMothers: number;
  isUpdated?: boolean;
}

export interface DomainProps {
  record?: GeoRecord;
  activeRecord?: GeoRecord;
  drilldown?: DrilldownState;
  isDark?: boolean;
  onStateSelect?: (stateName: string) => void;
  onLgaSelect?: (lgaName: string) => void;
  onWardSelect?: (wardName: string) => void;
  onReset?: () => void;
}
