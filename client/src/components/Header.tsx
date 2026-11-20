import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { PRODUCT_CATEGORIES } from '../utils/constants';
import BrandLogo from './BrandLogo';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { pathname, search } = useLocation();
  const { isAuthenticated } = useAuth();

  useEffect(() => { setMobileMenuOpen(false); setDropdownOpen(false); }, [pathname, search]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setMobileMenuOpen(false); setDropdownOpen(false); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
      <div className="border-b border-gray-200 bg-gray-100 text-gray-600">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-4 px-4 py-2 text-sm sm:justify-between sm:px-6 lg:px-8">
          <span className="hidden sm:block">Lunes – Viernes 8:00am – 5:00pm <span className="mx-2 text-gray-300">|</span> Sábado 8:00am – 12:00pm</span>
          <a href="mailto:ventas@pbex.com.pe" className="shrink-0 hover:underline">ventas@pbex.com.pe</a>
        </div>
      </div>
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-5 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="shrink-0 py-4"><BrandLogo /></Link>
        <nav id="main-navigation" aria-label="Navegación principal" className={`${mobileMenuOpen ? 'flex' : 'hidden'} order-last max-h-[calc(100dvh-9rem)] w-full flex-col gap-2 overflow-y-auto border-t border-gray-200 pb-4 lg:order-none lg:flex lg:max-h-none lg:w-auto lg:flex-row lg:items-center lg:gap-5 lg:overflow-visible lg:border-0 lg:pb-0`}>
          <Link to="/" className="public-nav-link" aria-current={pathname === '/' ? 'page' : undefined}>Inicio</Link>
          <Link to="/nosotros" className="public-nav-link" aria-current={pathname === '/nosotros' ? 'page' : undefined}>Nosotros</Link>
          <div className="relative">
            <div className="flex items-center gap-1">
              <Link to="/public-products" className="public-nav-link" aria-current={pathname === '/public-products' ? 'page' : undefined}>Productos</Link>
              <button type="button" onClick={() => setDropdownOpen(!dropdownOpen)} aria-expanded={dropdownOpen} aria-controls="category-navigation" aria-label="Mostrar categorías de productos" className="flex h-11 w-9 items-center justify-center rounded text-primary-700 hover:bg-primary-50">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d={dropdownOpen ? 'm4 10 4-4 4 4' : 'm4 6 4 4 4-4'} /></svg>
              </button>
            </div>
            {dropdownOpen && <ul id="category-navigation" className="rounded-md border border-gray-200 bg-white p-2 lg:absolute lg:left-0 lg:top-full lg:w-56 lg:shadow-lg">
              {PRODUCT_CATEGORIES.map(category => <li key={category.slug}><Link to={`/public-products?category=${category.slug}`} className="block rounded px-3 py-2.5 text-sm capitalize text-primary-700 hover:bg-primary-50">{category.value.toLowerCase()}</Link></li>)}
            </ul>}
          </div>
          <a href="#contacto" onClick={() => { setMobileMenuOpen(false); setDropdownOpen(false); }} className="public-nav-link">Contacto</a>
        </nav>
        <div className="flex items-center gap-2 sm:gap-5">
          <div className="hidden border-l border-gray-200 pl-5 text-primary-700 xl:block"><span className="block text-xs font-semibold">CONTÁCTANOS</span><a href="tel:013576464" className="text-sm font-bold hover:underline">(01) 357-6464</a></div>
          <Link to={isAuthenticated ? '/dashboard' : '/login'} className="btn btn-primary !px-3 sm:!px-5">{isAuthenticated ? 'Mi panel' : 'Iniciar sesión'}</Link>
          <button type="button" className="flex h-11 w-11 items-center justify-center rounded-md border border-gray-200 text-primary-700 lg:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-expanded={mobileMenuOpen} aria-controls="main-navigation" aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d={mobileMenuOpen ? 'm6 6 12 12M6 18 18 6' : 'M4 6h16M4 12h16M4 18h16'} /></svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
