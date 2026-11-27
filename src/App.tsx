import React, { useState } from "react";
import {
  LayoutDashboard,
  FileText,
  GraduationCap,
  HeartPulse,
  Accessibility,
  TrendingUp,
  Moon,
  Sun,
  RotateCcw,
} from "lucide-react";

import { GlobalOverview } from "./components/domains/GlobalOverview";
import { CivilRegistration } from "./components/domains/CivilRegistration";
import { Education } from "./components/domains/Education";
import { HealthNutrition } from "./components/domains/HealthNutrition";
import { Disabilities } from "./components/domains/Disabilities";
import { LivelihoodsResilience } from "./components/domains/LivelihoodsResilience";

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedLga, setSelectedLga] = useState<string | null>(null);
  const [selectedWard, setSelectedWard] = useState<string | null>(null);
  const [isDark, setIsDark] = useState<boolean>(true);

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (!isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const resetAllFilters = () => {
    setSelectedState(null);
    setSelectedLga(null);
    setSelectedWard(null);
  };

  const navItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "civil-registration", label: "Civil Registration", icon: FileText },
    { id: "education", label: "Education", icon: GraduationCap },
    { id: "health-nutrition", label: "Health & Nutrition", icon: HeartPulse },
    { id: "disabilities", label: "Disabilities", icon: Accessibility },
    { id: "livelihoods-shock", label: "Livelihoods & Shock", icon: TrendingUp },
  ];

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
        isDark ? "bg-[#081514] text-slate-100" : "bg-slate-100 text-slate-900"
      }`}
    >
      {/* Top Professional Header (UNICEF badge removed) */}
      <header
        className={`sticky top-0 z-50 border-b backdrop-blur-md transition-colors ${
          isDark
            ? "bg-[#091a18]/95 border-emerald-950/60"
            : "bg-white/95 border-slate-200"
        }`}
      >
        <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center font-black text-white text-base shadow-sm">
              N
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
                NASSCO Multi-Dimensional Poverty (MDP) Registry
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                National Social Safety Nets Project (NASSP-SU) • 4 Expansion
                States (Abia, Benue, Oyo, Sokoto)
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {(selectedState || selectedLga || selectedWard) && (
              <button
                onClick={resetAllFilters}
                className="hidden sm:inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-200 dark:hover:bg-emerald-900 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to National</span>
              </button>
            )}

            <button
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              className={`p-2 rounded-lg border transition-colors ${
                isDark
                  ? "border-emerald-900/60 bg-emerald-950/40 text-emerald-400 hover:bg-emerald-900/60"
                  : "border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {isDark ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1 overflow-x-auto no-scrollbar border-t border-slate-200 dark:border-emerald-950/40">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-2 py-3 px-3.5 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
                  isActive
                    ? "border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/30"
                    : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-300"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-5">
        {activeTab === "overview" && (
          <GlobalOverview
            selectedState={selectedState}
            selectedLga={selectedLga}
            selectedWard={selectedWard}
            onSelectState={setSelectedState}
            onSelectLga={setSelectedLga}
            onSelectWard={setSelectedWard}
            isDark={isDark}
          />
        )}
        {activeTab === "civil-registration" && (
          <CivilRegistration
            selectedState={selectedState}
            selectedLga={selectedLga}
            selectedWard={selectedWard}
            onSelectState={setSelectedState}
            onSelectLga={setSelectedLga}
            onSelectWard={setSelectedWard}
            isDark={isDark}
          />
        )}
        {activeTab === "education" && (
          <Education
            selectedState={selectedState}
            selectedLga={selectedLga}
            selectedWard={selectedWard}
            onSelectState={setSelectedState}
            onSelectLga={setSelectedLga}
            onSelectWard={setSelectedWard}
            isDark={isDark}
          />
        )}
        {activeTab === "health-nutrition" && (
          <HealthNutrition
            selectedState={selectedState}
            selectedLga={selectedLga}
            selectedWard={selectedWard}
            onSelectState={setSelectedState}
            onSelectLga={setSelectedLga}
            onSelectWard={setSelectedWard}
            isDark={isDark}
          />
        )}
        {activeTab === "disabilities" && (
          <Disabilities
            selectedState={selectedState}
            selectedLga={selectedLga}
            selectedWard={selectedWard}
            onSelectState={setSelectedState}
            onSelectLga={setSelectedLga}
            onSelectWard={setSelectedWard}
            isDark={isDark}
          />
        )}
        {activeTab === "livelihoods-shock" && (
          <LivelihoodsResilience
            selectedState={selectedState}
            selectedLga={selectedLga}
            selectedWard={selectedWard}
            onSelectState={setSelectedState}
            onSelectLga={setSelectedLga}
            onSelectWard={setSelectedWard}
            isDark={isDark}
          />
        )}
      </main>
    </div>
  );
};

export default App;
