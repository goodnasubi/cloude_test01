export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          AWS Amplify Authentication System
        </h1>
        
        <div className="bg-blue-100 p-4 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-2">How to Use</h2>
          <p className="mb-2">Access services by visiting their specific URLs:</p>
          <ul className="list-disc list-inside">
            <li><code>/app1</code> - Service with Cognito authentication</li>
            <li><code>/app2</code> - Service with SAML authentication</li>
          </ul>
        </div>

        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">System Features</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>URL path parameter-based automatic authentication</li>
            <li>Support for both Cognito and SAML authentication</li>
            <li>Database-driven service configuration</li>
            <li>User session tracking and service access logging</li>
          </ul>
        </div>
      </div>
    </div>
  );
}