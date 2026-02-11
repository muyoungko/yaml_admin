export { default as YMLAdmin } from './YMLAdmin.jsx';
export { EntityTreeView } from './component/EntityTreeView.jsx';
export { useAdminContext, AdminContext, AdminProvider } from './AdminContext.jsx';

// Re-export react-admin components to ensure same instance
export {
  AppBar,
  Logout,
  UserMenu,
  Menu,
  Layout,
  defaultTheme,
  useSidebarState,
  useTranslate,
  useRedirect
} from 'react-admin';