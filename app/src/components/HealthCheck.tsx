import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:3000';

interface HealthResponse {
  status: string;
  timestamp: string;
}

export function HealthCheck() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkHealth = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/health`);
      const data = await response.json();

      if (response.ok) {
        setHealth(data);
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setHealth(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <div className="health-check">
      <h1>tRPC API Health Check</h1>

      <div className="status-card">
        {loading && (
          <p className="loading">🔄 Checking API status...</p>
        )}

        {!loading && health && (
          <div className="success">
            <h2>✅ API is healthy!</h2>
            <p><strong>Status:</strong> {health.status}</p>
            <p><strong>Timestamp:</strong> {new Date(health.timestamp).toLocaleString()}</p>
            <p><strong>API URL:</strong> {API_URL}</p>
          </div>
        )}

        {!loading && error && (
          <div className="error">
            <h2>❌ API is not responding</h2>
            <p><strong>Error:</strong> {error}</p>
            <p><strong>API URL:</strong> {API_URL}</p>
            <p>Make sure the API server is running:</p>
            <code>cd api && npm run dev</code>
          </div>
        )}
      </div>

      <button onClick={checkHealth} disabled={loading}>
        Refresh
      </button>
    </div>
  );
}
