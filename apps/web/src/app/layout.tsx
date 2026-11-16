import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Menubar } from 'primereact/menubar';
import { Avatar } from 'primereact/avatar';
import { Tooltip } from 'primereact/tooltip';
import { Sidebar } from 'primereact/sidebar';
import { Button } from 'primereact/button';
import { TieredMenu } from 'primereact/tieredmenu';
import { useThemeContext } from './providers';
import { useAppNavigate } from './router';
import { cn } from '@/lib/utils';
import { MenuItem } from 'primereact/menuitem';

/* ==========================================================================
   Navigation Data
   ========================================================================== */

interface NavItem {
  label: string;
  icon: string;
  path: string;
  children?: NavItem[];
  badge?: string | number;
}

const mainNavigation: NavItem[] = [
  { label: 'Dashboard', icon: '📊', path: '/' },
  { label: 'Outlines', icon: '📝', path: '/outlines' },
  { label: 'Bible', icon: '📖', path: '/bible' },
  { label: 'Agenda', icon: '📅', path: '/agenda' },
  { label: 'Library', icon: '📚', path: '/library' },
  { label: 'Notes', icon: '📓', path: '/notes' },
];

const settingsNavigation: NavItem[] = [
  { label: 'Profile', icon: '👤', path: '/settings/profile' },
  { label: 'Appearance', icon: '🎨', path: '/settings/appearance' },
  { label: 'Bible', icon: '📖', path: '/settings/bible' },
  { label: 'Data & Sync', icon: '☁️', path: '/settings/data' },
  { label: 'Account', icon: '🔐', path: '/settings/account' },
];

/* ==========================================================================
   Sidebar Context (for mobile drawer state)
   ========================================================================== */

interface SidebarContextValue {
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
  open: () => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}

function SidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => setIsOpen((prev) => !prev);
  const close = () => setIsOpen(false);
  const open = () => setIsOpen(true);

  return (
    <SidebarContext.Provider value={{ isOpen, toggle, close, open }}>
      {children}
    </SidebarContext.Provider>
  );
}

/* ==========================================================================
   Mobile Header (Topbar on mobile)
   ========================================================================== */

function MobileHeader() {
  const { isOpen, toggle } = useSidebar();
  const { theme, setTheme } = useThemeContext();
  const navigate = useAppNavigate();
  const location = useLocation();
  const [appendTo, setAppendTo] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setAppendTo(document.body);
  }, []);

  const userMenuItems: MenuItem[] = [
    { label: 'Profile', icon: 'pi pi-user', command: () => navigate.goToSettings('settingsProfile') },
    { label: 'Settings', icon: 'pi pi-cog', command: () => navigate.goToSettings() },
    { separator: true },
    { label: 'Sign Out', icon: 'pi pi-sign-out', command: () => navigate.goTo('/login') },
  ];

  const themeIcons = {
    light: 'pi pi-sun',
    dark: 'pi pi-moon',
    system: 'pi pi-desktop',
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-14 bg-surface-elevated/95 backdrop-blur-sm border-b border-border lg:hidden flex items-center gap-3 px-3">
      <Button
        icon="pi pi-bars"
        onClick={toggle}
        className="p-2 text-secondary hover:text-primary"
        severity="secondary"
        aria-label="Open menu"
        aria-expanded={isOpen}
        aria-controls="mobile-sidebar"
      />
      <h1 className="flex-1 text-lg font-semibold text-primary truncate ml-2">SpeakerDraft</h1>

      <div className="flex items-center gap-2">
        <Tooltip content="Theme">
          <Button
            icon={themeIcons[theme]}
            onClick={() => {
              const themes: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system'];
              const currentIndex = themes.indexOf(theme);
              setTheme(themes[(currentIndex + 1) % themes.length]);
            }}
            className="p-2 text-secondary hover:text-primary"
            severity="secondary"
          />
        </Tooltip>

        <Tooltip content="Search (Cmd+K)">
          <Button
            icon="pi pi-search"
            onClick={() => navigate.goToSearch()}
            className="p-2 text-secondary hover:text-primary"
            severity="secondary"
          />
        </Tooltip>

        <TieredMenu
          model={userMenuItems}
          popup
          appendTo={appendTo}
        >
          <Avatar
            label="User"
            size="normal"
            shape="circle"
            className="cursor-pointer bg-primary-soft text-primary"
          />
        </TieredMenu>
      </div>
    </header>
  );
}

/* ==========================================================================
   Desktop Sidebar
   ========================================================================== */

