import React from 'react';
import { ReagentItem } from '../types';
import { AlertCircle, Clock, CheckCircle, Copy, AlertTriangle } from 'lucide-react';

interface ReagentTableProps {
  items: ReagentItem[];
  onSelectItem: (item: ReagentItem) => void;
}

export const ReagentTable: React.FC<ReagentTableProps> = ({ items, onSelectItem }) => {
  if (items.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs">
        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-800 mb-1">조건에 해당하는 시약이 없습니다</h3>
        <p className="text-xs text-slate-500">검색어 또는 필터를 변경하거나 필터를 초기화해 보세요.</p>
      </div>
    );
  }

  const getHazardBadgeStyle = (hazard: string) => {
    switch (hazard) {
      case '인화성':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case '독성':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case '부식성':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case '산화성':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStorageBadgeStyle = (temp: string) => {
    switch (temp) {
      case '-20℃':
        return 'bg-indigo-900 text-white';
      case '4℃':
        return 'bg-sky-100 text-sky-800';
      default:
        return 'bg-slate-200 text-slate-800';
    }
  };

  const getExpiryBadge = (item: ReagentItem) => {
    const { dDay, expiryState } = item;
    if (expiryState === '유효기간 미기재') {
      return <span className="px-2 py-0.5 text-[11px] font-medium bg-slate-100 text-slate-600 rounded">미기재</span>;
    }
    if (expiryState === '만료') {
      const label = dDay === 0 ? 'D-DAY (만료)' : `D+${Math.abs(dDay!)} (만료)`;
      return <span className="px-2 py-0.5 text-[11px] font-bold bg-rose-100 text-rose-700 rounded border border-rose-200">{label}</span>;
    }
    if (expiryState === '임박') {
      return <span className="px-2 py-0.5 text-[11px] font-bold bg-amber-100 text-amber-800 rounded border border-amber-200">D-{dDay} (임박)</span>;
    }
    return <span className="px-2 py-0.5 text-[11px] font-medium bg-emerald-50 text-emerald-700 rounded">D-{dDay}</span>;
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
              <th className="py-3 px-4">시약 ID / 명칭</th>
              <th className="py-3 px-3">CAS 번호</th>
              <th className="py-3 px-3">등급 / 보관</th>
              <th className="py-3 px-3">보관위치</th>
              <th className="py-3 px-3">유효기간 (D-day)</th>
              <th className="py-3 px-3">잔량 (초기량)</th>
              <th className="py-3 px-3">담당자</th>
              <th className="py-3 px-4 text-right">상세</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {items.map((item) => {
              const hasError = item.qtyState === '데이터 오류';
              const isDeficit = item.qtyState === '부족';
              const rateVal = item.remainRate !== null ? Math.min(Math.max(item.remainRate, 0), 100) : 0;

              return (
                <tr
                  key={item.reagent_id}
                  onClick={() => onSelectItem(item)}
                  className="hover:bg-slate-50/80 transition cursor-pointer group"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-semibold text-indigo-600">{item.reagent_id}</span>
                      {item.isDuplicateCandidate && (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold bg-purple-100 text-purple-700 rounded flex items-center" title="동일 CAS 명칭 상이 중복 후보">
                          <Copy className="w-3 h-3 mr-0.5" /> 중복후보
                        </span>
                      )}
                    </div>
                    <div className="font-medium text-slate-900 mt-0.5">{item.reagent_name}</div>
                    {item.remark && <div className="text-[11px] text-slate-400 italic truncate max-w-[220px]">{item.remark}</div>}
                  </td>

                  <td className="py-3 px-3 font-mono text-slate-600">{item.cas_no}</td>

                  <td className="py-3 px-3 space-y-1">
                    <div className="flex flex-wrap gap-1">
                      <span className={`px-2 py-0.5 text-[10px] font-medium rounded border ${getHazardBadgeStyle(item.hazard_class)}`}>
                        {item.hazard_class}
                      </span>
                      <span className={`px-2 py-0.5 text-[10px] font-semibold rounded ${getStorageBadgeStyle(item.storage_temp)}`}>
                        {item.storage_temp}
                      </span>
                    </div>
                  </td>

                  <td className="py-3 px-3 text-slate-700 font-medium">{item.location}</td>

                  <td className="py-3 px-3 whitespace-nowrap">
                    {getExpiryBadge(item)}
                    <div className="text-[10px] text-slate-400 mt-0.5">{item.expiry_date || '미기재'}</div>
                  </td>

                  <td className="py-3 px-3 min-w-[140px]">
                    <div className="flex items-center justify-between font-mono text-slate-700 mb-1">
                      <span>
                        {item.remain_qty !== null ? item.remain_qty : '공란'} / {item.init_qty !== null ? item.init_qty : '-'} {item.qty_unit}
                      </span>
                      <span className={`text-[10px] font-bold px-1 rounded ${
                        hasError ? 'bg-red-100 text-red-700' : isDeficit ? 'bg-orange-100 text-orange-800' : 'text-slate-500'
                      }`}>
                        {item.remainRate !== null ? `${item.remainRate}%` : item.qtyState}
                      </span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          hasError
                            ? 'bg-red-500'
                            : isDeficit
                            ? 'bg-orange-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(rateVal, 100)}%` }}
                      />
                    </div>
                  </td>

                  <td className="py-3 px-3 text-slate-700 font-medium">{item.emp_name}</td>

                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectItem(item);
                      }}
                      className="px-2.5 py-1 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition"
                    >
                      상세
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
