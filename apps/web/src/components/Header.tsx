import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";
import { Tv, AlertTriangle, LogOut, X } from "lucide-react";
import { Button } from "./ui/button";

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const isInRoom = location.pathname.startsWith("/r/");
  const [showExitModal, setShowExitModal] = useState(false);

  useEffect(() => {
    const handleOpenLeaveModal = () => {
      if (isInRoom) {
        setShowExitModal(true);
      }
    };
    window.addEventListener("prompt-leave-room", handleOpenLeaveModal);
    return () => {
      window.removeEventListener("prompt-leave-room", handleOpenLeaveModal);
    };
  }, [isInRoom]);

  const handleLogoClick = (e: React.MouseEvent) => {
    if (isInRoom) {
      e.preventDefault();
      setShowExitModal(true);
    }
  };

  const handleConfirmExit = () => {
    setShowExitModal(false);
    navigate("/");
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-[hsl(var(--border))] bg-[hsl(var(--surface)/0.9)] backdrop-blur-md transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          
          {/* Brand Logo */}
          <Link to="/" onClick={handleLogoClick} className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-[hsl(var(--accent))] text-white flex items-center justify-center font-bold shadow-sm group-hover:scale-105 transition-transform duration-200">
              <Tv className="w-4 h-4 fill-current" />
            </div>
            <span className="font-display font-extrabold text-lg tracking-tight text-[hsl(var(--text))]">
              RATRI
            </span>
          </Link>

          {/* Navigation Links for SEO & Internal Linking */}
          <nav className="hidden md:flex items-center gap-4 text-xs font-semibold text-[hsl(var(--text-secondary))]">
            <Link to="/watch-together" className="hover:text-[hsl(var(--text))] transition-colors">
              Watch Together
            </Link>
            <Link to="/watch-party" className="hover:text-[hsl(var(--text))] transition-colors">
              Watch Party
            </Link>
            <Link to="/screen-share" className="hover:text-[hsl(var(--text))] transition-colors">
              Screen Share
            </Link>
            <Link to="/listen-together" className="hover:text-[hsl(var(--text))] transition-colors">
              Music Lounge
            </Link>
          </nav>

          {/* Right Section: Theme Toggle & Status */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-medium text-[hsl(var(--text-secondary))]">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>Online</span>
            </div>
            <div className="h-4 w-[1px] bg-[hsl(var(--border))]" />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Exit Room Confirmation Modal (Linear/GitHub Inspired Sleek UI) */}
      {showExitModal && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-[#12151C] border border-white/15 w-full max-w-sm rounded-xl p-5 shadow-2xl space-y-4 text-left relative transform scale-100 transition-all">
            
            {/* Top Row: Disconnect Badge & Close Icon */}
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-mono font-semibold uppercase tracking-wider">
                <AlertTriangle className="w-3 h-3" />
                <span>Disconnect</span>
              </div>
              <button
                type="button"
                onClick={() => setShowExitModal(false)}
                className="text-gray-400 hover:text-white p-1 rounded-md transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* Modal Heading & Description */}
            <div className="space-y-1">
              <h3 className="font-semibold text-base text-white tracking-tight">Leave Watch Room?</h3>
              <p className="text-xs text-gray-300 leading-normal">
                Are you sure you want to leave this room? Your live call connection and chat session will end.
              </p>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowExitModal(false)}
                className="h-8 text-xs font-semibold rounded-lg cursor-pointer border-white/20 bg-white/5 text-gray-100 hover:text-white hover:bg-white/15 hover:border-white/40 transition-all"
              >
                Stay in Room
              </Button>

              <Button
                size="sm"
                onClick={handleConfirmExit}
                className="h-8 text-xs font-semibold rounded-lg cursor-pointer bg-rose-600 hover:bg-rose-700 text-white gap-1.5 shadow-sm transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
                Leave Room
              </Button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}

