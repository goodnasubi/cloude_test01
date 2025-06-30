import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { authService, ServiceConfig } from '../../lib/auth-service';
import { useAuth } from '../../hooks/useAuth';

interface Service extends ServiceConfig {
  id: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function AdminServices() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
      return;
    }
    
    if (user) {
      checkAdminAccess();
    }
  }, [user, loading, router]);

  const checkAdminAccess = async () => {
    try {
      const adminStatus = await authService.isCurrentUserAdmin();
      setIsAdmin(adminStatus);
      
      if (!adminStatus) {
        setError('アクセス権限がありません。管理者グループに所属している必要があります。');
        return;
      }
      
      await loadServices();
    } catch (error) {
      setError('アクセス権限の確認に失敗しました。');
    } finally {
      setIsLoading(false);
    }
  };

  const loadServices = async () => {
    try {
      const data = await authService.getAllServices();
      setServices(data as Service[]);
    } catch (error) {
      setError('サービス一覧の取得に失敗しました。');
    }
  };

  const handleCreate = async (serviceData: Omit<ServiceConfig, 'id'>) => {
    try {
      await authService.createService(serviceData);
      await loadServices();
      setShowCreateForm(false);
      setError(null);
    } catch (error) {
      setError('サービスの作成に失敗しました。');
    }
  };

  const handleUpdate = async (id: string, serviceData: Partial<ServiceConfig>) => {
    try {
      await authService.updateService(id, serviceData);
      await loadServices();
      setIsEditing(false);
      setEditingService(null);
      setError(null);
    } catch (error) {
      setError('サービスの更新に失敗しました。');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('このサービスを削除しますか？')) return;
    
    try {
      await authService.deleteService(id);
      await loadServices();
      setError(null);
    } catch (error) {
      setError('サービスの削除に失敗しました。');
    }
  };

  const startEdit = (service: Service) => {
    setEditingService(service);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditingService(null);
  };

  if (loading || isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-500 text-xl">
          {error || 'アクセスが拒否されました。'}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow-lg rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">サービス管理</h1>
          <div className="flex gap-4">
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              新規サービス追加
            </button>
            <button
              onClick={() => router.push('/')}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
            >
              ホームに戻る
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  サービスID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  サービス名
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  認証タイプ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IdPプロバイダー
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ステータス
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  作成日時
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {services.map((service) => (
                <tr key={service.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {service.serviceId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {service.serviceName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      service.authType === 'cognito' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {service.authType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {service.idpProvider || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      service.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {service.isActive ? 'アクティブ' : '非アクティブ'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {service.createdAt ? new Date(service.createdAt).toLocaleDateString('ja-JP') : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => startEdit(service)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      編集
                    </button>
                    <button
                      onClick={() => handleDelete(service.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      削除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {services.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            サービスが登録されていません。
          </div>
        )}
      </div>

      {(showCreateForm || isEditing) && (
        <ServiceForm
          service={editingService}
          onSave={isEditing ? 
            (data) => handleUpdate(editingService!.id, data) : 
            handleCreate
          }
          onCancel={isEditing ? cancelEdit : () => setShowCreateForm(false)}
          isEditing={isEditing}
        />
      )}
    </div>
  );
}

interface ServiceFormProps {
  service?: Service | null;
  onSave: (data: any) => void;
  onCancel: () => void;
  isEditing: boolean;
}

function ServiceForm({ service, onSave, onCancel, isEditing }: ServiceFormProps) {
  const [formData, setFormData] = useState({
    serviceId: service?.serviceId || '',
    serviceName: service?.serviceName || '',
    authType: service?.authType || 'cognito',
    idpProvider: service?.idpProvider || '',
    samlMetadata: service?.samlMetadata || '',
    isActive: service?.isActive ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-6">
          {isEditing ? 'サービス編集' : '新規サービス作成'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">サービスID</label>
            <input
              type="text"
              name="serviceId"
              value={formData.serviceId}
              onChange={handleChange}
              disabled={isEditing}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">サービス名</label>
            <input
              type="text"
              name="serviceName"
              value={formData.serviceName}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">認証タイプ</label>
            <select
              name="authType"
              value={formData.authType}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="cognito">Cognito</option>
              <option value="saml">SAML</option>
            </select>
          </div>

          {formData.authType === 'saml' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">IdPプロバイダー</label>
                <input
                  type="text"
                  name="idpProvider"
                  value={formData.idpProvider}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">SAMLメタデータ</label>
                <textarea
                  name="samlMetadata"
                  value={formData.samlMetadata}
                  onChange={handleChange}
                  rows={4}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </>
          )}

          <div className="flex items-center">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900">
              アクティブ
            </label>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              {isEditing ? '更新' : '作成'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}