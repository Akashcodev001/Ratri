import { useState } from "react";
import type { GameSession, GamePlayer, GameId } from "@ratri/types";
import { Gamepad2, Trophy, Clock, Play, Users, X, CheckCircle, Sparkles, Brain, Zap, Film, Type, Check } from "lucide-react";
import { Button } from "./ui/button";

interface GameStageProps {
  gameSession?: GameSession;
  isHost: boolean;
  currentSocketId: string;
  onJoinGame: () => void;
  onStartGame: () => void;
  onSubmitAnswer: (questionIndex: number, optionIndex: number) => void;
  onExitGame: () => void;
  onCreateGame?: (gameId: GameId) => void;
}

export const AVAILABLE_GAMES: {
  id: GameId;
  name: string;
  badge: string;
  description: string;
  icon: any;
  colorClass: string;
}[] = [
  {
    id: "trivia-clash",
    name: "Trivia Clash 🎯",
    badge: "Pop Culture Quiz",
    description: "Speed quiz on movies, music, gaming & tech. Earn streak bonuses!",
    icon: Trophy,
    colorClass: "from-purple-900/40 via-indigo-950/50 to-blue-900/40 border-purple-500/40 hover:border-purple-400",
  },
  {
    id: "word-dash",
    name: "Word Dash 🔤",
    badge: "Word Unscramble",
    description: "Unscramble watch-party & pop-culture terms under a 12s timer!",
    icon: Type,
    colorClass: "from-amber-900/40 via-orange-950/50 to-yellow-900/40 border-amber-500/40 hover:border-amber-400",
  },
  {
    id: "emoji-riddle",
    name: "Emoji Riddle 🎬",
    badge: "Movie Charades",
    description: "Decode iconic movies, songs & pop culture legends from emoji clues!",
    icon: Film,
    colorClass: "from-pink-900/40 via-rose-950/50 to-red-900/40 border-pink-500/40 hover:border-pink-400",
  },
  {
    id: "math-blitz",
    name: "Math Blitz ⚡",
    badge: "Brain Speed",
    description: "Rapid mental arithmetic race with 10-second blitz timer per question!",
    icon: Zap,
    colorClass: "from-cyan-900/40 via-teal-950/50 to-emerald-900/40 border-cyan-500/40 hover:border-cyan-400",
  },
  {
    id: "memory-matrix",
    name: "Memory Matrix 🧠",
    badge: "Pattern Recall",
    description: "Recall color sequences, icon order & animal patterns under pressure!",
    icon: Brain,
    colorClass: "from-emerald-900/40 via-green-950/50 to-lime-900/40 border-emerald-500/40 hover:border-emerald-400",
  },
];

