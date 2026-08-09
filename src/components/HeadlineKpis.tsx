import {
  Home,
  Users,
  ShieldCheck,
  HeartHandshake,
  MapPin,
  Activity,
  Droplets,
  Target,
} from "lucide-react";
import KpiCard from "./KpiCard";
import { formatNumber, formatPercent } from "../lib/formatters";
import { THEME } from "../theme";
import type { GeoRecord, DashboardMode, DataMetadata } from "../lib/types";

interface HeadlineKpisProps {
  record: GeoRecord;
  meta: DataMetadata;
  mode: DashboardMode;
}

export default function HeadlineKpis({
  record,
  meta,
  mode,
}: HeadlineKpisProps) {
  const n = record.nsr;
  const v = record.vulnerability;
  const mdpStates = meta.mdp_states ?? [];

  if (mode === "nsr") {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <KpiCard
          label="Households"
          value={formatNumber(n.total_households)}
          sub={`${mdpStates.length} MDP States`}
          icon={<Home size={16} />}
          accent={THEME.brand.primary}
        />
        <KpiCard
          label="Individuals"
          value={formatNumber(n.total_individuals)}
          sub={`Avg ${n.avg_household_size} per HH`}
          icon={<Users size={16} />}
          accent={THEME.brand.primary}
        />
        <KpiCard
          label="NIN Verified"
          value={formatPercent(n.nin_verification_rate)}
          sub={`${formatNumber(n.nin_verified)} of ${formatNumber(n.nin_eligible_adults)} adults`}
          icon={<ShieldCheck size={16} />}
          accent={THEME.nsr.accent}
        />
        <KpiCard
          label="Vulnerable HHs"
          value={formatNumber(v.poorest_households)}
          sub={`${formatPercent(v.poorest_pct)} in poorest 3 deciles`}
          icon={<HeartHandshake size={16} />}
          accent={THEME.brand.primary}
        />
        <KpiCard
          label="Communities"
          value={formatNumber(meta.community_count)}
          sub={`${meta.ward_count} wards · ${meta.lga_count} LGAs`}
          icon={<MapPin size={16} />}
          accent={THEME.brand.primary}
        />
      </div>
    );
  }

  // Deprivation Analysis Mode
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
      <KpiCard
        label="Average PMT"
        value={v.pmt_mean.toFixed(2)}
        sub="Proxy Means Test Score"
        icon={<Activity size={16} />}
        accent={THEME.upd.accent}
      />
      <KpiCard
        label="Poorest HHs"
        value={formatNumber(v.poorest_households)}
        sub="Deciles 1–3"
        icon={<HeartHandshake size={16} />}
        accent={THEME.upd.accent}
      />
      <KpiCard
        label="Severe Poverty"
        value={formatPercent(v.poorest_pct)}
        sub="% in poorest deciles"
        icon={<Target size={16} />}
        accent={THEME.upd.accent}
      />
      <KpiCard
        label="Safe Water"
        value={formatPercent(v.improved_water_pct)}
        sub="Improved source access"
        icon={<Droplets size={16} />}
        accent={THEME.upd.accent}
      />
      <KpiCard
        label="Safe Sanitation"
        value={formatPercent(v.improved_toilet_pct)}
        sub="Improved toilet access"
        icon={<Home size={16} />}
        accent={THEME.upd.accent}
      />
    </div>
  );
}