function DesktopSidebar() {
  const location = useLocation();
  const navigate = useAppNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleNavClick = (path: string) => {
    navigate.goTo(path);
  };

  return (
    <aside
      className={cn(
        'fixed top-0 left-0 z-30 h-full transition-all duration-300 bg-sidebar border-r border-border flex flex-col',
        collapsed ? 'w-16' : 'w-64'
      )}
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div className={cn('flex items-center gap-3 h-14 px-4 border-b border-border transition-all duration-300', collapsed && 'justify-center px-0')}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <span className="text-primary-foreground text-lg" aria-hidden="true">📖</span>
          </div>
          {!collapsed && (
            <span className="font-semibold text-lg text-primary truncate">SpeakerDraft</span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2" role="navigation" aria-label="Main">
        <ul className="space-y-1" role="list">
          {mainNavigation.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                onClick={() => handleNavClick(item.path)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    'group relative overflow-hidden',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-secondary hover:text-primary hover:bg-surface-hover'
                  )
                }
                aria-current={location.pathname === item.path || location.pathname.startsWith(item.path + '/') ? 'page' : undefined}
              >
                <span className="text-lg flex-shrink-0" aria-hidden="true">{item.icon}</span>
                {!collapsed && <span className="truncate">{item.label}</span>}
                {item.badge && !collapsed && (
                  <span className="ml-auto px-2 py-0.5 text-xs font-medium bg-primary-soft text-primary rounded-full">
                    {item.badge}
                  </span>
                )}
                {collapsed && (
                  <Tooltip content={item.label}>
                    <span className="sr-only">{item.label}</span>
                  </Tooltip>
                )}
              </NavLink>
            </li>
          ))}

          {/* Divider */}
          <li className="pt-4 mt-2 border-t border-border">
            {!collapsed && <span className="px-3 text-xs font-semibold text-muted uppercase tracking-wider">Settings</span>}
          </li>

          {settingsNavigation.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                onClick={() => handleNavClick(item.path)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    'group relative overflow-hidden',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-secondary hover:text-primary hover:bg-surface-hover'
                  )
                }
                aria-current={location.pathname === item.path ? 'page' : undefined}
              >
                <span className="text-lg flex-shrink-0" aria-hidden="true">{item.icon}</span>
                {!collapsed && <span className="truncate">{item.label}</span>}
                {collapsed && (
                  <Tooltip content={item.label}>
                    <span className="sr-only">{item.label}</span>
                  </Tooltip>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Collapse Toggle */}
      <div className="p-3 border-t border-border">
        <Button
          onClick={() => setCollapsed(!collapsed)}
          icon={collapsed ? 'pi pi-chevron-right' : 'pi pi-chevron-left'}
          className="w-full justify-center"
          severity="secondary"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!collapsed}
        >
          {!collapsed && <span className="ml-2">Collapse</span>}
        </Button>
      </div>
    </aside>
  );
}

/* ==========================================================================
   Mobile Sidebar (Drawer)
   ========================================================================== */

function MobileSidebar() {
  const { isOpen, close } = useSidebar();
  const location = useLocation();
  const navigate = useAppNavigate();

  const handleNavClick = (path: string) => {
    navigate.goTo(path);
    close();
  };

  return (
    <Sidebar
      position="left"
      visible={isOpen}
      onHide={close}
      baseZIndex={50}
      className={cn('w-72', isOpen && 'animate-slide-in-left')}
      modal
      dismissable
      aria-label="Mobile navigation"
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between h-14 px-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground text-lg" aria-hidden="true">📖</span>
            </div>
            <span className="font-semibold text-lg text-primary">SpeakerDraft</span>
          </div>
          <Button
            icon="pi pi-times"
            onClick={close}
            className="p-2 text-secondary hover:text-primary"
            severity="secondary"
            aria-label="Close menu"
          />
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2" role="navigation" aria-label="Mobile navigation">
          <ul className="space-y-1" role="list">
            {mainNavigation.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={() => handleNavClick(item.path)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-secondary hover:text-primary hover:bg-surface-hover'
                    )
                  }
                  aria-current={location.pathname === item.path || location.pathname.startsWith(item.path + '/') ? 'page' : undefined}
                >
                  <span className="text-xl" aria-hidden="true">{item.icon}</span>
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto px-2 py-0.5 text-xs font-medium bg-primary-soft text-primary rounded-full">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              </li>
            ))}

            <li className="pt-4 mt-4 border-t border-border">
              <span className="px-3 text-xs font-semibold text-muted uppercase tracking-wider block mb-2">Settings</span>
              {settingsNavigation.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => handleNavClick(item.path)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium transition-colors block',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-secondary hover:text-primary hover:bg-surface-hover'
                    )
                  }
                  aria-current={location.pathname === item.path ? 'page' : undefined}
                >
                  <span className="text-xl" aria-hidden="true">{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </li>
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 px-3">
            <Avatar label="User" size="normal" shape="circle" className="bg-primary-soft text-primary" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-primary truncate">John Doe</p>
              <p className="text-xs text-muted truncate">john@example.com</p>
            </div>
          </div>
        </div>
      </div>
    </Sidebar>
  );
}

/* ==========================================================================
   Desktop Topbar
   ========================================================================== */

