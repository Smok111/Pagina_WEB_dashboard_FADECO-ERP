"use client";

import { motion } from "framer-motion";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { ArrowUpRight, ArrowDownRight, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type KpiCardProps = {
  titulo: string;
  valor: string;
  change?: string;
  changeType?: "up" | "down";
  icon?: React.ReactNode;
  data?: any[];
};

export default function KpiCard({ titulo, valor, change, changeType = "up", icon, data }: KpiCardProps) {
  const isUp = changeType === "up";
  
  // Fake data for sparkline if not provided
  const sparklineData = data || [
    { value: 400 }, { value: 300 }, { value: 550 }, { value: 450 }, { value: 700 }
  ];

  return (
    <motion.div 
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60 relative overflow-hidden group"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{titulo}</p>
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{valor}</h3>
        </div>
        
        {icon && (
          <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-red-50 group-hover:text-red-500 transition-colors">
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-end justify-between mt-4">
        <div className="flex items-center gap-2">
          {change && (
            <span className={cn(
              "inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-md",
              isUp ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
            )}>
              {isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {change}
            </span>
          )}
          <span className="text-xs text-slate-400 font-medium">vs mes pasado</span>
        </div>

        <div className="w-20 h-10 opacity-70 group-hover:opacity-100 transition-opacity">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparklineData}>
              <defs>
                <linearGradient id={`color-${titulo.replace(/\s+/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isUp ? "#10B981" : "#EF4444"} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={isUp ? "#10B981" : "#EF4444"} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke={isUp ? "#10B981" : "#EF4444"} 
                strokeWidth={2}
                fillOpacity={1} 
                fill={`url(#color-${titulo.replace(/\s+/g, '')})`} 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}