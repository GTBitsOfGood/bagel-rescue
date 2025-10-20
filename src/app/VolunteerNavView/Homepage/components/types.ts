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
  loading: boolean;
  error: string | null;
  onShiftClick?: (shift: UserShiftData) => void;
};