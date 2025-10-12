import { create } from 'zustand';
import { EditShiftProps } from '../components/WeeklyShiftSidebar';


interface ShiftStore {
    shiftSidebarInfo: EditShiftProps | null;
    setShiftSidebarInfo: (info: EditShiftProps | null) => void;
  }


export const useShiftStore = create<ShiftStore>((set) => ({
  shiftSidebarInfo: null,
  setShiftSidebarInfo: (info) => set({ shiftSidebarInfo: info }),
}));