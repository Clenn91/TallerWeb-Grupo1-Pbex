import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import BrandLogo from '../components/BrandLogo';
import toast from 'react-hot-toast';

const Login = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login(username, password);

      if (result.success) {
        toast.success('Inicio de sesión exitoso');
        // La redirección se manejará automáticamente por el useEffect
      } else {
        toast.error(result.message || 'Error al iniciar sesión');
        setLoading(false);
      }
    } catch (error) {
      toast.error('Error al iniciar sesión');
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen border-t-4 border-primary-700 bg-primary-50 px-4 py-8 sm:py-14">
      <div className="mx-auto max-w-md">
        <Link to="/" className="mb-8 inline-block text-sm font-semibold text-primary-700 hover:underline">Volver al inicio</Link>
        <div className="card !p-6 sm:!p-8">
          <Link to="/" className="mb-8 inline-block"><BrandLogo /></Link>
          <p className="section-label">Gestión de calidad</p>
          <h1 className="text-3xl font-bold">Iniciar sesión</h1>
          <p className="mt-3 text-gray-600">Ingresa con tu usuario y contraseña para acceder al sistema.</p>
        <form className="mt-7 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-5">
            <div>
              <label htmlFor="username" className="mb-2 block text-sm font-semibold text-gray-700">
                Usuario
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                className="input"
                placeholder="Tu usuario"
                value={username}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-semibold text-gray-700">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="input"
                placeholder="Tu contraseña"
                value={password}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full"
            >
              {loading ? 'Iniciando sesión...' : 'Ingresar al sistema'}
            </button>
          </div>
        </form>

        <div className="mt-6 border-t border-gray-200 pt-6">
          <div>
            <button
              type="button"
              onClick={() => navigate('/public-products')}
              className="btn btn-secondary w-full"
            >
              Ver catálogo de productos
            </button>
            <p className="mt-3 text-center text-sm text-gray-500">
              Acceso sin necesidad de iniciar sesión
            </p>
          </div>
        </div>
        </div>
      </div>
    </main>
  );
};

export default Login;

