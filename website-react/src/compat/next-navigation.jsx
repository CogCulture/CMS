import { useNavigate, useLocation, useParams, useSearchParams } from 'react-router-dom';

export function useRouter() {
  const navigate = useNavigate();
  return {
    push: (path) => navigate(path),
    replace: (path) => navigate(path, { replace: true }),
    back: () => navigate(-1),
    forward: () => navigate(1),
    refresh: () => window.location.reload(),
  };
}

export function usePathname() {
  const location = useLocation();
  return location.pathname;
}

export { useSearchParams, useParams };

export function notFound() {
  const err = new Error('NEXT_NOT_FOUND');
  err.digest = 'NEXT_NOT_FOUND';
  throw err;
}
