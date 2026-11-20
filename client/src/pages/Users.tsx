import Dialog from '../components/Dialog';
import { useState, FormEvent, ChangeEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { userAPI } from '../services/api';
import { USER_ROLES } from '../utils/constants';
import toast from 'react-hot-toast';
import type { User } from '../types';

interface UserFormData {
  username: string;
  email: string;
  password: string;
  fullName: string;
  role: string;
  active: boolean;
}

const Users = () => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDeactivate, setUserToDeactivate] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    email: '',
    password: '',
    fullName: '',
    role: USER_ROLES.ASSISTANT,
    active: true,
  });

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<{ data: User[] }>('users', () =>
    userAPI.getAll().then((res) => res.data)
  );

  const createUserMutation = useMutation(
    (data: Partial<UserFormData>) => userAPI.create(data),
    {
      onSuccess: () => {
        toast.success('Usuario creado correctamente');
        queryClient.invalidateQueries('users');
        setShowModal(false);
        resetForm();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Error al crear usuario');
      },
    }
  );

  const updateUserMutation = useMutation(
    ({ id, data }: { id: number; data: Partial<UserFormData> }) => userAPI.update(id, data),
    {
      onSuccess: () => {
        toast.success('Usuario actualizado correctamente');
        queryClient.invalidateQueries('users');
        setShowModal(false);
        setEditingUser(null);
        resetForm();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Error al actualizar usuario');
      },
    }
  );

  const deleteUserMutation = useMutation(
    (id: number) => userAPI.delete(id),
    {
      onSuccess: () => {
        toast.success('Usuario desactivado correctamente');
        queryClient.invalidateQueries('users');
        setUserToDeactivate(null);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Error al desactivar usuario');
      },
    }
  );

  const resetForm = (): void => {
    setFormData({
      username: '',
      email: '',
      password: '',
      fullName: '',
      role: USER_ROLES.ASSISTANT,
      active: true,
    });
    setEditingUser(null);
  };

  const handleOpenModal = (user: User | null = null): void => {
    if (user) {
      setEditingUser(user);
      setFormData({
        username: user.username,
        email: user.email,
        password: '',
        fullName: user.fullName,
        role: user.role,
        active: user.active,
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const handleCloseModal = (): void => {
    setShowModal(false);
    setEditingUser(null);
    resetForm();
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const submitData: Partial<UserFormData> = { ...formData };
    
    // Si está editando y no se cambió la contraseña, no enviarla
    if (editingUser && !submitData.password) {
      delete submitData.password;
    }

    if (editingUser) {
      updateUserMutation.mutate({ id: editingUser.id, data: submitData });
    } else {
      // Al crear, la contraseña es obligatoria
      if (!submitData.password) {
        toast.error('La contraseña es requerida');
        return;
      }
      createUserMutation.mutate(submitData);
    }
  };

  const handleDelete = (user: User): void => {
    setUserToDeactivate(user);
  };

  const getRoleLabel = (role: string): string => {
    const labels: Record<string, string> = {
      [USER_ROLES.ASSISTANT]: 'Asistente de Calidad',
      [USER_ROLES.SUPERVISOR]: 'Supervisor',
      [USER_ROLES.ADMIN]: 'Administrador',
      [USER_ROLES.MANAGEMENT]: 'Gerencia',
      [USER_ROLES.VISITOR]: 'Visitante',
    };
    return labels[role] || role;
  };

  if (isLoading) {
    return <div className="text-center py-8">Cargando usuarios...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Usuarios</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gestión de usuarios del sistema
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="btn btn-primary"
        >
          + Crear Usuario
        </button>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Nombre Completo</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {data?.data?.map((user) => (
                <tr key={user.id}>
                  <td>{user.username}</td>
                  <td>{user.fullName}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {getRoleLabel(user.role)}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {user.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleOpenModal(user)}
                        className="btn btn-secondary text-xs"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(user)}
                        className="btn btn-danger text-xs"
                      >
                        Desactivar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {userToDeactivate && (
        <Dialog title="Desactivar usuario" onClose={() => setUserToDeactivate(null)} busy={deleteUserMutation.isLoading}
          description="El usuario quedará inactivo y no podrá ingresar al sistema.">
          <p className="text-base text-gray-700">¿Deseas desactivar a <strong>{userToDeactivate.fullName}</strong>?</p>
          <div className="form-actions">
            <button type="button" onClick={() => setUserToDeactivate(null)} className="btn btn-secondary" disabled={deleteUserMutation.isLoading}>Cancelar</button>
            <button type="button" onClick={() => deleteUserMutation.mutate(userToDeactivate.id)} className="btn btn-danger" disabled={deleteUserMutation.isLoading}>
              {deleteUserMutation.isLoading ? 'Desactivando...' : 'Desactivar usuario'}
            </button>
          </div>
        </Dialog>
      )}

      {/* Modal para crear/editar usuario */}
      {showModal && (
        <Dialog title={editingUser ? "Editar usuario" : "Crear usuario"} onClose={handleCloseModal} busy={createUserMutation.isLoading || updateUserMutation.isLoading}
          description="Completa los datos de acceso y el rol. Los campos con * son obligatorios.">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="users-field-1" className="block text-sm font-medium text-gray-700 mb-1">
                  Usuario *
                </label>
                <input id="users-field-1"
                  type="text"
                  className="input"
                  value={formData.username}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, username: e.target.value })}
                  required
                  disabled={!!editingUser}
                />
              </div>

              <div>
                <label htmlFor="users-field-2" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre Completo *
                </label>
                <input id="users-field-2"
                  type="text"
                  className="input"
                  value={formData.fullName}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                />
              </div>

              <div>
                <label htmlFor="users-field-3" className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input id="users-field-3"
                  type="email"
                  className="input"
                  value={formData.email}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div>
                <label htmlFor="users-field-4" className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña {editingUser ? '(dejar vacío para no cambiar)' : '*'}
                </label>
                <input id="users-field-4"
                  type="password"
                  className="input"
                  value={formData.password}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, password: e.target.value })}
                  required={!editingUser}
                  minLength={6}
                />
              </div>

              <div>
                <label htmlFor="users-field-5" className="block text-sm font-medium text-gray-700 mb-1">
                  Rol *
                </label>
                <select id="users-field-5"
                  className="input"
                  value={formData.role}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, role: e.target.value })}
                  required
                >
                  <option value={USER_ROLES.ASSISTANT}>Asistente de Calidad</option>
                  <option value={USER_ROLES.SUPERVISOR}>Supervisor</option>
                  <option value={USER_ROLES.ADMIN}>Administrador</option>
                  <option value={USER_ROLES.MANAGEMENT}>Gerencia</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="active"
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  checked={formData.active}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, active: e.target.checked })}
                />
                <label htmlFor="active" className="ml-2 text-sm text-gray-700">
                  Usuario activo
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={createUserMutation.isLoading || updateUserMutation.isLoading}
                >
                  {createUserMutation.isLoading || updateUserMutation.isLoading
                    ? 'Guardando...'
                    : editingUser
                    ? 'Actualizar'
                    : 'Crear'}
                </button>
              </div>
            </form>
        </Dialog>
      )}
    </div>
  );
};

export default Users;

