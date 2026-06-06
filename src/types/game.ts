export type GameMode = 'TAP_GRID' | 'PERFECT_CUT' | 'MATCH_RHYTHM';

export const GAME_DURATION: Record<GameMode, number> = {
  TAP_GRID:     30_000,
  PERFECT_CUT:  25_000,
  MATCH_RHYTHM: 25_000,
};

export interface GameResult {
  score: number;
  duration: number;
  completedAt: number;
}
