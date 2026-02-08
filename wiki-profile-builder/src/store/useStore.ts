import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/services/firebase';

export type CategoryItem = {
  id: string;
  label: string;
  description?: string;
};

export type ImageItem = {
  id: string;
  name: string;
  url?: string;
  caption?: string;
  uploaded?: boolean;
};

export type Palette = {
  primary: string;
  accent: string;
  background: string;
  text: string;
};

interface WikiStore {
  // Auth state
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthLoading: boolean;
  setAuthLoading: (loading: boolean) => void;

  // Wiki state
  username: string;
  setUsername: (username: string) => void;
  selectedDomain: string;
  setSelectedDomain: (domain: string) => void;
  rawWikitext: string;
  setRawWikitext: (wikitext: string) => void;
  renderedHtml: string;
  setRenderedHtml: (html: string) => void;

  // Profile creation data
  categories: CategoryItem[];
  setCategories: (items: CategoryItem[]) => void;
  addCategory: (item: CategoryItem) => void;
  updateCategory: (id: string, data: Partial<CategoryItem>) => void;
  removeCategory: (id: string) => void;

  images: ImageItem[];
  setImages: (items: ImageItem[]) => void;
  addImage: (item: ImageItem) => void;
  updateImage: (id: string, data: Partial<ImageItem>) => void;
  removeImage: (id: string) => void;

  palette: Palette;
  setPalette: (p: Partial<Palette>) => void;

  // UI state
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;

  // Hydration state
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;

  // Reset
  reset: () => void;
}

const initialState = {
  user: null,
  isAuthLoading: true,
  username: '',
  selectedDomain: 'meta.wikimedia.org',
  rawWikitext: '',
  renderedHtml: '',
  categories: [] as CategoryItem[],
  images: [] as ImageItem[],
  palette: {
    primary: '#0057B7',
    accent: '#e3f2fd',
    background: '#ffffff',
    text: '#202122',
  } as Palette,
  isLoading: false,
  error: null,
  _hasHydrated: false,
};

export const useStore = create<WikiStore>()(
  persist(
    (set) => ({
      ...initialState,

      // Auth actions
      setUser: (user) => set({ user }),
      setAuthLoading: (isAuthLoading) => set({ isAuthLoading }),

      // Wiki actions
      setUsername: (username) => set({ username }),
      setSelectedDomain: (selectedDomain) => set({ selectedDomain }),
      setRawWikitext: (rawWikitext) => set({ rawWikitext }),
      setRenderedHtml: (renderedHtml) => set({ renderedHtml }),

      // Profile creation actions - categories
      setCategories: (items) => set({ categories: items }),
      addCategory: (item) => set((s) => ({ categories: [...s.categories, item] })),
      updateCategory: (id, data) => set((s) => ({ categories: s.categories.map(c => c.id === id ? { ...c, ...data } : c) })),
      removeCategory: (id) => set((s) => ({ categories: s.categories.filter(c => c.id !== id) })),

      // Images
      setImages: (items) => set({ images: items }),
      addImage: (item) => set((s) => ({ images: [...s.images, item] })),
      updateImage: (id, data) => set((s) => ({ images: s.images.map(i => i.id === id ? { ...i, ...data } : i) })),
      removeImage: (id) => set((s) => ({ images: s.images.filter(i => i.id !== id) })),

      // Palette
      setPalette: (p) => set((s) => ({ palette: { ...s.palette, ...p } })),

      // UI actions
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      // Hydration
      setHasHydrated: (_hasHydrated) => set({ _hasHydrated }),

      // Reset
      reset: () => set({ 
        username: '', 
        rawWikitext: '', 
        renderedHtml: '', 
        categories: [],
        images: [],
        palette: initialState.palette,
        error: null 
      }),
    }),
    {
      name: 'wiki-profile-storage',
      partialize: (state) => ({
        username: state.username,
        selectedDomain: state.selectedDomain,
        rawWikitext: state.rawWikitext,
        categories: state.categories,
        images: state.images,
        palette: state.palette,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
