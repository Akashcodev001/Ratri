import { Link } from 'react-router-dom';
import { SeoHead } from '../components/seo/SeoHead';
import { Home, AlertCircle } from 'lucide-react';

export function NotFound() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-[hsl(var(--bg))] text-[hsl(var(--text))] p-6">
      <SeoHead
        title="404 Page Not Found — Ratri"
        description="The requested page or room could not be found on Ratri."
        noindex={true}
      />

      <div className="max-w-md w-full ui-card p-8 rounded-2xl border border-[hsl(var(--border))] text-center space-y-6 shadow-2xl">
        <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto border border-amber-500/20">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-[hsl(var(--text))]">404 — Page Not Found</h1>
          <p className="text-xs text-[hsl(var(--text-secondary))] leading-relaxed">
            The page or room code you are looking for does not exist, has expired, or has been moved.
          </p>
        </div>
        <div className="pt-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[hsl(var(--accent))] hover:bg-[hsl(var(--accent-hover))] text-white text-xs font-semibold rounded-xl transition-all shadow-sm"
          >
            <Home className="w-4 h-4" /> Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
