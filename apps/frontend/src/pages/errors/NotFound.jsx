// src/pages/NotFound.jsx
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-lg">Page not found</p>
      <Link to="/" className="text-primary hover:underline">
        Go Home
      </Link>
    </div>
  );
}
