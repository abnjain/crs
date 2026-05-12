import { useNavigate } from 'react-router-dom';

export function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="error-page">
      <div className="error-page-inner">
        <img src="/404.jpg" alt="" className="error-page-img" width={320} height={240} />
        <h1 className="error-page-title">404 Not Found</h1>
        <p className="error-page-desc">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <button onClick={() => navigate(-1)} className="btn btn-primary">
          Go Back
        </button>
      </div>
    </div>
  );
}
