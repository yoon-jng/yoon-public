import { ReagentItem, ExpiryState, QtyState, DuplicateGroup } from '../types';

export const BASE_DATE_STR = '2026-08-27';

// Parse date string 'YYYY-MM-DD' to UTC midnight timestamp to calculate day difference correctly
export function parseDateOnly(dateStr: string): number | null {
  if (!dateStr || !dateStr.trim()) return null;
  const clean = dateStr.trim().substring(0, 10);
  const parts = clean.split(/[-/]/);
  if (parts.length !== 3) return null;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
  return Date.UTC(year, month, day);
}

export function calculateDDay(expiryDateStr: string, baseDateStr: string = BASE_DATE_STR): number | null {
  const expTs = parseDateOnly(expiryDateStr);
  const baseTs = parseDateOnly(baseDateStr);
  if (expTs === null || baseTs === null) return null;
  const diffMs = expTs - baseTs;
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export function getExpiryState(dDay: number | null): ExpiryState {
  if (dDay === null) return '유효기간 미기재';
  if (dDay <= 0) return '만료';
  if (dDay <= 30) return '임박';
  return '정상';
}

export function calculateRemainRate(initQty: number | null, remainQty: number | null): { rate: number | null; state: QtyState } {
  if (remainQty === null || remainQty === undefined || isNaN(remainQty)) {
    return { rate: null, state: '잔량 미기재' };
  }
  if (initQty === null || initQty === undefined || isNaN(initQty) || initQty <= 0) {
    return { rate: null, state: '데이터 오류' };
  }
  const rate = (remainQty / initQty) * 100;
  if (rate > 100) {
    return { rate: Math.round(rate * 10) / 10, state: '데이터 오류' };
  }
  if (rate <= 20) {
    return { rate: Math.round(rate * 10) / 10, state: '부족' };
  }
  return { rate: Math.round(rate * 10) / 10, state: '정상' };
}

export function getWarnRank(expiryState: ExpiryState, qtyState: QtyState, isDuplicate: boolean): number {
  if (expiryState === '만료') return 0;
  if (qtyState === '데이터 오류') return 1;
  if (qtyState === '부족') return 2;
  if (expiryState === '임박') return 3;
  if (isDuplicate) return 4;
  return 5;
}

export function parseCSVLine(text: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

export function parseRawDataToItems(csvText: string): ReagentItem[] {
  const lines = csvText.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length < 2) return [];

  // Parse header
  const header = parseCSVLine(lines[0]).map(h => h.replace(/^["']|["']$/g, '').trim());
  
  const rawRows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const vals = parseCSVLine(lines[i]).map(v => v.replace(/^["']|["']$/g, '').trim());
    const row: Record<string, string> = {};
    header.forEach((h, idx) => {
      row[h] = vals[idx] !== undefined ? vals[idx] : '';
    });
    if (row.reagent_id) {
      rawRows.push(row);
    }
  }

  // 1. First pass to group by cas_no and check duplicate candidate names (exact raw string match)
  const casToNamesMap = new Map<string, Set<string>>();
  rawRows.forEach(r => {
    const cas = r.cas_no || '';
    const name = r.reagent_name || '';
    if (cas && name) {
      if (!casToNamesMap.has(cas)) {
        casToNamesMap.set(cas, new Set());
      }
      casToNamesMap.get(cas)!.add(name);
    }
  });

  const duplicateCasSet = new Set<string>();
  casToNamesMap.forEach((names, cas) => {
    if (names.size >= 2) {
      duplicateCasSet.add(cas);
    }
  });

  // 2. Second pass to build ReagentItem objects
  const items: ReagentItem[] = rawRows.map(r => {
    const initQty = r.init_qty !== '' && r.init_qty !== undefined && !isNaN(Number(r.init_qty)) ? Number(r.init_qty) : null;
    const remainQty = r.remain_qty !== '' && r.remain_qty !== undefined && !isNaN(Number(r.remain_qty)) ? Number(r.remain_qty) : null;

    const dDay = calculateDDay(r.expiry_date);
    const expiryState = getExpiryState(dDay);
    const { rate: remainRate, state: qtyState } = calculateRemainRate(initQty, remainQty);
    
    const cas = r.cas_no || '';
    const isDuplicateCandidate = duplicateCasSet.has(cas);
    const warnRank = getWarnRank(expiryState, qtyState, isDuplicateCandidate);

    return {
      reagent_id: r.reagent_id || '',
      reagent_name: r.reagent_name || '',
      cas_no: cas,
      hazard_class: r.hazard_class || '해당없음',
      storage_temp: r.storage_temp || 'RT',
      location: r.location || '',
      init_qty: initQty,
      remain_qty: remainQty,
      qty_unit: r.qty_unit || 'mL',
      receipt_date: r.receipt_date || '',
      expiry_date: r.expiry_date || '',
      emp_name: r.emp_name || '',
      remark: r.remark || '',
      dDay,
      expiryState,
      remainRate,
      qtyState,
      isDuplicateCandidate,
      warnRank,
    };
  });

  return items;
}

export function computeDuplicateGroups(items: ReagentItem[]): DuplicateGroup[] {
  const map = new Map<string, ReagentItem[]>();
  items.forEach(item => {
    if (!item.cas_no) return;
    if (!map.has(item.cas_no)) {
      map.set(item.cas_no, []);
    }
    map.get(item.cas_no)!.push(item);
  });

  const groups: DuplicateGroup[] = [];
  map.forEach((groupItems, casNo) => {
    const namesSet = new Set(groupItems.map(i => i.reagent_name));
    if (namesSet.size >= 2) {
      const totalRemainQty = groupItems.reduce((acc, cur) => acc + (cur.remain_qty || 0), 0);
      const unit = groupItems[0]?.qty_unit || 'mL';
      groups.push({
        casNo,
        names: Array.from(namesSet),
        totalRows: groupItems.length,
        totalRemainQty,
        unit,
        items: groupItems,
      });
    }
  });

  return groups;
}

export function generateOrderCandidatesText(items: ReagentItem[]): string {
  const targets = items.filter(i => i.expiryState === '만료' || i.expiryState === '임박' || i.qtyState === '부족');
  const header = ['시약ID', '시약명', 'CAS번호', '보관위치', '담당자', '유효기간', '잔량', '판정사유'].join('\t');
  const rows = targets.map(i => {
    let reason = '';
    if (i.expiryState === '만료') reason = `유효기간 만료 (D${i.dDay})`;
    else if (i.expiryState === '임박') reason = `유효기간 임박 (D-${i.dDay})`;
    else if (i.qtyState === '부족') reason = `잔량 부족 (${i.remainRate}%)`;
    else reason = '점검 필요';

    return [
      i.reagent_id,
      i.reagent_name,
      i.cas_no,
      i.location,
      i.emp_name,
      i.expiry_date || '미기재',
      i.remain_qty !== null ? `${i.remain_qty}${i.qty_unit}` : '미기재',
      reason,
    ].join('\t');
  });

  return [header, ...rows].join('\n');
}
