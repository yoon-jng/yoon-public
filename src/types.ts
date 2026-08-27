export type HazardClass = '인화성' | '독성' | '부식성' | '산화성' | '해당없음' | string;
export type StorageTemp = 'RT' | '4℃' | '-20℃' | string;

export type ExpiryState = '만료' | '임박' | '정상' | '유효기간 미기재';
export type QtyState = '데이터 오류' | '부족' | '정상' | '잔량 미기재';

export interface ReagentItem {
  reagent_id: string;
  reagent_name: string;
  cas_no: string;
  hazard_class: HazardClass;
  storage_temp: StorageTemp;
  location: string;
  init_qty: number | null;
  remain_qty: number | null;
  qty_unit: string;
  receipt_date: string;
  expiry_date: string;
  emp_name: string;
  remark?: string;

  // Computed fields
  dDay: number | null;
  expiryState: ExpiryState;
  remainRate: number | null; // percentage
  qtyState: QtyState;
  isDuplicateCandidate: boolean;
  warnRank: number; // 0:만료, 1:데이터오류, 2:부족, 3:임박, 4:중복후보, 5:정상
}

export interface DuplicateGroup {
  casNo: string;
  names: string[];
  totalRows: number;
  totalRemainQty: number;
  unit: string;
  items: ReagentItem[];
}

export interface FilterOptions {
  searchQuery: string;
  warningFilter: string; // 'ALL' | 'EXPIRED' | 'IMMINENT' | 'DEFICIT' | 'ERROR' | 'DUPLICATE' | 'MISSING'
  hazardFilter: string;
  storageFilter: string;
  labFilter: string;
  sortBy: string; // 'warn_rank' | 'd_day_asc' | 'remain_asc' | 'id_asc'
}

export interface SummaryStats {
  totalCount: number;
  expiredCount: number;
  imminentCount: number;
  deficitCount: number;
  errorCount: number;
  duplicateGroupCount: number;
  missingCount: number;
}
