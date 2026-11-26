import { useState, useMemo } from "react";
import { Header } from "./components/Header";
import { Overview } from "./components/domains/GlobalOverview";
import { CivilRegistration } from "./components/domains/CivilRegistration";
import { Education } from "./components/domains/Education";
import { HealthNutrition } from "./components/domains/HealthNutrition";
import { Disabilities } from "./components/domains/Disabilities";
import { LivelihoodsResilience } from "./components/domains/LivelihoodsResilience";
import type { DomainId, GeoLevel, GeoRecord } from "./types";

const BASELINE_DATA: GeoRecord = {
  id: "NG-NATIONAL",
  name: "Nigeria (4 Pilot States)",
  level: "national",
  households: 41512,
  individuals: 138676,
  males: 70312,
  females: 68364,
  children017: 57688,
  youth1824: 19012,
  communities: 864,
  ninCoverage: 29.8,
  femaleHeadedHhPct: 18.4,
  birthCertCoverage: 42.6,
  ooscTotal: 17240,
  plwdTotal: 1376,
  pregnantWomen: 2483,
  lactatingMothers: 7180,
  isUpdated: false,
};

export const App = () => {
  const [activeDomain, setActiveDomain] = useState<DomainId>("overview");
  const [geoLevel, setGeoLevel] = useState<GeoLevel>("national");
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedLga, setSelectedLga] = useState<string | null>(null);
  const [selectedWard, setSelectedWard] = useState<string | null>(null);
  const [isDark, setIsDark] = useState<boolean>(true);

  const currentRecord: GeoRecord = useMemo(() => {
    let name = "Nigeria (4 Pilot States)";
    let id = "NG-NATIONAL";
    let households = 41512;
    let individuals = 138676;
    let children017 = 57688;
    let youth1824 = 19012;
    let communities = 864;

    if (selectedWard && selectedLga && selectedState) {
      name = `${selectedWard} Ward, ${selectedLga}`;
      id = `WARD-${selectedWard}`;
      households = 420;
      individuals = 1380;
      children017 = 580;
      youth1824 = 190;
      communities = 8;
    } else if (selectedLga && selectedState) {
      name = `${selectedLga} LGA, ${selectedState}`;
      id = `LGA-${selectedLga}`;
      households = 1420;
      individuals = 4750;
      children017 = 1980;
      youth1824 = 650;
      communities = 28;
    } else if (selectedState) {
      name = `${selectedState} State`;
      id = `STATE-${selectedState}`;
      if (selectedState.toLowerCase().includes("abia")) {
        households = 9842;
        individuals = 31820;
        children017 = 13240;
        youth1824 = 4360;
        communities = 204;
      } else if (selectedState.toLowerCase().includes("benue")) {
        households = 11430;
        individuals = 39114;
        children017 = 16270;
        youth1824 = 5360;
        communities = 238;
      } else if (selectedState.toLowerCase().includes("oyo")) {
        households = 10120;
        individuals = 33640;
        children017 = 13990;
        youth1824 = 4610;
        communities = 210;
      } else if (selectedState.toLowerCase().includes("sokoto")) {
        households = 10120;
        individuals = 34102;
        children017 = 14188;
        youth1824 = 4682;
        communities = 212;
      }
    }

    return {
      ...BASELINE_DATA,
      id,
      name,
      level: geoLevel,
      households,
      individuals,
      children017,
      youth1824,
      communities,
    };
  }, [selectedState, selectedLga, selectedWard, geoLevel]);

  const handleResetGeo = () => {
    setSelectedState(null);
    setSelectedLga(null);
    setSelectedWard(null);
    setGeoLevel("national");
  };

  const renderActiveDomain = () => {
    const domainProps = {
      record: currentRecord,
      activeRecord: currentRecord,
      isDark,
      drilldown: {
        level: geoLevel,
        state: selectedState,
        lga: selectedLga,
        ward: selectedWard,
      },
    };

    switch (activeDomain) {
      case "overview":
      case "demographics":
        return <Overview {...domainProps} />;
      case "civil-registration":
      case "civilRegistration":
        return <CivilRegistration {...domainProps} />;
      case "education":
        return <Education {...domainProps} />;
      case "health-nutrition":
      case "healthNutrition":
      case "health":
        return <HealthNutrition {...domainProps} />;
      case "disabilities":
      case "disability":
        return <Disabilities {...domainProps} />;
      case "livelihoods-resilience":
      case "livelihoods":
        return <LivelihoodsResilience {...domainProps} />;
      default:
        return <Overview {...domainProps} />;
    }
  };

  return (
    <div
      className={`min-h-screen font-sans transition-colors duration-200 ${
        isDark ? "bg-[#081514] text-slate-100" : "bg-slate-50 text-slate-900"
      }`}
    >
      <Header
        activeDomain={activeDomain}
        onDomainChange={setActiveDomain}
        geoLevel={geoLevel}
        selectedState={selectedState}
        selectedLga={selectedLga}
        selectedWard={selectedWard}
        onResetGeo={handleResetGeo}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
      />

      <main className="mx-auto max-w-[1720px] px-3 sm:px-4 lg:px-6 py-4 space-y-4">
        {renderActiveDomain()}
      </main>
    </div>
  );
};

export default App;
