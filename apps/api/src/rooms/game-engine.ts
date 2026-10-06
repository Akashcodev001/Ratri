import { GameSession, GamePlayer, GameQuestion, GameId } from '@ratri/types';

export const TRIVIA_QUESTIONS: GameQuestion[] = [
  {
    id: 1,
    question: "Which movie won the Academy Award for Best Picture in 2024?",
    options: ["Oppenheimer", "Barbie", "Poor Things", "Killers of the Flower Moon"],
    correctIndex: 0,
    timeLimitSeconds: 15,
    category: "Cinema",
  },
  {
    id: 2,
    question: "Which iconic band released the album 'Abbey Road' in 1969?",
    options: ["The Rolling Stones", "The Beatles", "Pink Floyd", "Led Zeppelin"],
    correctIndex: 1,
    timeLimitSeconds: 15,
    category: "Music",
  },
  {
    id: 3,
    question: "What year was the first iPhone released by Steve Jobs?",
    options: ["2005", "2007", "2009", "2010"],
    correctIndex: 1,
    timeLimitSeconds: 15,
    category: "Tech",
  },
  {
    id: 4,
    question: "In gaming, what is the best-selling video game of all time?",
    options: ["Tetris", "Grand Theft Auto V", "Minecraft", "Super Mario Bros."],
    correctIndex: 2,
    timeLimitSeconds: 15,
    category: "Gaming",
  },
  {
    id: 5,
    question: "Which chemical element has the symbol 'Au' on the periodic table?",
    options: ["Silver", "Gold", "Copper", "Aluminum"],
    correctIndex: 1,
    timeLimitSeconds: 15,
    category: "Science",
  },
];

export const WORD_DASH_QUESTIONS: GameQuestion[] = [
  {
    id: 1,
    question: "Unscramble: S P O T I F Y (Music Streaming Platform)",
    options: ["Spotify", "Stopify", "Postify", "Topisky"],
    correctIndex: 0,
    timeLimitSeconds: 12,
    category: "Word Puzzle",
  },
  {
    id: 2,
    question: "Unscramble: N E T F L I X (Video Streaming Service)",
    options: ["Nextlif", "Netflix", "Flixnet", "Litfnex"],
    correctIndex: 1,
    timeLimitSeconds: 12,
    category: "Word Puzzle",
  },
  {
    id: 3,
    question: "Unscramble: C I N E M A (Movie Theater Venue)",
    options: ["Anemic", "Cinema", "Iceman", "Camine"],
    correctIndex: 1,
    timeLimitSeconds: 12,
    category: "Word Puzzle",
  },
  {
    id: 4,
    question: "Unscramble: D I S C O R D (Voice & Chat Platform)",
    options: ["Discord", "Corddis", "Discrod", "Docxrid"],
    correctIndex: 0,
    timeLimitSeconds: 12,
    category: "Word Puzzle",
  },
  {
    id: 5,
    question: "Unscramble: A V A T A R (Sci-Fi Movie Franchise)",
    options: ["Travaa", "Varata", "Avatar", "Tavara"],
    correctIndex: 2,
    timeLimitSeconds: 12,
    category: "Word Puzzle",
  },
];

export const EMOJI_RIDDLE_QUESTIONS: GameQuestion[] = [
  {
    id: 1,
    question: "Guess the Movie: 🚢 🧊 🥶 💔",
    options: ["Titanic", "The Perfect Storm", "Ice Age", "Frozen"],
    correctIndex: 0,
    timeLimitSeconds: 15,
    category: "Emoji Riddles",
    emojiCode: "🚢 🧊 🥶 💔",
  },
  {
    id: 2,
    question: "Guess the Movie: 🧙‍♂️ 💍 🌋 👁️",
    options: ["Harry Potter", "Lord of the Rings", "The Hobbit", "Narnia"],
    correctIndex: 1,
    timeLimitSeconds: 15,
    category: "Emoji Riddles",
    emojiCode: "🧙‍♂️ 💍 🌋 👁️",
  },
  {
    id: 3,
    question: "Guess the Movie: 🦇 🌃 🤡 🃏",
    options: ["Spider-Man", "Iron Man", "The Dark Knight", "Deadpool"],
    correctIndex: 2,
    timeLimitSeconds: 15,
    category: "Emoji Riddles",
    emojiCode: "🦇 🌃 🤡 🃏",
  },
  {
    id: 4,
    question: "Guess the Movie: 🦁 👑 🌅 🌍",
    options: ["Madagascar", "The Lion King", "Tarzan", "Jungle Book"],
    correctIndex: 1,
    timeLimitSeconds: 15,
    category: "Emoji Riddles",
    emojiCode: "🦁 👑 🌅 🌍",
  },
  {
    id: 5,
    question: "Guess the Movie: 🦖 🦕 🌴 🏃‍♂️",
    options: ["Jurassic Park", "King Kong", "Godzilla", "Jumanji"],
    correctIndex: 0,
    timeLimitSeconds: 15,
    category: "Emoji Riddles",
    emojiCode: "🦖 🦕 🌴 🏃‍♂️",
  },
];

