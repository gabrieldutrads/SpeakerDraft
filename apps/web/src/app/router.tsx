import { Suspense, lazy, createElement, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Layout } from './layout';
import { LoadingPage } from '@/components/feedback/LoadingPage';

/* ==========================================================================
   Lazy-loaded Route Components
   ========================================================================== */

// Auth
const Login = lazy(() => import('@/features/auth/LoginPage').then((m) => ({ default: m.LoginPage })));
const Register = lazy(() => import('@/features/auth/RegisterPage').then((m) => ({ default: m.RegisterPage })));
const ForgotPassword = lazy(() =>
  import('@/features/auth/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage }))
);
const ResetPassword = lazy(() =>
  import('@/features/auth/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage }))
);

// Dashboard
const Dashboard = lazy(() => import('@/features/dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage })));

// Outlines
const OutlinesList = lazy(() =>
  import('@/features/outlines/OutlinesListPage').then((m) => ({ default: m.OutlinesListPage }))
);
const OutlineEditor = lazy(() =>
  import('@/features/outlines/OutlineEditorPage').then((m) => ({ default: m.OutlineEditorPage }))
);
const OutlinePreaching = lazy(() =>
  import('@/features/outlines/OutlinePreachingPage').then((m) => ({ default: m.OutlinePreachingPage }))
);
const OutlinePreview = lazy(() =>
  import('@/features/outlines/OutlinePreviewPage').then((m) => ({ default: m.OutlinePreviewPage }))
);

// Bible
const BibleReader = lazy(() =>
  import('@/features/bible/BibleReaderPage').then((m) => ({ default: m.BibleReaderPage }))
);
const BibleSearch = lazy(() =>
  import('@/features/bible/BibleSearchPage').then((m) => ({ default: m.BibleSearchPage }))
);

// Agenda
const AgendaCalendar = lazy(() =>
  import('@/features/agenda/AgendaCalendarPage').then((m) => ({ default: m.AgendaCalendarPage }))
);
const AgendaList = lazy(() =>
  import('@/features/agenda/AgendaListPage').then((m) => ({ default: m.AgendaListPage }))
);
const EventEditor = lazy(() =>
  import('@/features/agenda/EventEditorPage').then((m) => ({ default: m.EventEditorPage }))
);

// Library
const LibraryList = lazy(() =>
  import('@/features/library/LibraryListPage').then((m) => ({ default: m.LibraryListPage }))
);
const LibraryUpload = lazy(() =>
  import('@/features/library/LibraryUploadPage').then((m) => ({ default: m.LibraryUploadPage }))
);
const LibraryViewer = lazy(() =>
  import('@/features/library/LibraryViewerPage').then((m) => ({ default: m.LibraryViewerPage }))
);

// Notes
const NotesList = lazy(() =>
  import('@/features/notes/NotesListPage').then((m) => ({ default: m.NotesListPage }))
);
const NoteEditor = lazy(() =>
  import('@/features/notes/NoteEditorPage').then((m) => ({ default: m.NoteEditorPage }))
);

// Search
const GlobalSearch = lazy(() =>
  import('@/features/search/GlobalSearchPage').then((m) => ({ default: m.GlobalSearchPage }))
);

// Settings
const SettingsProfile = lazy(() =>
  import('@/features/settings/SettingsProfilePage').then((m) => ({ default: m.SettingsProfilePage }))
);
const SettingsAppearance = lazy(() =>
  import('@/features/settings/SettingsAppearancePage').then((m) => ({ default: m.SettingsAppearancePage }))
);
const SettingsBible = lazy(() =>
  import('@/features/settings/SettingsBiblePage').then((m) => ({ default: m.SettingsBiblePage }))
);
const SettingsData = lazy(() =>
  import('@/features/settings/SettingsDataPage').then((m) => ({ default: m.SettingsDataPage }))
);
const SettingsAccount = lazy(() =>
  import('@/features/settings/SettingsAccountPage').then((m) => ({ default: m.SettingsAccountPage }))
);

/* ==========================================================================
   Route Constants
   ========================================================================== */

export const routes = {
  // Public routes
  login: '/login',
  register: '/register',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',

  // Protected routes (require auth)
  dashboard: '/',

  outlines: '/outlines',
  outlineNew: '/outlines/new',
  outlineEdit: '/outlines/:id/edit',
  outlinePreach: '/outlines/:id/preach',
  outlinePreview: '/outlines/:id/preview',

  bible: '/bible',
  bibleSearch: '/bible/search',
  biblePassage: '/bible/:book/:chapter/:verse?',

  agenda: '/agenda',
  agendaCalendar: '/agenda/calendar',
  agendaList: '/agenda/list',
  eventNew: '/agenda/events/new',
  eventEdit: '/agenda/events/:id/edit',

  library: '/library',
  libraryUpload: '/library/upload',
  libraryViewer: '/library/:id',

  notes: '/notes',
  noteNew: '/notes/new',
  noteEdit: '/notes/:id/edit',

  search: '/search',

  settings: '/settings',
  settingsProfile: '/settings/profile',
  settingsAppearance: '/settings/appearance',
  settingsBible: '/settings/bible',
  settingsData: '/settings/data',
  settingsAccount: '/settings/account',
} as const;

/* ==========================================================================
   Layout Routes (require authentication)
   ========================================================================== */

function ProtectedRoutes() {
  // TODO: Add auth check here when Supabase Auth is integrated
  // For now, all routes are accessible
  return (
    <Routes>
      {/* Dashboard */}
      <Route path={routes.dashboard} element={<Dashboard />} />

      {/* Outlines */}
      <Route path={routes.outlines} element={<OutlinesList />} />
      <Route path={routes.outlineNew} element={<OutlineEditor />} />
      <Route path={routes.outlineEdit} element={<OutlineEditor />} />
      <Route path={routes.outlinePreach} element={<OutlinePreaching />} />
      <Route path={routes.outlinePreview} element={<OutlinePreview />} />

      {/* Bible */}
      <Route path={routes.bible} element={<BibleReader />} />
      <Route path={routes.bibleSearch} element={<BibleSearch />} />
      <Route path={routes.biblePassage} element={<BibleReader />} />

      {/* Agenda */}
      <Route path={routes.agenda} element={<AgendaCalendar />} />
      <Route path={routes.agendaCalendar} element={<AgendaCalendar />} />
      <Route path={routes.agendaList} element={<AgendaList />} />
      <Route path={routes.eventNew} element={<EventEditor />} />
      <Route path={routes.eventEdit} element={<EventEditor />} />

      {/* Library */}
      <Route path={routes.library} element={<LibraryList />} />
      <Route path={routes.libraryUpload} element={<LibraryUpload />} />
      <Route path={routes.libraryViewer} element={<LibraryViewer />} />

      {/* Notes */}
      <Route path={routes.notes} element={<NotesList />} />
      <Route path={routes.noteNew} element={<NoteEditor />} />
      <Route path={routes.noteEdit} element={<NoteEditor />} />

      {/* Search */}
      <Route path={routes.search} element={<GlobalSearch />} />

      {/* Settings */}
      <Route path={routes.settings} element={<SettingsProfile />} />
      <Route path={routes.settingsProfile} element={<SettingsProfile />} />
      <Route path={routes.settingsAppearance} element={<SettingsAppearance />} />
      <Route path={routes.settingsBible} element={<SettingsBible />} />
      <Route path={routes.settingsData} element={<SettingsData />} />
      <Route path={routes.settingsAccount} element={<SettingsAccount />} />
    </Routes>
  );
}

/* ==========================================================================
   Public Routes (no auth required)
   ========================================================================== */

function PublicRoutes() {
  return (
    <Routes>
      <Route path={routes.login} element={<Login />} />
      <Route path={routes.register} element={<Register />} />
      <Route path={routes.forgotPassword} element={<ForgotPassword />} />
      <Route path={routes.resetPassword} element={<ResetPassword />} />
    </Routes>
  );
}

/* ==========================================================================
   App Router
   ========================================================================== */

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes - no layout */}
      <Route path={routes.login} element={<Login />} />
      <Route path={routes.register} element={<Register />} />
      <Route path={routes.forgotPassword} element={<ForgotPassword />} />
      <Route path={routes.resetPassword} element={<ResetPassword />} />

      {/* Protected routes - with layout */}
      <Route element={<Layout />}>
        <Route path={routes.dashboard} element={<Dashboard />} />

        {/* Outlines */}
        <Route path={routes.outlines} element={<OutlinesList />} />
        <Route path={routes.outlineNew} element={<OutlineEditor />} />
        <Route path={routes.outlineEdit} element={<OutlineEditor />} />
        <Route path={routes.outlinePreach} element={<OutlinePreaching />} />
        <Route path={routes.outlinePreview} element={<OutlinePreview />} />

        {/* Bible */}
        <Route path={routes.bible} element={<BibleReader />} />
        <Route path={routes.bibleSearch} element={<BibleSearch />} />
        <Route path={routes.biblePassage} element={<BibleReader />} />

        {/* Agenda */}
        <Route path={routes.agenda} element={<AgendaCalendar />} />
        <Route path={routes.agendaCalendar} element={<AgendaCalendar />} />
        <Route path={routes.agendaList} element={<AgendaList />} />
        <Route path={routes.eventNew} element={<EventEditor />} />
        <Route path={routes.eventEdit} element={<EventEditor />} />

        {/* Library */}
        <Route path={routes.library} element={<LibraryList />} />
        <Route path={routes.libraryUpload} element={<LibraryUpload />} />
        <Route path={routes.libraryViewer} element={<LibraryViewer />} />

        {/* Notes */}
        <Route path={routes.notes} element={<NotesList />} />
        <Route path={routes.noteNew} element={<NoteEditor />} />
        <Route path={routes.noteEdit} element={<NoteEditor />} />

        {/* Search */}
        <Route path={routes.search} element={<GlobalSearch />} />

        {/* Settings */}
        <Route path={routes.settings} element={<SettingsProfile />} />
        <Route path={routes.settingsProfile} element={<SettingsProfile />} />
        <Route path={routes.settingsAppearance} element={<SettingsAppearance />} />
        <Route path={routes.settingsBible} element={<SettingsBible />} />
        <Route path={routes.settingsData} element={<SettingsData />} />
        <Route path={routes.settingsAccount} element={<SettingsAccount />} />
      </Route>

      {/* Catch-all redirect to dashboard */}
      <Route path="*" element={<Navigate to={routes.dashboard} replace />} />
    </Routes>
  );
}

/* ==========================================================================
   Router Provider
   ========================================================================== */

export function Router() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingPage />}>
        <AppRoutes />
      </Suspense>
    </BrowserRouter>
  );
}

