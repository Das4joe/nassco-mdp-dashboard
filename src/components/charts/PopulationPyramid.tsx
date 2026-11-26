import type React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

export interface PyramidCohort {
  cohort: string;
  boys: number;
  girls: number;
  total: number;
}

export interface PopulationPyramidProps {
  data?: PyramidCohort[];
  isDark?: boolean;
  className?: string;
}

const DEFAULT_PYRAMID_DATA: PyramidCohort[] = [
  { cohort: "0 - 4 yrs", boys: 5740, girls: 5573, total: 11313 },
  { cohort: "5 - 9 yrs", boys: 9842, girls: 9442, total: 19284 },
  { cohort: "10 - 14 yrs", boys: 8620, girls: 8332, total: 16952 },
  { cohort: "15 - 19 yrs", boys: 8010, girls: 7789, total: 15799 },
  { cohort: "20 - 24 yrs", boys: 6790, girls: 6562, total: 13352 },
];

export const PopulationPyramid: React.FC<PopulationPyramidProps> = ({
  data = DEFAULT_PYRAMID_DATA,
  isDark = true,
  className = "",
}) => {
  // Transform boys into negative values for the bilateral symmetrical pyramid chart
  const formattedData = data.map((d) => ({
    cohort: d.cohort,
    boysNeg: -Math.abs(d.boys),
    boysVal: d.boys,
    girlsVal: d.girls,
    total: d.total,
  }));

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xs font-semibold text-teal-300">
            Population Pyramid (0 - 24 Years)
          </h4>
          <p className="text-[10px] text-slate-400">
            Bilateral Gender Structure (Boys: 39,002 | Girls: 37,698)
          </p>
        </div>
        <div className="flex items-center gap-3 text-[10px]">
          <span className="flex items-center gap-1 text-[#0EA5E9]">
            <span className="h-2 w-2 rounded-full bg-[#0EA5E9]" /> Boys (50.8%)
          </span>
          <span className="flex items-center gap-1 text-[#EC4899]">
            <span className="h-2 w-2 rounded-full bg-[#EC4899]" /> Girls (49.2%)
          </span>
        </div>
      </div>

      <div className="h-44 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={formattedData}
            layout="vertical"
            stackOffset="sign"
            margin={{ top: 5, right: 15, left: 10, bottom: 5 }}
          >
            <XAxis
              type="number"
              domain={[-12000, 12000]}
              tickFormatter={(v: number) => `${Math.abs(v / 1000)}k`}
              stroke={isDark ? "#94a3b8" : "#64748b"}
              tick={{ fontSize: 10 }}
            />
            <YAxis
              type="category"
              dataKey="cohort"
              stroke={isDark ? "#94a3b8" : "#64748b"}
              tick={{ fontSize: 10 }}
              width={75}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? "#071c1a" : "#ffffff",
                borderColor: isDark ? "#134e4a" : "#cbd5e1",
                borderRadius: "8px",
                fontSize: "11px",
                color: isDark ? "#ffffff" : "#0f172a",
              }}
              formatter={(_val: any, name: string, item: any) => {
                if (name === "Boys") {
                  return [
                    `${item.payload.boysVal.toLocaleString()} (${((item.payload.boysVal / item.payload.total) * 100).toFixed(1)}%)`,
                    "Boys",
                  ];
                }
                return [
                  `${item.payload.girlsVal.toLocaleString()} (${((item.payload.girlsVal / item.payload.total) * 100).toFixed(1)}%)`,
                  "Girls",
                ];
              }}
            />
            <Bar
              dataKey="boysNeg"
              name="Boys"
              fill="#0EA5E9"
              radius={[4, 0, 0, 4]}
            />
            <Bar
              dataKey="girlsVal"
              name="Girls"
              fill="#EC4899"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PopulationPyramid;
