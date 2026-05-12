import { Link, useNavigate } from 'react-router-dom';

export function ForbiddenPage() {
  const navigate = useNavigate();
  return (
    <div className="error-page">
      <div className="error-page-inner">
        <img src="/403.jpg" alt="" className="error-page-img" width={320} height={240} />
        <h1 className="error-page-title">403 Access Denied</h1>
        <p className="error-page-desc">
          You do not have access to this page. To get access, please contact your administrator.
        </p>
        <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/dashboard" className="btn btn-primary">
            Go to Dashboard
          </Link>
          <button onClick={() => navigate(-1)} className="btn btn-outline">
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
