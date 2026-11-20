import { Outlet, Link, useLocation } from "react-router-dom";
import BrandLogo from './BrandLogo';
import { useAuth } from "../contexts/AuthContext";
import { USER_ROLES } from "../utils/constants";

const ROLE_LABELS: Record<string, string> = {
  [USER_ROLES.ASSISTANT]: "Asistente de Calidad",
  [USER_ROLES.SUPERVISOR]: "Supervisor",
  [USER_ROLES.ADMIN]: "Administrador",
  [USER_ROLES.MANAGEMENT]: "Gerencia",
  [USER_ROLES.VISITOR]: "Visitante",
};

const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string): boolean => location.pathname === path;

  const canAccess = (roles: string[]): boolean => {
    return user?.role ? roles.includes(user.role) : false;
  };

  const menuItems = [
    {
      path: "/dashboard",
      label: "Dashboard",
      icon: "fa-chart-column",
      roles: [USER_ROLES.SUPERVISOR, USER_ROLES.ADMIN, USER_ROLES.MANAGEMENT],
    },
    {
      path: "/dashboard/quality/register",
      label: "Registro de Calidad",
      icon: "fa-clipboard-check",
      roles: [USER_ROLES.ASSISTANT, USER_ROLES.SUPERVISOR, USER_ROLES.ADMIN],
    },
    {
      path: "/dashboard/certificates",
      label: "Certificados",
      icon: "fa-file-lines",
      roles: [
        USER_ROLES.ASSISTANT,
        USER_ROLES.SUPERVISOR,
        USER_ROLES.ADMIN,
        USER_ROLES.MANAGEMENT,
      ],
    },
    {
      path: "/dashboard/alerts",
      label: "Alertas",
      icon: "fa-bell",
      roles: [USER_ROLES.SUPERVISOR, USER_ROLES.ADMIN, USER_ROLES.MANAGEMENT],
    },
    {
      path: "/dashboard/non-conformities",
      label: "No Conformidades",
      icon: "fa-triangle-exclamation",
      roles: [USER_ROLES.ASSISTANT, USER_ROLES.SUPERVISOR, USER_ROLES.ADMIN],
    },
    {
      path: "/dashboard/products",
      label: "Productos",
      icon: "fa-box",
      roles: [
        USER_ROLES.ASSISTANT,
        USER_ROLES.SUPERVISOR,
        USER_ROLES.ADMIN,
        USER_ROLES.MANAGEMENT,
      ],
    },
    {
      path: "/dashboard/users",
      label: "Usuarios",
      icon: "fa-users",
      roles: [USER_ROLES.ADMIN, USER_ROLES.SUPERVISOR],
    },
  ];

  const visibleMenuItems = menuItems.filter((item) => canAccess(item.roles));

  const getRoleLabel = (role: string | undefined): string => {
    if (!role) return '';
    return ROLE_LABELS[role] || role;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-t-4 border-primary-700 border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 py-4">
            <div className="flex min-w-0 items-center gap-5">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/" aria-label="PBEX · Volver al inicio"><BrandLogo className="!w-28 sm:!w-36" /></Link>
              </div>
              <p className="hidden border-l border-gray-200 pl-5 text-sm font-semibold text-primary-700 md:block">Sistema de gestión de calidad</p>
            </div>
            <div className="flex shrink-0 items-center gap-4">
              <div className="hidden sm:flex flex-col text-right leading-tight">
                <span className="text-sm font-semibold text-gray-900 truncate max-w-[180px]">
                  {user?.fullName}
                </span>
                <span className="text-xs text-gray-500">
                  {getRoleLabel(user?.role)}
                </span>
              </div>
              <button onClick={logout} className="btn btn-secondary text-sm">
                Cerrar sesión
              </button>
            </div>
          </div>
          <nav aria-label="Navegación del sistema" className="-mb-px flex gap-5 overflow-x-auto">
            {visibleMenuItems.map(item => (
              <Link key={item.path} to={item.path} aria-current={isActive(item.path) ? 'page' : undefined}
                className={`inline-flex min-h-12 shrink-0 items-center gap-2 border-b-2 px-1 text-sm font-semibold ${isActive(item.path) ? 'border-accent-500 text-primary-700' : 'border-transparent text-gray-600 hover:border-gray-300 hover:text-primary-700'}`}>
                <i className={`fas ${item.icon} text-sm`} aria-hidden="true" />{item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="admin-content max-w-7xl mx-auto px-4 py-7 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;

