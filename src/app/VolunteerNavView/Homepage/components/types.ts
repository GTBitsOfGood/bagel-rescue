import { UserShiftData } from "@/server/db/actions/userShifts";

export type ViewMode = "Day" | "Week";

export type PaginationProps = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export type DateNavigationProps = {
  currentDate: Date;
  viewMode: ViewMode;
  onPrevious: () => void;
  onNext: () => void;
  onViewModeChange: (mode: ViewMode) => void;
};

export type ShiftsTableProps = {
  shifts: UserShiftData[];
  date: Date;
  showShifts: boolean;
  loadingProgress: number;
  error: string | null;
  isOpenShifts?: boolean;
  onShiftUpdated?: () => void;
  viewingDate: Date;
  userShifts?: UserShiftData[];
};
