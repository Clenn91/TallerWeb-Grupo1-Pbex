import { useState } from 'react';
import { useQuery } from 'react-query';
import { useSearchParams } from 'react-router-dom';
import { productAPI } from '../services/api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import {
  PRODUCT_CATEGORIES,
  PRODUCT_CATEGORY_VALUE_BY_SLUG,
  PRODUCT_MATERIALS,
} from '../utils/constants';
import type { Product } from '../types';

const PublicProducts = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Obtener filtros de la URL
  const linkedCategory = PRODUCT_CATEGORY_VALUE_BY_SLUG[searchParams.get('category') || ''];
  const selectedCategories = searchParams.get('categories')?.split(',').filter(Boolean) || (linkedCategory ? [linkedCategory] : []);
  const selectedMaterials = searchParams.get('materials')?.split(',').filter(Boolean) || [];

  // Función para actualizar filtros en la URL
  const updateFilters = (categories: string[], materials: string[]) => {
    const params = new URLSearchParams();
    if (categories.length > 0) {
      params.set('categories', categories.join(','));
    }
    if (materials.length > 0) {
      params.set('materials', materials.join(','));
    }
    setSearchParams(params);
  };

  // Manejar cambio de checkbox de categoría
  const handleCategoryToggle = (categoryValue: string) => {
    const newCategories = selectedCategories.includes(categoryValue)
      ? selectedCategories.filter((c) => c !== categoryValue)
      : [...selectedCategories, categoryValue];
    updateFilters(newCategories, selectedMaterials);
  };

  // Manejar cambio de checkbox de material
  const handleMaterialToggle = (material: string) => {
    const newMaterials = selectedMaterials.includes(material)
      ? selectedMaterials.filter((m) => m !== material)
      : [...selectedMaterials, material];
    updateFilters(selectedCategories, newMaterials);
  };

  const { data, isLoading, isError, refetch } = useQuery<{ data: Product[] }>(
    ['public-products', selectedCategories.join(','), selectedMaterials.join(',')],
    () => {
      const params: { active: boolean; category?: string[]; material?: string[] } = { active: true };
      if (selectedCategories.length > 0) {
        params.category = selectedCategories;
      }
      if (selectedMaterials.length > 0) {
        params.material = selectedMaterials;
      }
      return productAPI.getAll(params).then((res) => res.data);
    }
  );

  const products = data?.data || [];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full py-10 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <div>
            <p className="section-label">Envases y accesorios PBEX</p>
            <h1 className="text-3xl md:text-4xl font-bold text-primary-700">
              Nuestros productos
            </h1>
            <p className="mt-3 text-gray-600">
              Encuentra el envase que necesitas. Filtra por categoría o material.
            </p>
          </div>

          {/* Layout con sidebar y contenido */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar de filtros */}
            <aside className="w-full lg:w-64 flex-shrink-0">
              {/* Botón para mostrar/ocultar filtros en móvil */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                aria-expanded={showFilters}
                aria-controls="catalog-filters"
                className="lg:hidden w-full btn btn-secondary mb-4 flex items-center justify-between"
              >
                <span>Filtros</span>
                <span>{showFilters ? 'Ocultar' : 'Mostrar'}</span>
              </button>

              {/* Panel de filtros */}
              <div
                id="catalog-filters"
                className={`${
                  showFilters ? 'block' : 'hidden'
                } lg:block filter-panel space-y-6`}
              >
                {/* Filtros de Categorías */}
                <div>
                  <h2 className="filter-title">
                    CATEGORÍAS
                  </h2>
                  <div className="space-y-2">
                    {PRODUCT_CATEGORIES.map((category) => {
                      const isChecked = selectedCategories.includes(category.value);
                      return (
                        <label
                          key={category.value}
                          className="filter-option"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleCategoryToggle(category.value)}
                            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                          />
                          <span className="text-sm capitalize">
                            {category.value.toLowerCase()}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Filtros de Materiales */}
                <div>
                  <h2 className="filter-title">
                    MATERIAL
                  </h2>
                  <div className="space-y-2">
                    {PRODUCT_MATERIALS.map((material) => {
                      const isChecked = selectedMaterials.includes(material);
                      return (
                        <label
                          key={material}
                          className="filter-option"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleMaterialToggle(material)}
                            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                          />
                          <span className="text-sm capitalize">{['PET', 'PVC'].includes(material) ? material : material.toLowerCase()}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
                {(selectedCategories.length > 0 || selectedMaterials.length > 0) && <button type="button" onClick={() => updateFilters([], [])} className="btn btn-secondary w-full">Limpiar filtros</button>}
              </div>
            </aside>

            {/* Contenido principal */}
            <div className="min-w-0 flex-1">
              {isLoading ? <p role="status" className="py-16 text-center text-gray-600">Cargando productos...</p> : isError ? <div role="alert" className="card py-12 text-center"><h2 className="text-xl font-bold">No pudimos cargar el catálogo</h2><p className="mt-2 mb-6 text-gray-600">Intenta de nuevo en unos momentos.</p><button type="button" onClick={() => refetch()} className="btn btn-primary">Reintentar</button></div> : <>
              <p className="mb-5 text-sm text-gray-500">{products.length} {products.length === 1 ? 'producto disponible' : 'productos disponibles'}</p>
              {products.length === 0 ? (
                <div className="text-center py-12">
                  <i className="fas fa-box-open text-6xl text-gray-300 mb-4"></i>
                  <p className="text-xl text-gray-600 mb-2">No se encontraron productos</p>
                  <p className="text-gray-500">
                    No hay productos disponibles con los filtros seleccionados.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.map((product) => (
                <div key={product.id} className="catalog-card transition-colors">
                  {product.imageUrl && (
                    <div className="mb-4">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-48 object-contain bg-white"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          // Si la URL relativa falla, intentar con URL completa
                          if (product.imageUrl && !product.imageUrl.startsWith('http')) {
                            const fullUrl = `${window.location.origin}${product.imageUrl}`;
                            if (target.src !== fullUrl) {
                              target.src = fullUrl;
                              return;
                            }
                          }
                          target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  {!product.imageUrl && (
                    <div className="mb-4 w-full h-48 bg-gray-50 rounded flex items-center justify-center" aria-label="Producto sin imagen">
                      <i className="fas fa-box text-4xl text-gray-400"></i>
                    </div>
                  )}
                  <h2 className="font-semibold text-base leading-snug mb-3 text-primary-700">{product.name}</h2>
                  {product.code && (
                    <p className="text-sm text-gray-500 mb-1">
                      <span className="font-medium">Código:</span> {product.code}
                    </p>
                  )}
                  {product.description && (
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {product.description}
                    </p>
                  )}
                  <p className="text-sm text-gray-500">
                    <span className="font-medium">Categoría:</span>{' '}
                    {product.category || 'Sin categoría'}
                  </p>
                  {product.material && (
                    <p className="text-sm text-gray-500">
                      <span className="font-medium">Material:</span> {product.material}
                    </p>
                  )}
                </div>
              ))}
                </div>
              )}</>}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PublicProducts;

