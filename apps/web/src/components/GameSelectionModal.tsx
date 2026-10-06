import type { GameId } from "@ratri/types";
import { AVAILABLE_GAMES } from "./GameStage";
import { Gamepad2, X, Sparkles } from "lucide-react";
import { Button } from "./ui/button";

interface GameSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectGame: (gameId: GameId) => void;
}

export function GameSelectionModal({
  isOpen,
  onClose,
  onSelectGame,
}: GameSelectionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-2xl bg-neutral-950 border border-white/20 rounded-2xl p-6 text-white shadow-2xl space-y-5 relative overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[hsl(var(--accent))/0.2] border border-[hsl(var(--accent))] flex items-center justify-center text-[hsl(var(--accent))]">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold tracking-tight">Select Room Game 🎮</h2>
              <p className="text-xs text-gray-400">Choose a game to launch for everyone in the room!</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 5 Game Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto custom-scrollbar p-1">
          {AVAILABLE_GAMES.map((game) => {
            const IconComponent = game.icon;
            return (
              <div
                key={game.id}
                className={`p-4 rounded-xl border bg-gradient-to-br ${game.colorClass} flex flex-col justify-between space-y-3 transition-all hover:scale-[1.02] shadow-lg relative group`}
              >
                <div className="flex items-start justify-between">
                  <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center">
                    <IconComponent className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-white/15 border border-white/20 text-gray-200">
                    {game.badge}
                  </span>
                </div>

                <div>
                  <h3 className="font-extrabold text-sm text-white tracking-wide">{game.name}</h3>
                  <p className="text-[11px] text-gray-300 leading-relaxed mt-1">
                    {game.description}
                  </p>
                </div>

                <Button
                  onClick={() => {
                    onSelectGame(game.id);
                    onClose();
                  }}
                  className="w-full h-9 text-xs font-bold rounded-lg bg-[hsl(var(--accent))] hover:bg-[hsl(var(--accent-hover))] text-white cursor-pointer gap-1.5 shadow-md"
                >
                  <Sparkles className="w-3.5 h-3.5 fill-current text-amber-300" />
                  <span>Play {game.name}</span>
                </Button>
              </div>
            );
          })}
        </div>

        <div className="pt-3 border-t border-white/10 text-center">
          <span className="text-[11px] text-gray-400 font-mono">
            💡 The host can switch game modes anytime during lobby waiting!
          </span>
        </div>

      </div>
    </div>
  );
}
