// src/pages/Forbidden.jsx
import { Link } from "react-router-dom";

export default function Forbidden() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold text-red-600">403</h1>
      <p className="text-lg">You don’t have permission to access this page.</p>
      <Link to="/" className="text-primary hover:underline">
        Back to Home
      </Link>
    </div>
  );
}
