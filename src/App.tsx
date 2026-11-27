import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  FileText,
  GraduationCap,
  HeartPulse,
  Accessibility,
  Briefcase,
  Moon,
  Sun,
  ChevronRight,
  Globe,
} from "lucide-react";
import { GlobalOverview } from "./components/domains/GlobalOverview";
import { CivilRegistration } from "./components/domains/CivilRegistration";
import { Education } from "./components/domains/Education";
import { HealthNutrition } from "./components/domains/HealthNutrition";
import { Disabilities } from "./components/domains/Disabilities";
import { LivelihoodsResilience } from "./components/domains/LivelihoodsResilience";

type TabType =
  | "overview"
  | "civil"
  | "education"
  | "health"
  | "disabilities"
  | "livelihoods";

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [selectedState, setSelectedState] = useState<string | undefined>(
    undefined,
  );
  const [selectedLga, setSelectedLga] = useState<string | undefined>(undefined);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const handleStateSelect = (stateName: string) => {
    setSelectedState(stateName);
    setSelectedLga(undefined);
  };

  const handleLgaSelect = (lgaName: string) => {
    setSelectedLga(lgaName);
  };

  const handleReset = () => {
    setSelectedState(undefined);
    setSelectedLga(undefined);
  };

  const navTabs = [
    { id: "overview" as TabType, label: "Overview", icon: LayoutDashboard },
    { id: "civil" as TabType, label: "Civil Registration", icon: FileText },
    { id: "education" as TabType, label: "Education", icon: GraduationCap },
    { id: "health" as TabType, label: "Health & Nutrition", icon: HeartPulse },
    {
      id: "disabilities" as TabType,
      label: "Disabilities",
      icon: Accessibility,
    },
    {
      id: "livelihoods" as TabType,
      label: "Livelihoods & Shock",
      icon: Briefcase,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col dark:bg-[#081514] bg-slate-100 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Top Banner Header */}
      <header className="sticky top-0 z-50 dark:bg-[#0c221e]/90 bg-white/90 backdrop-blur-md border-b dark:border-[#1a3d36] border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-black text-sm shadow">
              N
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-sm font-extrabold tracking-tight dark:text-white text-slate-900">
                  NASSCO Multi-Dimensional Poverty (MDP) Registry
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  UNICEF Section 3 Pilot
                </span>
              </div>
              <p className="text-[11px] font-medium dark:text-slate-400 text-slate-500">
                National Social Safety Nets Project (NASSP-SU) • 4 Expansion
                States (Abia, Benue, Oyo, Sokoto)
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Breadcrumb Filter Reset */}
            {selectedState && (
              <button
                onClick={handleReset}
                className="flex items-center space-x-1 text-xs px-2.5 py-1 rounded-md dark:bg-[#132c26] bg-slate-100 dark:text-emerald-400 text-emerald-700 font-semibold border dark:border-[#1a3d36] border-slate-200 hover:opacity-80"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Nigeria</span>
                <ChevronRight className="w-3 h-3" />
                <span className="underline">{selectedState}</span>
                {selectedLga && (
                  <>
                    <ChevronRight className="w-3 h-3" />
                    <span>{selectedLga}</span>
                  </>
                )}
              </button>
            )}

            {/* Dark / Light Mode Switch */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              title="Toggle Theme"
              className="p-1.5 rounded-lg border dark:border-[#1a3d36] border-slate-200 dark:bg-[#132c26] bg-white text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1a3d36] shadow-sm transition-colors"
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <nav className="flex space-x-1 overflow-x-auto py-1 scrollbar-none">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap ${
                    isActive
                      ? "dark:bg-emerald-500/20 bg-emerald-50 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#132c26]/60"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-4">
        {activeTab === "overview" && (
          <GlobalOverview
            selectedState={selectedState}
            selectedLga={selectedLga}
            onStateSelect={handleStateSelect}
            onLgaSelect={handleLgaSelect}
            onReset={handleReset}
            isDarkMode={isDarkMode}
          />
        )}
        {activeTab === "civil" && (
          <CivilRegistration
            selectedState={selectedState}
            selectedLga={selectedLga}
            onStateSelect={handleStateSelect}
            onLgaSelect={handleLgaSelect}
            onReset={handleReset}
            isDarkMode={isDarkMode}
          />
        )}
        {activeTab === "education" && (
          <Education
            selectedState={selectedState}
            selectedLga={selectedLga}
            onStateSelect={handleStateSelect}
            onLgaSelect={handleLgaSelect}
            onReset={handleReset}
            isDarkMode={isDarkMode}
          />
        )}
        {activeTab === "health" && (
          <HealthNutrition
            selectedState={selectedState}
            selectedLga={selectedLga}
            onStateSelect={handleStateSelect}
            onLgaSelect={handleLgaSelect}
            onReset={handleReset}
            isDarkMode={isDarkMode}
          />
        )}
        {activeTab === "disabilities" && (
          <Disabilities
            selectedState={selectedState}
            selectedLga={selectedLga}
            onStateSelect={handleStateSelect}
            onLgaSelect={handleLgaSelect}
            onReset={handleReset}
            isDarkMode={isDarkMode}
          />
        )}
        {activeTab === "livelihoods" && (
          <LivelihoodsResilience
            selectedState={selectedState}
            selectedLga={selectedLga}
            onStateSelect={handleStateSelect}
            onLgaSelect={handleLgaSelect}
            onReset={handleReset}
            isDarkMode={isDarkMode}
          />
        )}
      </main>
    </div>
  );
};

export default App;