export const MATH_BLITZ_QUESTIONS: GameQuestion[] = [
  {
    id: 1,
    question: "(15 × 4) - 18 = ?",
    options: ["38", "42", "44", "48"],
    correctIndex: 1,
    timeLimitSeconds: 10,
    category: "Math Speed",
  },
  {
    id: 2,
    question: "(120 ÷ 3) + 25 = ?",
    options: ["55", "60", "65", "70"],
    correctIndex: 2,
    timeLimitSeconds: 10,
    category: "Math Speed",
  },
  {
    id: 3,
    question: "8² - 24 = ?",
    options: ["36", "40", "44", "48"],
    correctIndex: 1,
    timeLimitSeconds: 10,
    category: "Math Speed",
  },
  {
    id: 4,
    question: "(9 × 7) + 37 = ?",
    options: ["90", "95", "100", "105"],
    correctIndex: 2,
    timeLimitSeconds: 10,
    category: "Math Speed",
  },
  {
    id: 5,
    question: "(300 ÷ 6) - 15 = ?",
    options: ["30", "35", "40", "45"],
    correctIndex: 1,
    timeLimitSeconds: 10,
    category: "Math Speed",
  },
];

export const MEMORY_MATRIX_QUESTIONS: GameQuestion[] = [
  {
    id: 1,
    question: "Memorize: 🔴 🔵 🟢 🟡 — What was the 3rd color?",
    options: ["Red 🔴", "Blue 🔵", "Green 🟢", "Yellow 🟡"],
    correctIndex: 2,
    timeLimitSeconds: 12,
    category: "Memory Matrix",
  },
  {
    id: 2,
    question: "Memorize: ⭐ 💎 🚀 👑 — What icon came after Rocket 🚀?",
    options: ["Star ⭐", "Diamond 💎", "Crown 👑", "Rocket 🚀"],
    correctIndex: 2,
    timeLimitSeconds: 12,
    category: "Memory Matrix",
  },
  {
    id: 3,
    question: "Memorize: 🐱 🐶 🦊 🐼 — Which animal was at the start?",
    options: ["Cat 🐱", "Dog 🐶", "Fox 🦊", "Panda 🐼"],
    correctIndex: 0,
    timeLimitSeconds: 12,
    category: "Memory Matrix",
  },
  {
    id: 4,
    question: "Memorize: 🍕 🍔 🌮 🍣 — What was the last food item?",
    options: ["Pizza 🍕", "Burger 🍔", "Taco 🌮", "Sushi 🍣"],
    correctIndex: 3,
    timeLimitSeconds: 12,
    category: "Memory Matrix",
  },
  {
    id: 5,
    question: "Memorize: 🔥 ⚡ ❄️ 🌈 — What was the 2nd element?",
    options: ["Fire 🔥", "Lightning ⚡", "Ice ❄️", "Rainbow 🌈"],
    correctIndex: 1,
    timeLimitSeconds: 12,
    category: "Memory Matrix",
  },
];

export class GameEngine {
  public static getQuestionsForGame(gameId: GameId): GameQuestion[] {
    switch (gameId) {
      case 'word-dash':
        return WORD_DASH_QUESTIONS;
      case 'emoji-riddle':
        return EMOJI_RIDDLE_QUESTIONS;
      case 'math-blitz':
        return MATH_BLITZ_QUESTIONS;
      case 'memory-matrix':
        return MEMORY_MATRIX_QUESTIONS;
      case 'trivia-clash':
      default:
        return TRIVIA_QUESTIONS;
    }
  }

  public static getGameTitle(gameId: GameId): string {
    switch (gameId) {
      case 'word-dash': return 'WORD DASH 🔤';
      case 'emoji-riddle': return 'EMOJI RIDDLE 🎬';
      case 'math-blitz': return 'MATH BLITZ ⚡';
      case 'memory-matrix': return 'MEMORY MATRIX 🧠';
      case 'trivia-clash': default: return 'TRIVIA CLASH 🎯';
    }
  }

  public static createSession(gameId: GameId, hostSocketId: string, hostName: string): GameSession {
    const questions = this.getQuestionsForGame(gameId);
    const title = this.getGameTitle(gameId);

    const hostPlayer: GamePlayer = {
      socketId: hostSocketId,
      name: hostName,
      score: 0,
      isReady: true,
    };

    return {
      gameId,
      title,
      sessionId: `game_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      status: 'LOBBY',
      players: [hostPlayer],
      spectators: [],
      maxPlayers: 8,
      minPlayers: 1,
      currentQuestionIndex: 0,
      totalQuestions: questions.length,
      currentQuestion: questions[0],
      timerSeconds: questions[0]?.timeLimitSeconds || 15,
    };
  }

  public static createTriviaSession(hostSocketId: string, hostName: string): GameSession {
    return this.createSession('trivia-clash', hostSocketId, hostName);
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

    const questions = this.getQuestionsForGame(session.gameId);
    const currentQ = questions[session.currentQuestionIndex];
    if (!currentQ) return { isCorrect: false, pointsAwarded: 0 };

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
    const questions = this.getQuestionsForGame(session.gameId);

    if (session.currentQuestionIndex < questions.length) {
      session.currentQuestion = questions[session.currentQuestionIndex];
      session.timerSeconds = session.currentQuestion.timeLimitSeconds;
      session.players.forEach(p => {
        delete p.lastAnswer;
        delete p.isCorrect;
      });
      return true;
    } else {
      session.status = 'FINISHED';
      delete session.currentQuestion;
      const sorted = [...session.players].sort((a, b) => b.score - a.score);
      session.winnerSocketId = sorted[0]?.socketId;
      return false;
    }
  }
}
