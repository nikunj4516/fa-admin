import React from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor: string;
  bgColor: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  iconColor,
  bgColor,
  trend,
  onClick
}) => {
  return (
    <div 
      onClick={onClick}
      className={`bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover-card-trigger cursor-pointer ${
        onClick ? "active:scale-[0.98] transition-transform duration-100" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {title}
          </p>
          <h3 className="text-2xl font-bold text-slate-800 mt-2 tracking-tight">
            {value}
          </h3>
        </div>
        <div className={`p-3 rounded-xl ${bgColor}`}>
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
      </div>
      {trend && (
        <div className="flex items-center mt-4 text-xs font-medium">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full ${
              trend.isPositive
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {trend.value}
          </span>
          <span className="text-slate-400 ml-2">vs last month</span>
        </div>
      )}
    </div>
  );
};
