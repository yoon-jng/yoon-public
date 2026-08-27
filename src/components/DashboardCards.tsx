import React from 'react';
import { AlertOctagon, Clock, AlertTriangle, XCircle, Copy, FileQuestion } from 'lucide-react';
import { SummaryStats } from '../types';

interface DashboardCardsProps {
  stats: SummaryStats;
  activeFilter: string;
  onSelectFilter: (filterKey: string) => void;
}

export const DashboardCards: React.FC<DashboardCardsProps> = ({ stats, activeFilter, onSelectFilter }) => {
  const cards = [
    {
      id: 'EXPIRED',
      label: '만료 대상',
      count: stats.expiredCount,
      color: 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100',
      badgeColor: 'bg-rose-100 text-rose-800',
      activeColor: 'ring-2 ring-rose-500 bg-rose-100',
      icon: AlertOctagon,
      iconColor: 'text-rose-600',
    },
    {
      id: 'IMMINENT',
      label: '임박 (30일내)',
      count: stats.imminentCount,
      color: 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100',
      badgeColor: 'bg-amber-100 text-amber-900',
      activeColor: 'ring-2 ring-amber-500 bg-amber-100',
      icon: Clock,
      iconColor: 'text-amber-600',
    },
    {
      id: 'DEFICIT',
      label: '잔량 부족 (≤20%)',
      count: stats.deficitCount,
      color: 'bg-orange-50 border-orange-200 text-orange-800 hover:bg-orange-100',
      badgeColor: 'bg-orange-100 text-orange-900',
      activeColor: 'ring-2 ring-orange-500 bg-orange-100',
      icon: AlertTriangle,
      iconColor: 'text-orange-600',
    },
    {
      id: 'ERROR',
      label: '데이터 오류 (>100%)',
      count: stats.errorCount,
      color: 'bg-red-50 border-red-200 text-red-800 hover:bg-red-100',
      badgeColor: 'bg-red-100 text-red-900',
      activeColor: 'ring-2 ring-red-500 bg-red-100',
      icon: XCircle,
      iconColor: 'text-red-600',
    },
    {
      id: 'DUPLICATE',
      label: '중복 등록 후보',
      count: stats.duplicateGroupCount,
      color: 'bg-purple-50 border-purple-200 text-purple-800 hover:bg-purple-100',
      badgeColor: 'bg-purple-100 text-purple-900',
      activeColor: 'ring-2 ring-purple-500 bg-purple-100',
      icon: Copy,
      iconColor: 'text-purple-600',
    },
    {
      id: 'MISSING',
      label: '일자/잔량 결측',
      count: stats.missingCount,
      color: 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100',
      badgeColor: 'bg-slate-200 text-slate-800',
      activeColor: 'ring-2 ring-slate-500 bg-slate-100',
      icon: FileQuestion,
      iconColor: 'text-slate-600',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {cards.map(card => {
        const Icon = card.icon;
        const isActive = activeFilter === card.id;
        return (
          <button
            key={card.id}
            onClick={() => onSelectFilter(isActive ? 'ALL' : card.id)}
            className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between ${card.color} ${isActive ? card.activeColor : 'shadow-xs'}`}
          >
            <div className="flex items-center justify-between w-full mb-2">
              <span className="text-xs font-medium text-slate-600">{card.label}</span>
              <Icon className={`w-4 h-4 ${card.iconColor}`} />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold">{card.count}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${card.badgeColor}`}>
                {isActive ? '필터링 중' : '클릭 필터'}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
};
