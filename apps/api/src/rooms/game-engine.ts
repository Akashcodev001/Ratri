import { GameSession, GamePlayer, GameQuestion } from '@ratri/types';

export const TRIVIA_QUESTIONS: GameQuestion[] = [
  {
    id: 1,
    question: "Which movie won the Academy Award for Best Picture in 2024?",
    options: ["Oppenheimer", "Barbie", "Poor Things", "Killers of the Flower Moon"],
    correctIndex: 0,
    timeLimitSeconds: 15,
  },
  {
    id: 2,
    question: "Which iconic band released the album 'Abbey Road' in 1969?",
    options: ["The Rolling Stones", "The Beatles", "Pink Floyd", "Led Zeppelin"],
    correctIndex: 1,
    timeLimitSeconds: 15,
  },
  {
    id: 3,
    question: "What year was the first iPhone released by Steve Jobs?",
    options: ["2005", "2007", "2009", "2010"],
    correctIndex: 1,
    timeLimitSeconds: 15,
  },
  {
    id: 4,
    question: "In gaming, what is the best-selling video game of all time?",
    options: ["Tetris", "Grand Theft Auto V", "Minecraft", "Super Mario Bros."],
    correctIndex: 2,
    timeLimitSeconds: 15,
  },
  {
    id: 5,
    question: "Which chemical element has the symbol 'Au' on the periodic table?",
    options: ["Silver", "Gold", "Copper", "Aluminum"],
    correctIndex: 1,
    timeLimitSeconds: 15,
  },
];

export class GameEngine {
  public static createTriviaSession(hostSocketId: string, hostName: string): GameSession {
    const hostPlayer: GamePlayer = {
      socketId: hostSocketId,
      name: hostName,
      score: 0,
      isReady: true,
    };

    return {
      gameId: 'trivia-clash',
      sessionId: `game_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      status: 'LOBBY',
      players: [hostPlayer],
      spectators: [],
      maxPlayers: 6,
      minPlayers: 1,
      currentQuestionIndex: 0,
      currentQuestion: TRIVIA_QUESTIONS[0],
      timerSeconds: TRIVIA_QUESTIONS[0].timeLimitSeconds,
    };
  }

  public static addPlayer(session: GameSession, socketId: string, name: string): boolean {
    if (session.players.some(p => p.socketId === socketId)) return true;
    if (session.players.length < session.maxPlayers) {
      session.players.push({
        socketId,
        name,
        score: 0,
        isReady: true,
      });
      return true;
    } else {
      if (!session.spectators.includes(socketId)) {
        session.spectators.push(socketId);
      }
      return false;
    }
  }

  public static removePlayer(session: GameSession, socketId: string) {
    session.players = session.players.filter(p => p.socketId !== socketId);
    session.spectators = session.spectators.filter(sid => sid !== socketId);
  }

  public static processAnswer(
    session: GameSession,
    socketId: string,
    questionIndex: number,
    optionIndex: number
  ): { isCorrect: boolean; pointsAwarded: number } {
    if (session.status !== 'IN_PROGRESS') return { isCorrect: false, pointsAwarded: 0 };
    if (session.currentQuestionIndex !== questionIndex) return { isCorrect: false, pointsAwarded: 0 };

    const player = session.players.find(p => p.socketId === socketId);
    if (!player) return { isCorrect: false, pointsAwarded: 0 };

    const currentQ = TRIVIA_QUESTIONS[session.currentQuestionIndex];
    const isCorrect = optionIndex === currentQ.correctIndex;
    let pointsAwarded = 0;

    if (isCorrect) {
      const timeBonus = Math.max(10, session.timerSeconds * 10);
      pointsAwarded = 100 + timeBonus;
      player.score += pointsAwarded;
    }

    player.lastAnswer = currentQ.options[optionIndex];
    player.isCorrect = isCorrect;

    return { isCorrect, pointsAwarded };
  }

  public static advanceNextQuestion(session: GameSession): boolean {
    session.currentQuestionIndex += 1;
    if (session.currentQuestionIndex < TRIVIA_QUESTIONS.length) {
      session.currentQuestion = TRIVIA_QUESTIONS[session.currentQuestionIndex];
      session.timerSeconds = session.currentQuestion.timeLimitSeconds;
      // Reset player answer states
      session.players.forEach(p => {
        delete p.lastAnswer;
        delete p.isCorrect;
      });
      return true;
    } else {
      session.status = 'FINISHED';
      delete session.currentQuestion;
      // Determine winner
      const sorted = [...session.players].sort((a, b) => b.score - a.score);
      session.winnerSocketId = sorted[0]?.socketId;
      return false;
    }
  }
}
