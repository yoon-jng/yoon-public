import React, { useState, useEffect, useMemo } from 'react';
import { ReagentItem, FilterOptions, SummaryStats, DuplicateGroup } from './types';
import { RAW_CSV_DATA } from './data/initialData';
import { parseRawDataToItems, computeDuplicateGroups } from './utils/reagentUtils';
import { Header } from './components/Header';
import { DashboardCards } from './components/DashboardCards';
import { FilterBar } from './components/FilterBar';
import { ReagentTable } from './components/ReagentTable';
import { ReagentDetailModal } from './components/ReagentDetailModal';
import { ImportModal } from './components/ImportModal';
import { OrderListModal } from './components/OrderListModal';

const LOCAL_STORAGE_KEY = 'reagent_inventory_data_v1';

export default function App() {
  const [items, setItems] = useState<ReagentItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load from localStorage', e);
    }
    return parseRawDataToItems(RAW_CSV_DATA);
  });

  const [filters, setFilters] = useState<FilterOptions>({
    searchQuery: '',
    warningFilter: 'ALL',
    hazardFilter: 'ALL',
    storageFilter: 'ALL',
    labFilter: 'ALL',
    sortBy: 'warn_rank',
  });

  const [selectedItem, setSelectedItem] = useState<ReagentItem | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showOrderListModal, setShowOrderListModal] = useState(false);

  // Save to localStorage whenever items change
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }, [items]);

  const duplicateGroups = useMemo(() => computeDuplicateGroups(items), [items]);

  // Summary statistics computation (F-08 / 5.8)
  const stats: SummaryStats = useMemo(() => {
    const totalCount = items.length;
    const expiredCount = items.filter(i => i.expiryState === '만료').length;
    const imminentCount = items.filter(i => i.expiryState === '임박').length;
    const deficitCount = items.filter(i => i.qtyState === '부족').length;
    const errorCount = items.filter(i => i.qtyState === '데이터 오류').length;
    const duplicateGroupCount = duplicateGroups.length;
    const missingCount = items.filter(i => i.expiry_date === '' || i.remain_qty === null).length;

    return {
      totalCount,
      expiredCount,
      imminentCount,
      deficitCount,
      errorCount,
      duplicateGroupCount,
      missingCount,
    };
  }, [items, duplicateGroups]);

  // Filter and sort items
  const filteredAndSortedItems = useMemo(() => {
    let result = [...items];

    // Search query filter (reagent_name, cas_no, location, emp_name)
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase().trim();
      result = result.filter(
        i =>
          i.reagent_name.toLowerCase().includes(q) ||
          i.cas_no.toLowerCase().includes(q) ||
          i.location.toLowerCase().includes(q) ||
          i.emp_name.toLowerCase().includes(q)
      );
    }

    // Warning filter
    if (filters.warningFilter === 'EXPIRED') {
      result = result.filter(i => i.expiryState === '만료');
    } else if (filters.warningFilter === 'IMMINENT') {
      result = result.filter(i => i.expiryState === '임박');
    } else if (filters.warningFilter === 'DEFICIT') {
      result = result.filter(i => i.qtyState === '부족');
    } else if (filters.warningFilter === 'ERROR') {
      result = result.filter(i => i.qtyState === '데이터 오류');
    } else if (filters.warningFilter === 'DUPLICATE') {
      result = result.filter(i => i.isDuplicateCandidate);
    } else if (filters.warningFilter === 'MISSING') {
      result = result.filter(i => i.expiry_date === '' || i.remain_qty === null);
    }

    // Hazard filter
    if (filters.hazardFilter !== 'ALL') {
      result = result.filter(i => i.hazard_class === filters.hazardFilter);
    }

    // Storage filter
    if (filters.storageFilter !== 'ALL') {
      result = result.filter(i => i.storage_temp === filters.storageFilter);
    }

    // Lab filter
    if (filters.labFilter !== 'ALL') {
      result = result.filter(i => i.location.startsWith(filters.labFilter));
    }

    // Sorting
    result.sort((a, b) => {
      if (filters.sortBy === 'warn_rank') {
        if (a.warnRank !== b.warnRank) return a.warnRank - b.warnRank;
        if ((a.dDay ?? 9999) !== (b.dDay ?? 9999)) return (a.dDay ?? 9999) - (b.dDay ?? 9999);
        return a.reagent_id.localeCompare(b.reagent_id);
      } else if (filters.sortBy === 'd_day_asc') {
        const da = a.dDay !== null ? a.dDay : 9999;
        const db = b.dDay !== null ? b.dDay : 9999;
        if (da !== db) return da - db;
        return a.reagent_id.localeCompare(b.reagent_id);
      } else if (filters.sortBy === 'remain_asc') {
        const ra = a.remainRate !== null ? a.remainRate : 999;
        const rb = b.remainRate !== null ? b.remainRate : 999;
        if (ra !== rb) return ra - rb;
        return a.reagent_id.localeCompare(b.reagent_id);
      } else if (filters.sortBy === 'id_asc') {
        return a.reagent_id.localeCompare(b.reagent_id);
      }
      return 0;
    });

    return result;
  }, [items, filters]);

  const handleResetSample = () => {
    if (window.confirm('기본 80행 샘플 데이터로 초기화하시겠습니까? (수정된 내용이 초기화됩니다)')) {
      const freshItems = parseRawDataToItems(RAW_CSV_DATA);
      setItems(freshItems);
      setFilters({
        searchQuery: '',
        warningFilter: 'ALL',
        hazardFilter: 'ALL',
        storageFilter: 'ALL',
        labFilter: 'ALL',
        sortBy: 'warn_rank',
      });
    }
  };

  const handleUpdateItem = (updated: ReagentItem) => {
    // Re-calculate derived fields for updated item
    const newItems = items.map(i => {
      if (i.reagent_id === updated.reagent_id) {
        return updated;
      }
      return i;
    });
    // Re-run duplicate check on new items
    const freshParsed = parseRawDataToItems(RAW_CSV_DATA); // or compute dynamic
    // Let's re-run duplicate group determination
    const casToNamesMap = new Map<string, Set<string>>();
    newItems.forEach(r => {
      const cas = r.cas_no || '';
      const name = r.reagent_name || '';
      if (cas && name) {
        if (!casToNamesMap.has(cas)) casToNamesMap.set(cas, new Set());
        casToNamesMap.get(cas)!.add(name);
      }
    });
    const duplicateCasSet = new Set<string>();
    casToNamesMap.forEach((names, cas) => {
      if (names.size >= 2) duplicateCasSet.add(cas);
    });

    const finalized = newItems.map(i => {
      const isDup = duplicateCasSet.has(i.cas_no);
      const rank = (i.expiryState === '만료' ? 0 : i.qtyState === '데이터 오류' ? 1 : i.qtyState === '부족' ? 2 : i.expiryState === '임박' ? 3 : isDup ? 4 : 5);
      return {
        ...i,
        isDuplicateCandidate: isDup,
        warnRank: rank,
      };
    });

    setItems(finalized);
    setSelectedItem(null);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans antialiased">
      <Header
        stats={stats}
        onOpenImport={() => setShowImportModal(true)}
        onOpenOrderList={() => setShowOrderListModal(true)}
        onResetSample={handleResetSample}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Dashboard 6 Summary Cards */}
        <DashboardCards
          stats={stats}
          activeFilter={filters.warningFilter}
          onSelectFilter={(filterKey) => setFilters(prev => ({ ...prev, warningFilter: filterKey }))}
        />

        {/* Filter & Search Bar */}
        <FilterBar
          filters={filters}
          onChangeFilters={(newF) => setFilters(prev => ({ ...prev, ...newF }))}
          onResetFilters={() => setFilters({
            searchQuery: '',
            warningFilter: 'ALL',
            hazardFilter: 'ALL',
            storageFilter: 'ALL',
            labFilter: 'ALL',
            sortBy: 'warn_rank',
          })}
          totalFiltered={filteredAndSortedItems.length}
          totalCount={items.length}
        />

        {/* Reagents Table / List */}
        <ReagentTable
          items={filteredAndSortedItems}
          onSelectItem={(item) => setSelectedItem(item)}
        />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        시약·시료 재고 관리대장 (PRD-R02) | 기준일: 2026-08-27 | 프론트엔드 단독 SPA
      </footer>

      {/* Modals */}
      {selectedItem && (
        <ReagentDetailModal
          item={selectedItem}
          duplicateGroups={duplicateGroups}
          onClose={() => setSelectedItem(null)}
          onUpdateItem={handleUpdateItem}
        />
      )}

      {showImportModal && (
        <ImportModal
          onClose={() => setShowImportModal(false)}
          onImportSuccess={(newItems) => {
            setItems(newItems);
            setFilters({
              searchQuery: '',
              warningFilter: 'ALL',
              hazardFilter: 'ALL',
              storageFilter: 'ALL',
              labFilter: 'ALL',
              sortBy: 'warn_rank',
            });
          }}
        />
      )}

      {showOrderListModal && (
        <OrderListModal
          items={items}
          onClose={() => setShowOrderListModal(false)}
        />
      )}
    </div>
  );
}