/* ==========================================================================
   Navigation Helpers
   ========================================================================== */

import { useNavigate, useLocation } from 'react-router-dom';

export function useAppNavigate() {
  const navigate = useNavigate();
  const location = useLocation();

  const goTo = useCallback(
    (path: string, options?: { replace?: boolean; state?: unknown }) => {
      navigate(path, options);
    },
    [navigate]
  );

  const goBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const goToDashboard = useCallback(() => {
    navigate(routes.dashboard);
  }, [navigate]);

  const goToOutlines = useCallback(() => {
    navigate(routes.outlines);
  }, [navigate]);

  const goToOutlineEdit = useCallback(
    (id: string) => {
      navigate(routes.outlineEdit.replace(':id', id));
    },
    [navigate]
  );

  const goToOutlinePreach = useCallback(
    (id: string) => {
      navigate(routes.outlinePreach.replace(':id', id));
    },
    [navigate]
  );

  const goToOutlinePreview = useCallback(
    (id: string) => {
      navigate(routes.outlinePreview.replace(':id', id));
    },
    [navigate]
  );

  const goToBible = useCallback(() => {
    navigate(routes.bible);
  }, [navigate]);

  const goToBiblePassage = useCallback(
    (book: string, chapter: number, verse?: number) => {
      let path = `/bible/${book}/${chapter}`;
      if (verse) path += `/${verse}`;
      navigate(path);
    },
    [navigate]
  );

  const goToAgenda = useCallback(() => {
    navigate(routes.agenda);
  }, [navigate]);

  const goToLibrary = useCallback(() => {
    navigate(routes.library);
  }, [navigate]);

  const goToNotes = useCallback(() => {
    navigate(routes.notes);
  }, [navigate]);

  const goToSettings = useCallback(
    (tab: keyof typeof routes = 'settingsProfile') => {
      const route = routes[tab] || routes.settings;
      navigate(route);
    },
    [navigate]
  );

  const goToSearch = useCallback(() => {
    navigate(routes.search);
  }, [navigate]);

  return {
    goTo,
    goBack,
    goToDashboard,
    goToOutlines,
    goToOutlineEdit,
    goToOutlinePreach,
    goToOutlinePreview,
    goToBible,
    goToBiblePassage,
    goToAgenda,
    goToLibrary,
    goToNotes,
    goToSettings,
    goToSearch,
    currentPath: location.pathname,
  };
}

/* ==========================================================================
   Route Guards (for future auth integration)
   ========================================================================== */

export function requireAuth() {
  // TODO: Implement when Supabase Auth is integrated
  // For now, always allow
  return true;
}

export function requireGuest() {
  // TODO: Implement when Supabase Auth is integrated
  // For now, always allow
  return true;
}