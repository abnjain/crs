import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import config from "@/config/config";
import toast from "react-hot-toast";

const HealthCheck = () => {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchHealth = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${config.api.baseUrl}/api/health`);
      if (!res.ok) throw new Error(`Server responded with ${res.status}`);
      const data = await res.json();
      setHealth(data);
      toast.success(data.message)
    } catch (err) {
      toast.error(err.message);
      setHealth(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 p-6">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader className="flex justify-between items-center">
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            Server Health Check
            {loading ? (
              <Loader2 className="animate-spin text-blue-500" size={22} />
            ) : health && !error ? (
              <CheckCircle className="text-green-500" size={22} />
            ) : (
              <XCircle className="text-red-500" size={22} />
            )}
          </CardTitle>
          <Button variant="outline" size="sm" onClick={fetchHealth}>
            <RefreshCw size={16} className={loading ? "animate-spin mr-1" : "mr-1"} />
            Refresh
          </Button>
        </CardHeader>

        <CardContent>
          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-md text-sm mb-2">
              ❌ {error}
            </div>
          )}

          {health ? (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium">Status:</span>
                <Badge
                  className={
                    health.status === "ok" ? "bg-green-500" : "bg-yellow-500"
                  }
                >
                  {health.status}
                </Badge>
              </div>

              <div className="flex justify-between">
                <span className="font-medium">Database:</span>
                <Badge
                  className={
                    health.database === "connected"
                      ? "bg-green-500"
                      : "bg-red-500"
                  }
                >
                  {health.database}
                </Badge>
              </div>

              <div className="flex justify-between">
                <span className="font-medium">Message:</span>
                <span className="text-sm text-slate-700">
                  {health.message}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="font-medium">Uptime:</span>
                <span className="text-sm text-slate-700">
                  {Math.round(health.uptime)}s
                </span>
              </div>

              <div className="flex justify-between">
                <span className="font-medium">Timestamp:</span>
                <span className="text-sm text-slate-700">{health.timestamp}</span>
              </div>
            </div>
          ) : !loading && !error ? (
            <p className="text-center text-slate-600">No health data available.</p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
};

export default HealthCheck;