export function GameStage({
  gameSession,
  isHost,
  currentSocketId,
  onJoinGame,
  onStartGame,
  onSubmitAnswer,
  onExitGame,
  onCreateGame,
}: GameStageProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  if (!gameSession) {
    return (
      <div className="w-full h-full flex flex-col justify-between p-4 sm:p-6 bg-gradient-to-b from-neutral-900 via-neutral-950 to-black text-white rounded-2xl border border-white/10 relative overflow-y-auto shadow-2xl custom-scrollbar">
        <div className="flex flex-col items-center text-center space-y-2 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-[hsl(var(--accent))/0.2] border border-[hsl(var(--accent))] flex items-center justify-center shadow-xl animate-pulse">
            <Gamepad2 className="w-6 h-6 text-[hsl(var(--accent))]" />
          </div>
          <h2 className="text-xl font-extrabold tracking-tight">Select Room Multiplayer Game 🎮</h2>
          <p className="text-xs text-gray-400 max-w-md">
            Choose a game to play together live in the room while talking on voice & video!
          </p>
        </div>

        {/* 5 Multiplayer Game Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 my-auto">
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
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/10 border border-white/15 text-gray-300">
                    {game.badge}
                  </span>
                </div>

                <div>
                  <h3 className="font-extrabold text-sm text-white tracking-wide">{game.name}</h3>
                  <p className="text-[11px] text-gray-300 leading-relaxed mt-1 line-clamp-2">
                    {game.description}
                  </p>
                </div>

                <Button
                  onClick={() => onCreateGame ? onCreateGame(game.id) : onJoinGame()}
                  className="w-full h-8 text-[11px] font-bold rounded-lg bg-[hsl(var(--accent))] hover:bg-[hsl(var(--accent-hover))] border border-white/20 text-white cursor-pointer gap-1.5 shadow-sm"
                >
                  <Sparkles className="w-3 h-3 fill-current text-amber-300" />
                  <span>Select & Launch Lobby</span>
                </Button>
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-3 border-t border-white/10 text-center">
          <span className="text-[11px] text-gray-400 font-mono">
            ⚡ Server-Authoritative Real-Time Synchronized Scoring & Leaderboards
          </span>
        </div>
      </div>
    );
  }

  const isPlayerInGame = gameSession.players.some((p: GamePlayer) => p.socketId === currentSocketId);
  const currentQuestion = gameSession.currentQuestion;

  return (
    <div className="w-full h-full flex flex-col justify-between p-4 sm:p-6 bg-gradient-to-b from-neutral-900 via-neutral-950 to-black text-white rounded-2xl border border-white/15 relative overflow-y-auto custom-scrollbar shadow-2xl space-y-4">
      
      {/* Top Game Bar */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[hsl(var(--accent))] flex items-center justify-center font-bold text-white shadow-sm">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white tracking-wide uppercase">
              {gameSession.title || 'ROOM MULTIPLAYER GAME'}
            </h3>
            <span className="text-[10px] font-mono text-emerald-400">
              {gameSession.status === 'LOBBY' ? 'LOBBY WAITING' : gameSession.status === 'IN_PROGRESS' ? `ROUND ${gameSession.currentQuestionIndex + 1} OF ${gameSession.totalQuestions || 5}` : 'GAME FINISHED'}
            </span>
          </div>
        </div>

        {/* Exit Game Stop Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onExitGame}
          className="h-8 text-xs font-semibold rounded-lg cursor-pointer border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 gap-1.5"
        >
          <X className="w-3.5 h-3.5" />
          <span>Exit Game</span>
        </Button>
      </div>

      {/* Main Game Stage View */}
      {gameSession.status === 'LOBBY' && (
        <div className="flex-1 flex flex-col justify-between space-y-4">
          
          {/* 5-Game Selection Bar in Lobby */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                <Gamepad2 className="w-4 h-4 text-[hsl(var(--accent))]" />
                Select Game Mode ({AVAILABLE_GAMES.length} Available):
              </span>
              <span className="text-[11px] text-gray-400 font-mono">Host can switch games anytime</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              {AVAILABLE_GAMES.map((game) => {
                const isSelected = gameSession.gameId === game.id;
                const IconComponent = game.icon;
                return (
                  <button
                    key={game.id}
                    type="button"
                    onClick={() => onCreateGame && onCreateGame(game.id)}
                    className={`p-2.5 rounded-xl border text-left flex flex-col justify-between space-y-1.5 transition-all cursor-pointer relative ${
                      isSelected
                        ? "bg-gradient-to-br from-[hsl(var(--accent))/0.3] to-purple-900/40 border-[hsl(var(--accent))] text-white shadow-lg ring-2 ring-[hsl(var(--accent))/0.5] scale-[1.02]"
                        : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/25"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className={`p-1 rounded-md ${isSelected ? 'bg-[hsl(var(--accent))] text-white' : 'bg-white/10 text-gray-400'}`}>
                        <IconComponent className="w-3.5 h-3.5" />
                      </div>
                      {isSelected && (
                        <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-500 text-black flex items-center gap-0.5 shadow">
                          <Check className="w-2.5 h-2.5 stroke-[3]" /> ACTIVE
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold leading-tight">{game.name}</h4>
                      <p className="text-[10px] text-gray-400 line-clamp-1">{game.badge}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Lobby Status Banner & Players */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center justify-center space-y-3 text-center my-auto">
            <div className="space-y-1">
              <h4 className="text-base font-extrabold text-white">Active Lobby: {gameSession.title}</h4>
              <p className="text-xs text-gray-400">Gather room members to compete in real-time!</p>
            </div>

            {/* Players Grid */}
            <div className="flex flex-wrap items-center justify-center gap-2 max-w-md my-1">
              {gameSession.players.map((p: GamePlayer) => (
                <div
                  key={p.socketId}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 border border-white/15 text-xs font-semibold shadow-sm"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{p.name} {p.socketId === currentSocketId ? '(You)' : ''}</span>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              {!isPlayerInGame && (
                <Button
                  onClick={onJoinGame}
                  className="h-10 px-5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-lg"
                >
                  Join Game Session
                </Button>
              )}

              {isHost && (
                <Button
                  onClick={onStartGame}
                  disabled={gameSession.players.length < 1}
                  className="h-10 px-6 text-xs font-bold rounded-xl bg-[hsl(var(--accent))] text-white hover:bg-[hsl(var(--accent-hover))] cursor-pointer gap-2 shadow-lg"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Start {gameSession.title} Now 🚀</span>
                </Button>
              )}
            </div>
          </div>

        </div>
      )}

      {/* In-Game Question View */}
      {gameSession.status === 'IN_PROGRESS' && currentQuestion && (
        <div className="flex-1 flex flex-col justify-between my-auto space-y-4">
          
          {/* Question Box & Timer */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-gray-400 font-mono">
              <span className="flex items-center gap-1.5 text-amber-400 font-bold">
                <Clock className="w-4 h-4" /> {gameSession.timerSeconds}s Remaining
              </span>
              {currentQuestion.category && (
                <span className="px-2 py-0.5 rounded bg-white/10 text-emerald-300 text-[10px] font-semibold border border-white/10">
                  {currentQuestion.category}
                </span>
              )}
            </div>

            {/* Countdown Bar */}
            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 transition-all duration-1000 ease-linear"
                style={{ width: `${(gameSession.timerSeconds / currentQuestion.timeLimitSeconds) * 100}%` }}
              />
            </div>

            {/* Emoji Code Banner if Present */}
            {currentQuestion.emojiCode && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-purple-900/40 to-pink-900/40 border border-purple-500/30 text-center">
                <span className="text-4xl tracking-widest animate-bounce inline-block">
                  {currentQuestion.emojiCode}
                </span>
              </div>
            )}

            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                {currentQuestion.question}
              </h3>
            </div>
          </div>

          {/* 4 Interactive Option Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentQuestion.options.map((option: string, idx: number) => {
              const isSelected = selectedOption === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSelectedOption(idx);
                    onSubmitAnswer(gameSession.currentQuestionIndex, idx);
                  }}
                  className={`p-3.5 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? "bg-[hsl(var(--accent))] border-[hsl(var(--accent))] text-white shadow-lg scale-[1.02]"
                      : "bg-white/5 border-white/15 text-gray-200 hover:bg-white/10 hover:border-white/30"
                  }`}
                >
                  <span>{option}</span>
                  {isSelected && <CheckCircle className="w-4 h-4 text-white" />}
                </button>
              );
            })}
          </div>

        </div>
      )}

      {/* Game Finished Summary */}
      {gameSession.status === 'FINISHED' && (
        <div className="flex-1 flex flex-col items-center justify-center space-y-4 my-auto">
          <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-3xl border-2 border-amber-500/40 animate-pulse">
            🏆
          </div>
          <h3 className="text-xl font-extrabold text-white">Game Champion Announced!</h3>

          <div className="w-full max-w-md p-4 rounded-xl bg-white/5 border border-white/10 space-y-2 text-xs">
            {gameSession.players
              .sort((a: GamePlayer, b: GamePlayer) => b.score - a.score)
              .map((p: GamePlayer, idx: number) => (
                <div key={p.socketId} className="flex items-center justify-between p-2 rounded bg-white/5 font-semibold">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-amber-400">#{idx + 1}</span>
                    <span>{p.name}</span>
                  </div>
                  <span className="font-mono text-emerald-400 font-bold">{p.score} pts</span>
                </div>
              ))}
          </div>

          <Button
            onClick={onJoinGame}
            className="h-10 px-6 text-xs font-bold rounded-xl bg-[hsl(var(--accent))] text-white hover:bg-[hsl(var(--accent-hover))] cursor-pointer shadow-lg"
          >
            Play Again 🔄
          </Button>
        </div>
      )}

      {/* Live Players Footer Bar */}
      <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-[hsl(var(--accent))]" />
          <span>{gameSession.players.length} Players connected</span>
        </div>
        {gameSession.spectators.length > 0 && (
          <span className="text-[11px] text-gray-400 font-mono">
            {gameSession.spectators.length} Spectators watching
          </span>
        )}
      </div>

    </div>
  );
}
