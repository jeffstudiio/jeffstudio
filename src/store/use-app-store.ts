import { create } from 'zustand';

export type View = 'home' | 'services' | 'category' | 'about' | 'contact' | 'admin' | 'admin-categories' | 'admin-projects' | 'admin-project-form' | 'admin-settings' | 'admin-messages' | 'admin-services' | 'admin-about' | 'admin-contact' | 'admin-backup' | 'admin-maintenance';

export interface Category {
  id: string;
  slug: string;
  titleFa: string;
  titleEn: string;
  descriptionFa: string | null;
  descriptionEn: string | null;
  coverImage: string | null;
  videoUrl: string | null;
  order: number;
  subcategories: SubCategory[];
}

export interface SubCategory {
  id: string;
  slug: string;
  titleFa: string;
  titleEn: string;
  order: number;
  categoryId: string;
}

export interface ProjectImage {
  id: string;
  url: string;
  altFa: string | null;
  altEn: string | null;
  isCover: boolean;
  isVideo: boolean;
  order: number;
}

export interface Project {
  id: string;
  slug: string;
  titleFa: string;
  titleEn: string;
  descriptionFa: string | null;
  descriptionEn: string | null;
  clientFa: string | null;
  clientEn: string | null;
  locationFa: string | null;
  locationEn: string | null;
  year: string | null;
  status: string;
  order: number;
  categoryId: string;
  subcategoryId: string | null;
  category: Pick<Category, 'id' | 'slug' | 'titleFa' | 'titleEn'>;
  subcategory: Pick<SubCategory, 'id' | 'slug' | 'titleFa' | 'titleEn'> | null;
  images: ProjectImage[];
}

interface AppState {
  view: View;
  lang: 'fa' | 'en';
  selectedCategoryId: string | null;
  selectedSubcategoryId: string | null;
  selectedProject: Project | null;
  showProjectModal: boolean;
  showSearch: boolean;
  categories: Category[];
  projects: Project[];
  loading: boolean;
  sidebarOpen: boolean;
  editingProject: Project | null;
  selectedServiceIndex: number | null;

  setView: (view: View) => void;
  setLang: (lang: 'fa' | 'en') => void;
  selectCategory: (id: string) => void;
  selectSubcategory: (id: string | null) => void;
  openProject: (project: Project) => void;
  closeProject: () => void;
  toggleSearch: () => void;
  setCategories: (categories: Category[]) => void;
  setProjects: (projects: Project[]) => void;
  setLoading: (loading: boolean) => void;
  setSidebarOpen: (open: boolean) => void;
  setEditingProject: (project: Project | null) => void;
  setSelectedServiceIndex: (index: number | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  view: 'home',
  lang: 'en',
  selectedCategoryId: null,
  selectedSubcategoryId: null,
  selectedProject: null,
  showProjectModal: false,
  showSearch: false,
  categories: [],
  projects: [],
  loading: false,
  sidebarOpen: false,
  editingProject: null,
  selectedServiceIndex: null,

  setView: (view) => set({ view }),
  setLang: (lang) => set({ lang }),
  selectCategory: (id) => set({ selectedCategoryId: id, selectedSubcategoryId: null, view: 'category' }),
  selectSubcategory: (id) => set({ selectedSubcategoryId: id }),
  openProject: (project) => set({ selectedProject: project, showProjectModal: true }),
  closeProject: () => set({ selectedProject: null, showProjectModal: false }),
  toggleSearch: () => set((s) => ({ showSearch: !s.showSearch })),
  setCategories: (categories) => set({ categories }),
  setProjects: (projects) => set({ projects }),
  setLoading: (loading) => set({ loading }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setEditingProject: (project) => set({ editingProject: project }),
  setSelectedServiceIndex: (index) => set({ selectedServiceIndex: index }),
}));
