import React from 'react';
import { getReadinessColor } from '@/utils/fleetCalculations';

interface ReadinessGaugeProps {
  score: number;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  busLabel?: boolean;
  reasons?: string[];
  className?: string;
}

export function ReadinessGauge({ 
  score, 
  size = 'md', 
  showLabel = true, 
  busLabel = false,
  reasons = [],
  className = ''
}: ReadinessGaugeProps) {
  const color = getReadinessColor(score);
  
  const dimensions = {
    xs: { radius: 14, stroke: 3, sizeClass: 'w-8 h-8', textClass: 'text-[9px] font-black' },
    sm: { radius: 18, stroke: 3.5, sizeClass: 'w-10 h-10', textClass: 'text-xs font-bold' },
    md: { radius: 26, stroke: 5, sizeClass: 'w-16 h-16', textClass: 'text-sm font-bold' },
    lg: { radius: 36, stroke: 7, sizeClass: 'w-24 h-24', textClass: 'text-lg font-black' },
  }[size];

  const circumference = 2 * Math.PI * dimensions.radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  if (busLabel) {
    return (
      <div 
        className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-xl bg-slate-50/90 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] ${className}`}
        id={`readiness-gauge-${score}`}
        title={`مستوى جاهزية الباص: ${score}% - ${color.label}`}
      >
        <div className={`relative flex items-center justify-center shrink-0 ${dimensions.sizeClass}`}>
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r={dimensions.radius * 1.3}
              className="stroke-slate-200 dark:stroke-slate-700"
              strokeWidth={dimensions.stroke * 1.2}
              fill="transparent"
            />
            <circle
              cx="50"
              cy="50"
              r={dimensions.radius * 1.3}
              className={`${color.ring} transition-all duration-700 ease-out`}
              strokeWidth={dimensions.stroke * 1.2}
              strokeDasharray={circumference * 1.3}
              strokeDashoffset={strokeDashoffset * 1.3}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>
          <span className={`absolute ${dimensions.textClass} ${color.text} leading-none`}>
            {score}%
          </span>
        </div>

        <div className="flex flex-col text-right leading-none select-none min-w-0">
          <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400">جاهزية الباص</span>
          <span className={`text-[8px] font-extrabold ${color.text} mt-0.5 truncate max-w-[65px]`}>
            {color.label}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`} id={`readiness-gauge-${score}`}>
      <div className={`relative flex items-center justify-center ${dimensions.sizeClass}`}>
        <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={dimensions.radius * 1.3}
            className="stroke-slate-100 dark:stroke-slate-700"
            strokeWidth={dimensions.stroke * 1.2}
            fill="transparent"
          />
          <circle
            cx="50"
            cy="50"
            r={dimensions.radius * 1.3}
            className={`${color.ring} transition-all duration-700 ease-out`}
            strokeWidth={dimensions.stroke * 1.2}
            strokeDasharray={circumference * 1.3}
            strokeDashoffset={strokeDashoffset * 1.3}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>
        <span className={`absolute ${dimensions.textClass} ${color.text}`}>
          {score}%
        </span>
      </div>

      {showLabel && (
        <div className="flex flex-col">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${color.badge}`}>
            {color.label}
          </span>
          {reasons.length > 0 && (
            <span className="text-[11px] text-slate-500 mt-0.5 max-w-[140px] truncate" title={reasons.join(', ')}>
              {reasons[0]}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

