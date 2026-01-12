import { create } from 'zustand';

export const useTestStore = create((set, get) => ({
  // Current test session state
  results: null,
  loading: false,
  error: null,
  
  // History
  history: [],
  
  // Filters
  filters: {
    status: null, // 'PASS', 'FAIL', null
    searchQuery: '',
  },
  
  // Sort
  sortBy: 'time', // 'time', 'responseTime', 'name'
  sortOrder: 'desc', // 'asc', 'desc'

  // Actions
  setResults: (results) => set({ results }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  
  clearError: () => set({ error: null }),
  clearResults: () => set({ results: null, error: null }),

  addToHistory: (result) => set((state) => ({
    history: [result, ...state.history].slice(0, 50)
  })),

  setFilter: (status) => set((state) => ({
    filters: { ...state.filters, status }
  })),

  setSearchQuery: (query) => set((state) => ({
    filters: { ...state.filters, searchQuery: query }
  })),

  setSortBy: (sortBy) => set({ sortBy }),
  setSortOrder: (sortOrder) => set({ sortOrder }),

  // Getters
  getFilteredResults: () => {
    const state = get();
    if (!state.results) return null;

    let filtered = [...state.results.results];
    
    if (state.filters.status) {
      filtered = filtered.filter(t => t.status === state.filters.status);
    }
    
    if (state.filters.searchQuery) {
      const query = state.filters.searchQuery.toLowerCase();
      filtered = filtered.filter(t =>
        t.name.toLowerCase().includes(query) ||
        t.actualStatus.toString().includes(query)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal, bVal;
      switch (state.sortBy) {
        case 'responseTime':
          aVal = a.responseTime;
          bVal = b.responseTime;
          break;
        case 'name':
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
          break;
        default:
          return 0;
      }

      if (typeof aVal === 'string') {
        return state.sortOrder === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      return state.sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });

    return {
      ...state.results,
      results: filtered,
    };
  },
}));
