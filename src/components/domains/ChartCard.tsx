import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export interface ChartCardProps {
  title: string;
  subtitle?: string;
  type?: "pyramid" | "bar" | "donut" | "pie" | "custom";
  data?: any[];
  dataKeys?: { key: string; name: string; color: string }[];
  colors?: string[];
  disclaimer?: string;
  height?: number;
  children?: React.ReactNode;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  type = "bar",
  data = [],
  dataKeys = [],
  colors = ["#0d9488", "#f97316", "#3b82f6", "#e11d48"],
  disclaimer,
  height = 280,
  children,
}) => {
  // Render Disclaimer Box if indicator data was not captured in current survey wave
  if (disclaimer) {
    return (
      <div className="bg-[#111c1e] border border-gray-800/60 rounded-xl p-5 shadow-lg flex flex-col justify-between h-full min-h-[300px]">
        <div>
          <h3 className="text-sm font-semibold text-gray-200">{title}</h3>
          {subtitle && (
            <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
          )}
        </div>
        <div className="flex-1 flex items-center justify-center p-6 text-center border-2 border-dashed border-gray-800 rounded-lg my-4 bg-gray-950/30">
          <p className="text-xs text-gray-500 italic max-w-xs">{disclaimer}</p>
        </div>
      </div>
    );
  }

  // 1. POPULATION PYRAMID (Diverging Horizontal Bars - Boys Left, Girls Right)
  const renderPyramidChart = () => {
    const pyramidData = (data || []).map((item) => ({
      ...item,
      boysChart: -Math.abs(item.boys || item.male || 0),
      girlsChart: Math.abs(item.girls || item.female || 0),
      ageGroup: item.ageGroup || item.age_band || item.label || "",
    }));

    const formatAbs = (val: number) => Math.abs(val).toLocaleString();

    return (
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          layout="vertical"
          data={pyramidData}
          stackOffset="sign"
          margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#2a3739"
            horizontal={false}
          />
          <XAxis
            type="number"
            tickFormatter={formatAbs}
            stroke="#6b7280"
            fontSize={11}
          />
          <YAxis
            type="category"
            dataKey="ageGroup"
            stroke="#9ca3af"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            width={55}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1b2a2d",
              borderColor: "#374151",
              borderRadius: "8px",
              color: "#fff",
            }}
            formatter={(value: any, name: any) => [
              formatAbs(Number(value)),
              name === "boysChart"
                ? "Boys"
                : name === "girlsChart"
                  ? "Girls"
                  : name,
            ]}
          />
          <Legend
            formatter={(value) =>
              value === "boysChart"
                ? "Boys"
                : value === "girlsChart"
                  ? "Girls"
                  : value
            }
            wrapperStyle={{ paddingTop: "10px" }}
          />
          <Bar
            name="boysChart"
            dataKey="boysChart"
            fill="#0d9488"
            stackId="pyramid"
            radius={[4, 0, 0, 4]}
          />
          <Bar
            name="girlsChart"
            dataKey="girlsChart"
            fill="#3b82f6"
            stackId="pyramid"
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  // 2. DONUT / PIE CHART
  const renderDonutChart = () => {
    const pieData =
      data.length > 0
        ? data
        : [
            { name: "Boys", value: 0 },
            { name: "Girls", value: 0 },
          ];

    return (
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={5}
            dataKey="value"
            nameKey="name"
          >
            {pieData.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={colors[index % colors.length]}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "#1b2a2d",
              borderColor: "#374151",
              borderRadius: "8px",
              color: "#fff",
            }}
            formatter={(val: any) => [Number(val).toLocaleString(), "Count"]}
          />
          <Legend wrapperStyle={{ paddingTop: "10px" }} />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  // 3. STANDARD BAR CHART
  const renderBarChart = () => {
    const keys =
      dataKeys.length > 0
        ? dataKeys
        : [{ key: "count", name: "Count", color: colors[0] }];

    return (
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#2a3739"
            vertical={false}
          />
          <XAxis dataKey="name" stroke="#6b7280" fontSize={11} />
          <YAxis
            stroke="#6b7280"
            fontSize={11}
            tickFormatter={(v) => v.toLocaleString()}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1b2a2d",
              borderColor: "#374151",
              borderRadius: "8px",
              color: "#fff",
            }}
            formatter={(val: any) => [Number(val).toLocaleString(), "Count"]}
          />
          {keys.length > 1 && <Legend wrapperStyle={{ paddingTop: "10px" }} />}
          {keys.map((k, idx) => (
            <Bar
              key={k.key}
              dataKey={k.key}
              name={k.name}
              fill={k.color || colors[idx % colors.length]}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="bg-[#111c1e] border border-gray-800/60 rounded-xl p-5 shadow-lg flex flex-col justify-between h-full">
      <div>
        <h3 className="text-sm font-semibold text-gray-200">{title}</h3>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      <div className="mt-4 flex-1">
        {children
          ? children
          : type === "pyramid"
            ? renderPyramidChart()
            : type === "donut" || type === "pie"
              ? renderDonutChart()
              : renderBarChart()}
      </div>
    </div>
  );
};

// Export default to support both import styles seamlessly
export default ChartCard;
