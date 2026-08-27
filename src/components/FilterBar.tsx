import React from 'react';
import { Search, Filter, ArrowUpDown, X } from 'lucide-react';
import { FilterOptions } from '../types';

interface FilterBarProps {
  filters: FilterOptions;
  onChangeFilters: (newFilters: Partial<FilterOptions>) => void;
  onResetFilters: () => void;
  totalFiltered: number;
  totalCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onChangeFilters,
  onResetFilters,
  totalFiltered,
  totalCount,
}) => {
  const hasActiveFilters =
    filters.searchQuery !== '' ||
    filters.warningFilter !== 'ALL' ||
    filters.hazardFilter !== 'ALL' ||
    filters.storageFilter !== 'ALL' ||
    filters.labFilter !== 'ALL';

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 shadow-xs space-y-3">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="시약명, CAS 번호, 보관위치, 담당자 검색..."
            value={filters.searchQuery}
            onChange={e => onChangeFilters({ searchQuery: e.target.value })}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
          />
          {filters.searchQuery && (
            <button
              onClick={() => onChangeFilters({ searchQuery: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort selector */}
        <div className="flex items-center space-x-2">
          <ArrowUpDown className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={filters.sortBy}
            onChange={e => onChangeFilters({ sortBy: e.target.value })}
            className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="warn_rank">정렬: 경고 우선순위</option>
            <option value="d_day_asc">정렬: 유효기간 임박순 (D-day)</option>
            <option value="remain_asc">정렬: 잔량률 낮은순</option>
            <option value="id_asc">정렬: 시약 ID순 (RG-001...)</option>
          </select>
        </div>
      </div>

      {/* Advanced Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
        <div className="flex items-center text-slate-500 font-medium mr-1">
          <Filter className="w-3.5 h-3.5 mr-1" />
          상세 필터:
        </div>

        {/* Warning status filter */}
        <select
          value={filters.warningFilter}
          onChange={e => onChangeFilters({ warningFilter: e.target.value })}
          className="bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1 text-slate-700 font-medium"
        >
          <option value="ALL">경고 구분: 전체</option>
          <option value="EXPIRED">만료 대상만</option>
          <option value="IMMINENT">유효기간 임박만</option>
          <option value="DEFICIT">잔량 부족만</option>
          <option value="ERROR">데이터 오류만</option>
          <option value="DUPLICATE">중복 등록 후보만</option>
          <option value="MISSING">일자/잔량 결측만</option>
        </select>

        {/* Hazard Class filter */}
        <select
          value={filters.hazardFilter}
          onChange={e => onChangeFilters({ hazardFilter: e.target.value })}
          className="bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1 text-slate-700 font-medium"
        >
          <option value="ALL">위험물등급: 전체</option>
          <option value="인화성">인화성</option>
          <option value="독성">독성</option>
          <option value="부식성">부식성</option>
          <option value="산화성">산화성</option>
          <option value="해당없음">해당없음</option>
        </select>

        {/* Storage Temp filter */}
        <select
          value={filters.storageFilter}
          onChange={e => onChangeFilters({ storageFilter: e.target.value })}
          className="bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1 text-slate-700 font-medium"
        >
          <option value="ALL">보관온도: 전체</option>
          <option value="RT">RT (실온)</option>
          <option value="4℃">4℃ (냉장)</option>
          <option value="-20℃">-20℃ (냉동)</option>
        </select>

        {/* Lab filter */}
        <select
          value={filters.labFilter}
          onChange={e => onChangeFilters({ labFilter: e.target.value })}
          className="bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1 text-slate-700 font-medium"
        >
          <option value="ALL">연구실: 전체</option>
          <option value="LAB-1">LAB-1</option>
          <option value="LAB-2">LAB-2</option>
          <option value="LAB-3">LAB-3</option>
        </select>

        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium ml-auto"
          >
            <X className="w-3.5 h-3.5 mr-0.5" />
            필터 초기화 ({totalFiltered}/{totalCount}건)
          </button>
        )}
      </div>
    </div>
  );
};
