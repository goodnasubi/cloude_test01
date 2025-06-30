import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';
import { useAdmin } from '../hooks/useAdmin';

export default function Home() {
  const { user } = useAuth();
  const { isAdmin, loading } = useAdmin();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow-lg rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            AWS Amplify Authentication System
          </h1>
          
          <div className="flex items-center space-x-4">
            {user && (
              <div className="text-sm text-gray-600">
                ログイン中: {user.signInDetails?.loginId || user.userId}
              </div>
            )}
            
            {!loading && isAdmin && (
              <Link
                href="/admin/services"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                サービス管理
              </Link>
            )}
          </div>
        </div>
        
        <div className="bg-blue-100 p-4 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-2">使用方法</h2>
          <p className="mb-2">各サービスの専用URLにアクセスしてください：</p>
          <ul className="list-disc list-inside">
            <li><code>/app1</code> - Cognito認証を使用するサービス</li>
            <li><code>/app2</code> - SAML認証を使用するサービス</li>
          </ul>
        </div>

        <div className="bg-gray-100 p-4 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-2">システム機能</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>URLパスパラメータによる自動認証</li>
            <li>CognitoおよびSAML認証の両方をサポート</li>
            <li>データベース駆動のサービス設定</li>
            <li>ユーザーセッション追跡とサービスアクセスログ</li>
          </ul>
        </div>

        {!loading && isAdmin && (
          <div className="bg-green-100 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">管理者機能</h2>
            <p className="mb-2">管理者として以下の機能を利用できます：</p>
            <ul className="list-disc list-inside">
              <li>サービスの作成、編集、削除</li>
              <li>認証設定の管理</li>
              <li>サービスのアクティブ/非アクティブ状態の制御</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}