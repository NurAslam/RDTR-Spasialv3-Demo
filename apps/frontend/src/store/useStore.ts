import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { api, type RDTRInfo, type Kabupaten } from '@/lib/api';

interface ViewState {
  view: 'grid' | 'map';
}

interface SelectionState {
  selectedProvince: string | null;
  selectedKabupaten: string | null;
  selectedRDTR: RDTRInfo | null;
  selectedFeature: Record<string, any> | null;
  selectedCoords: { lat: number; lng: number } | null;
}

interface DataState {
  provinces: string[];
  kabupatens: Kabupaten[];
  rdtrList: RDTRInfo[];
  summary: {
    total_features: number;
    areas: Array<{ name: string; features: number }>;
    zones: Record<string, { count: number; color: string }>;
  } | null;
  loading: boolean;
  error: string | null;
}

interface UIState {
  leftSidebarCollapsed: boolean;
  activeDetailTab: string;
  zoneFilterExpanded: boolean;
  visibleZones: string[];
}

type StoreState = ViewState &
  SelectionState &
  DataState &
  UIState & {
    // Actions
    setView: (view: 'grid' | 'map') => void;
    setSelectedProvince: (province: string | null) => void;
    setSelectedKabupaten: (kabupaten: string | null) => void;
    setSelectedRDTR: (rdtr: RDTRInfo | null) => void;
    setSelectedFeature: (feature: Record<string, any> | null) => void;
    setSelectedCoords: (coords: { lat: number; lng: number } | null) => void;
    toggleLeftSidebar: () => void;
    setLeftSidebarCollapsed: (collapsed: boolean) => void;
    setActiveDetailTab: (tab: string) => void;
    setZoneFilterExpanded: (expanded: boolean) => void;
    setVisibleZones: (zones: string[]) => void;
    loadProvinces: () => Promise<void>;
    loadKabupatens: (province: string) => Promise<void>;
    loadRDTRList: (province: string, kabupaten: string) => Promise<void>;
    loadSummary: () => Promise<void>;
    resetSelection: () => void;
  };

export const useStore = create<StoreState>()(
  devtools(
    (set, get) => ({
      // Initial state
      view: 'grid',
      selectedProvince: null,
      selectedKabupaten: null,
      selectedRDTR: null,
      selectedFeature: null,
      selectedCoords: null,
      provinces: [],
      kabupatens: [],
      rdtrList: [],
      summary: null,
      loading: false,
      error: null,
      leftSidebarCollapsed: false,
      activeDetailTab: 'identitas',
      zoneFilterExpanded: true,
      visibleZones: [],

      // Actions
      setView: (view) => set({ view }),

      setSelectedProvince: async (province) => {
        set({
          selectedProvince: province,
          selectedKabupaten: null,
          selectedRDTR: null,
          selectedFeature: null,
          kabupatens: [],
          rdtrList: [],
        });
        if (province) {
          await get().loadKabupatens(province);
        }
      },

      setSelectedKabupaten: async (kabupaten) => {
        set({
          selectedKabupaten: kabupaten,
          selectedRDTR: null,
          selectedFeature: null,
          rdtrList: [],
        });
        if (kabupaten && get().selectedProvince) {
          await get().loadRDTRList(get().selectedProvince!, kabupaten);
        }
      },

      setSelectedRDTR: (rdtr) => {
        set({ selectedRDTR: rdtr, selectedFeature: null, selectedCoords: null });
        // Only switch to map view if selecting an RDTR
        if (rdtr) {
          set({ view: 'map' });
        }
      },

      setSelectedFeature: (feature) => {
        set({ selectedFeature: feature });
        // Update body class for sidebar visibility
        if (feature) {
          document.body.classList.add('detail-visible');
        } else {
          document.body.classList.remove('detail-visible');
        }
      },

      setSelectedCoords: (coords) => set({ selectedCoords: coords }),

      toggleLeftSidebar: () => set((state) => ({ leftSidebarCollapsed: !state.leftSidebarCollapsed })),

      setLeftSidebarCollapsed: (collapsed) => set({ leftSidebarCollapsed: collapsed }),

      setActiveDetailTab: (tab) => set({ activeDetailTab: tab }),

      setZoneFilterExpanded: (expanded) => set({ zoneFilterExpanded: expanded }),

      setVisibleZones: (zones) => set({ visibleZones: zones }),

      loadProvinces: async () => {
        set({ loading: true, error: null });
        try {
          const provinces = await api.getProvinces();
          set({ provinces, loading: false });
        } catch (error) {
          set({ error: (error as Error).message, loading: false });
        }
      },

      loadKabupatens: async (province) => {
        set({ loading: true, error: null });
        try {
          const kabupatens = await api.getKabupatens(province);
          set({ kabupatens, loading: false });
        } catch (error) {
          set({ error: (error as Error).message, loading: false });
        }
      },

      loadRDTRList: async (province, kabupaten) => {
        set({ loading: true, error: null });
        try {
          const rdtrList = await api.getRDTRList(province, kabupaten);
          set({ rdtrList, loading: false });
        } catch (error) {
          set({ error: (error as Error).message, loading: false });
        }
      },

      loadSummary: async () => {
        set({ loading: true, error: null });
        try {
          const summary = await api.getSummary();
          set({ summary, loading: false });
        } catch (error) {
          set({ error: (error as Error).message, loading: false });
        }
      },

      resetSelection: () => {
        set({
          selectedProvince: null,
          selectedKabupaten: null,
          selectedRDTR: null,
          selectedFeature: null,
          selectedCoords: null,
          kabupatens: [],
          rdtrList: [],
          view: 'grid',
        });
        document.body.classList.remove('detail-visible');
      },
    }),
    { name: 'rdtr-spasial-store' }
  )
);