function DesktopTopbar() {
  const { theme, setTheme } = useThemeContext();
  const navigate = useAppNavigate();
  const [appendTo, setAppendTo] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setAppendTo(document.body);
  }, []);

  const userMenuItems: MenuItem[] = [
    { label: 'Profile', icon: 'pi pi-user', command: () => navigate.goToSettings('settingsProfile') },
    { label: 'Settings', icon: 'pi pi-cog', command: () => navigate.goToSettings() },
    { separator: true },
    { label: 'Keyboard Shortcuts', icon: 'pi pi-keyboard', command: () => navigate.goTo('/shortcuts') },
    { separator: true },
    { label: 'Sign Out', icon: 'pi pi-sign-out', command: () => navigate.goTo('/login') },
  ];

  const themeIcons = {
    light: 'pi pi-sun',
    dark: 'pi pi-moon',
    system: 'pi pi-desktop',
  };

  return (
    <header className="fixed top-0 left-64 right-0 z-30 h-14 bg-surface-elevated/95 backdrop-blur-sm border-b border-border lg:block hidden flex items-center justify-between px-4 gap-4 transition-all duration-300"
      style={{ left: 'var(--sd-sidebar-width, 16rem)' }}
    >
      {/* Left: Search + Quick Actions */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <div className="relative flex-1 hidden sm:block">
          <Button
            icon="pi pi-search"
            onClick={() => navigate.goToSearch()}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary p-1"
            severity="secondary"
            aria-label="Search (Cmd+K)"
          />
          <input
            type="search"
            placeholder="Search outlines, Bible, notes... (Cmd+K)"
            className="w-full pl-10 pr-4 py-2 bg-surface-subtle border border-border rounded-lg text-sm placeholder:text-muted focus:border-focus focus:outline-none focus:ring-2 focus:ring-primary/20"
            aria-label="Global search"
          />
        </div>
      </div>

      {/* Right: Theme, Notifications, User */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <Tooltip content="Toggle theme">
          <Button
            icon={themeIcons[theme]}
            onClick={() => {
              const themes: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system'];
              const currentIndex = themes.indexOf(theme);
              setTheme(themes[(currentIndex + 1) % themes.length]);
            }}
            className="p-2 text-secondary hover:text-primary"
            severity="secondary"
            aria-label={`Current theme: ${theme}. Click to cycle.`}
          />
        </Tooltip>

        {/* Notifications */}
        <Tooltip content="Notifications">
          <Button
            icon="pi pi-bell"
            className="p-2 text-secondary hover:text-primary relative"
            severity="secondary"
            aria-label="Notifications"
          >
            <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full" aria-hidden="true" />
          </Button>
        </Tooltip>

        {/* User Menu */}
        <TieredMenu
          model={userMenuItems}
          popup
          appendTo={appendTo}
        >
          <div className="flex items-center gap-2 pr-2">
            <Avatar label="JD" size="normal" shape="circle" className="bg-primary-soft text-primary" />
            <span className="hidden md:block text-sm font-medium text-primary">John Doe</span>
            <span className="pi pi-chevron-down text-muted text-xs" aria-hidden="true" />
          </div>
        </TieredMenu>
      </div>
    </header>
  );
}

/* ==========================================================================
   Main Layout
   ========================================================================== */

export function Layout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background">
        {/* Mobile Header */}
        <MobileHeader />

        {/* Mobile Sidebar */}
        <MobileSidebar />

        {/* Desktop Sidebar */}
        <DesktopSidebar />

        {/* Desktop Topbar */}
        <DesktopTopbar />

        {/* Main Content */}
        <main
          id="main-content"
          className="pt-14 lg:pt-0 lg:pl-64 min-h-screen transition-all duration-300"
          style={{ paddingLeft: 'var(--sd-sidebar-width, 16rem)' }}
          role="main"
        >
          <div className="p-4 lg:p-6">
            <Outlet />
          </div>
        </main>

        {/* Skip Link for Accessibility */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
      </div>
    </SidebarProvider>
  );
}

/* ==========================================================================
   Page Layout Helpers
   ========================================================================== */

export function PageLayout({
  title,
  description,
  children,
  actions,
  breadcrumbs,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
  breadcrumbs?: Array<{ label: string; path?: string }>;
}) {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="mb-4 flex items-center gap-2 text-sm" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2">
            {breadcrumbs.map((crumb, index) => (
              <li key={index} className="flex items-center gap-2">
                {index > 0 && <span className="text-muted" aria-hidden="true">/</span>}
                {crumb.path ? (
                  <NavLink
                    to={crumb.path}
                    className="text-secondary hover:text-primary transition-colors"
                  >
                    {crumb.label}
                  </NavLink>
                ) : (
                  <span className="text-primary font-medium" aria-current="page">
                    {crumb.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}

      {/* Page Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-primary">{title}</h1>
          {description && <p className="text-secondary mt-1">{description}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      {/* Content */}
      <div>{children}</div>
    </div>
  );
}

export function Card({ title, children, footer, className, ...props }: {
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  [key: string]: unknown;
}) {
  return (
    <div className={cn('card', className)} {...props}>
      {title && (
        <div className="card-header">
          <h3 className="font-semibold text-primary">{title}</h3>
        </div>
      )}
      <div className="card-body">{children}</div>
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
}

export function Section({ title, children, className, ...props }: {
  title?: string;
  children: ReactNode;
  className?: string;
  [key: string]: unknown;
}) {
  return (
    <section className={cn('space-y-4', className)} {...props}>
      {title && <h2 className="text-lg font-semibold text-primary">{title}</h2>}
      {children}
    </section>
  );
}