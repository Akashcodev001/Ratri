import { useState } from "react";
import type { GameSession, GamePlayer } from "@ratri/types";
import { Gamepad2, Trophy, Clock, Play, Users, X, CheckCircle } from "lucide-react";
import { Button } from "./ui/button";

interface GameStageProps {
  gameSession?: GameSession;
  isHost: boolean;
  currentSocketId: string;
  onJoinGame: () => void;
  onStartGame: () => void;
  onSubmitAnswer: (questionIndex: number, optionIndex: number) => void;
  onExitGame: () => void;
}

export function GameStage({
  gameSession,
  isHost,
  currentSocketId,
  onJoinGame,
  onStartGame,
  onSubmitAnswer,
  onExitGame,
}: GameStageProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  if (!gameSession) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-b from-neutral-900 via-neutral-950 to-black text-white rounded-2xl border border-white/10 relative overflow-hidden">
        <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--accent))/0.2] border border-[hsl(var(--accent))] flex items-center justify-center mb-4 shadow-xl animate-bounce">
          <Gamepad2 className="w-8 h-8 text-[hsl(var(--accent))]" />
        </div>
        <h2 className="text-xl font-extrabold tracking-tight mb-2">Room Multiplayer Games</h2>
        <p className="text-xs text-gray-400 max-w-sm text-center mb-6 leading-relaxed">
          Play real-time group trivia, word races, and mini-games right inside the room while talking on voice & video!
        </p>
        <Button
          onClick={onJoinGame}
          className="px-6 h-11 text-xs font-bold rounded-xl bg-[hsl(var(--accent))] text-white hover:bg-[hsl(var(--accent-hover))] cursor-pointer shadow-lg"
        >
          Launch Trivia Clash Lobby 🎮
        </Button>
      </div>
    );
  }

  const isPlayerInGame = gameSession.players.some((p: GamePlayer) => p.socketId === currentSocketId);
  const currentQuestion = gameSession.currentQuestion;

  return (
    <div className="w-full h-full flex flex-col justify-between p-4 sm:p-6 bg-gradient-to-b from-neutral-900 via-neutral-950 to-black text-white rounded-2xl border border-white/15 relative overflow-hidden shadow-2xl">
      
      {/* Top Game Bar */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[hsl(var(--accent))] flex items-center justify-center font-bold text-white shadow-sm">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white tracking-wide">TRIVIA CLASH 🏆</h3>
            <span className="text-[10px] font-mono text-emerald-400">
              {gameSession.status === 'LOBBY' ? 'LOBBY WAITING' : gameSession.status === 'IN_PROGRESS' ? `QUESTION ${gameSession.currentQuestionIndex + 1} OF 5` : 'GAME FINISHED'}
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
        <div className="flex-1 flex flex-col items-center justify-center space-y-5 my-auto">
          <div className="text-center space-y-1">
            <h4 className="text-lg font-extrabold text-white">Group Game Lobby</h4>
            <p className="text-xs text-gray-400">Gather 2 to 6 friends for real-time trivia!</p>
          </div>

          {/* Players Grid */}
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-md my-2">
            {gameSession.players.map((p: GamePlayer) => (
              <div
                key={p.socketId}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 border border-white/15 text-xs font-semibold"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>{p.name} {p.socketId === currentSocketId ? '(You)' : ''}</span>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {!isPlayerInGame && (
              <Button
                onClick={onJoinGame}
                className="h-10 px-5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
              >
                Join Game Session
              </Button>
            )}

            {isHost && (
              <Button
                onClick={onStartGame}
                disabled={gameSession.players.length < 1}
                className="h-10 px-6 text-xs font-bold rounded-xl bg-[hsl(var(--accent))] text-white hover:bg-[hsl(var(--accent-hover))] cursor-pointer gap-2"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start Game Now</span>
              </Button>
            )}
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
              <span>Points per question: 100+</span>
            </div>

            {/* Countdown Bar */}
            <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 transition-all duration-1000 ease-linear"
                style={{ width: `${(gameSession.timerSeconds / currentQuestion.timeLimitSeconds) * 100}%` }}
              />
            </div>

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
            className="h-10 px-6 text-xs font-bold rounded-xl bg-[hsl(var(--accent))] text-white hover:bg-[hsl(var(--accent-hover))] cursor-pointer"
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
