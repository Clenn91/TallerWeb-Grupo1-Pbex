import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { PRODUCT_CATEGORIES } from '../utils/constants';

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState<number>(0);

  const slides = [
    {
      title: 'PIONEROS EN LA FABRICACIÓN DE BIDONES EN EL PERÚ',
      subtitle: 'Amplia Línea',
      link: '/public-products',
      buttonText: 'Ver productos',
    },
    {
      title: 'EXPERIENCIA, TECNOLOGÍA Y CALIDAD',
      subtitle: 'Empresa certificada',
      link: '/nosotros',
      buttonText: 'Conoce nuestra calidad',
    },
  ];

  const formatCategoryName = (value = ''): string =>
    value
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

  useEffect(() => {
    if (slides.length > 0) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, []);

  const nextSlide = (): void => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = (): void => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const goToSlide = (index: number): void => {
    setCurrentSlide(index);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="hero relative bg-primary-700 text-white overflow-hidden" aria-label="Presentación de PBEX">
        <div className="relative h-[640px] sm:h-[620px] md:h-[540px]">
          {slides.map((slide, index) => (
            <div
              key={index}
              aria-hidden={currentSlide !== index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                currentSlide === index ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <div className="container max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 h-full grid items-center gap-4 pb-20 pt-9 md:grid-cols-[1.4fr_1fr] md:gap-12 md:pb-16 md:pt-12">
                <div className="hero-content max-w-2xl">
                  <p className="mb-4 text-sm font-semibold tracking-wider text-accent-100">PLÁSTICOS BÁSICOS DE EXPORTACIÓN</p>
                  <h1 className="hero-title text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                    {slide.title}
                  </h1>
                  <p className="hero-subtitle text-lg md:text-xl mb-6 text-accent-100">
                    {slide.subtitle}
                  </p>
                  <Link
                    to={slide.link}
                    tabIndex={currentSlide === index ? 0 : -1}
                    className={`btn btn-accent px-7 ${
                      currentSlide === index ? '' : 'pointer-events-none'
                    }`}
                  >
                    {slide.buttonText}
                  </Link>
                </div>
                <img src="/products/botellon.png" alt="Botellón PBEX con caño" width="1000" height="1000" className="mx-auto h-44 w-full object-contain sm:h-56 md:h-96" />
              </div>
            </div>
          ))}

          {/* Slider Controls */}
          {slides.length > 1 && (
            <>
              <button
                className="slider-control prev absolute bottom-4 left-6 flex h-11 w-11 items-center justify-center rounded-md border border-white/30 text-white hover:bg-white/10 transition-colors z-20"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  prevSlide();
                }}
                type="button"
                aria-label="Slide anterior"
              >
                <i className="fas fa-chevron-left"></i>
              </button>
              <button
                className="slider-control next absolute bottom-4 right-6 flex h-11 w-11 items-center justify-center rounded-md border border-white/30 text-white hover:bg-white/10 transition-colors z-20"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  nextSlide();
                }}
                type="button"
                aria-label="Slide siguiente"
              >
                <i className="fas fa-chevron-right"></i>
              </button>

              {/* Slider Indicators */}
              <div className="slider-indicators absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    className={`indicator h-11 w-11 flex items-center justify-center transition-colors ${
                      currentSlide === index
                        ? 'text-white'
                        : 'text-white/40 hover:text-white/75'
                    }`}
                    onClick={() => goToSlide(index)}
                    type="button"
                    aria-label={`Ir al slide ${index + 1}`}
                    aria-pressed={currentSlide === index}
                  ><span className="h-1 w-7 rounded-full bg-current" /></button>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Products Grid */}
      <section className="products-section py-12 sm:py-16 bg-white">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-title text-3xl md:text-4xl font-bold mb-8 text-primary-700">
            Nuestros Productos
          </h2>

          <div className="products-grid grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 sm:gap-4">
            {PRODUCT_CATEGORIES.map((category) => (
              <Link
                key={category.slug}
                to={`/public-products?category=${category.slug}`}
                className="product-card rounded-lg border border-gray-200 bg-white p-3 text-center hover:border-primary-300 transition-colors group"
              >
                <div className="product-image mb-4">
                  <img src={`/products/${category.slug === 'botellones' ? 'botellon' : category.slug}.png`} alt="" width="1000" height="1000" loading="lazy" className="mx-auto h-28 w-full object-contain" />
                </div>
                <h3 className="product-name text-sm font-semibold text-primary-700 group-hover:text-accent-700 transition-colors">
                  {formatCategoryName(category.value)}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="about-section py-12 sm:py-16 bg-primary-50">
        <div className="container max-w-7xl mx-auto grid items-center gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
          <div>
          <h2 className="section-title text-3xl md:text-4xl font-bold mb-5 text-primary-700">
            TRAYECTORIA, REPUTACIÓN Y CONFIABILIDAD
          </h2>
          <p className="section-subtitle text-lg text-gray-700 mb-5">
            Somos la empresa líder en soluciones de envases plásticos en Perú
          </p>

          <div className="about-content">
            <p className="text-base leading-relaxed text-gray-600 mb-6">
              Somos líderes en la industria del plástico, con valores arraigados,
              tecnología punta y una larga experiencia. Fabricamos productos de alta
              calidad que impulsan el éxito de nuestros clientes.
            </p>
            <Link
              to="/nosotros"
              className="btn btn-primary"
            >
              Conoce más
            </Link>
          </div>
          </div>
          <img src="/brand/production.jpg" alt="Asas plásticas azules fabricadas por PBEX" width="850" height="567" loading="lazy" className="w-full rounded-lg object-cover" />
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;

