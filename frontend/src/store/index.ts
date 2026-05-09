import { configureStore, createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as api from '../api';
import { Product, Pagination, AnalyticsData, CategoryCount, FilterState } from '../types';

// Products slice
interface ProductsState {
  data: Product[];
  pagination: Pagination;
  loading: boolean;
  error: string | null;
  filters: FilterState;
  categories: CategoryCount[];
}

const initialFilters: FilterState = {
  search: '',
  category: '',
  minRating: 0,
  maxRating: 5,
  page: 1,
  limit: 10,
};

export const loadProducts = createAsyncThunk(
  'products/load',
  async (filters: FilterState) => {
    const params: Record<string, unknown> = { ...filters };
    if (!params.category) delete params.category;
    if (!params.search) delete params.search;
    return await api.fetchProducts(params);
  }
);

export const loadCategories = createAsyncThunk('products/loadCategories', async () => {
  return await api.fetchCategories();
});

const productsSlice = createSlice({
  name: 'products',
  initialState: {
    data: [],
    pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
    loading: false,
    error: null,
    filters: initialFilters,
    categories: [],
  } as ProductsState,
  reducers: {
    setFilters(state, action: PayloadAction<Partial<FilterState>>) {
      state.filters = { ...state.filters, ...action.payload, page: 1 };
    },
    setPage(state, action: PayloadAction<number>) {
      state.filters.page = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadProducts.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(loadProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(loadProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load products';
      })
      .addCase(loadCategories.fulfilled, (state, action) => {
        state.categories = action.payload.data;
      });
  },
});

// Analytics slice
interface AnalyticsState {
  data: AnalyticsData | null;
  loading: boolean;
  error: string | null;
}

export const loadAnalytics = createAsyncThunk('analytics/load', async () => {
  return await api.fetchAnalytics();
});

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState: { data: null, loading: false, error: null } as AnalyticsState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadAnalytics.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(loadAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
      })
      .addCase(loadAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load analytics';
      });
  },
});

// Upload slice
interface UploadState {
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

export const uploadFile = createAsyncThunk('upload/file', async (file: File) => {
  return await api.importFile(file);
});

const uploadSlice = createSlice({
  name: 'upload',
  initialState: { loading: false, error: null, successMessage: null } as UploadState,
  reducers: {
    clearUploadState(state) { state.error = null; state.successMessage = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadFile.pending, (state) => { state.loading = true; state.error = null; state.successMessage = null; })
      .addCase(uploadFile.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
      })
      .addCase(uploadFile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Upload failed';
      });
  },
});

export const { setFilters, setPage } = productsSlice.actions;
export const { clearUploadState } = uploadSlice.actions;

export const store = configureStore({
  reducer: {
    products: productsSlice.reducer,
    analytics: analyticsSlice.reducer,
    upload: uploadSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
