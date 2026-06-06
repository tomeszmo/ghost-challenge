import type { GameMode } from './game';

export type ActionType =
  | 'TAP_HIT'    // TapGrid: hit an active cell
  | 'TAP_MISS'   // TapGrid: tapped wrong cell
  | 'PC_HIT'     // PerfectCut: pointer was inside zone
  | 'PC_MISS'    // PerfectCut: pointer was outside zone (game ends)
  | 'MR_TAP'     // MatchRhythm: player tapped (rated)
  | 'GAME_START'
  | 'GAME_END';

export interface GhostEvent {
  t: number;
  action: ActionType;
  x: number;
  y: number;
  // TapGrid
  cell?: number;
  // PerfectCut
  angle?: number;   // pointer angle in radians at tap
  speed?: number;   // new rotation speed after hit (rad/s)
  hits?: number;    // running hit count
  // MatchRhythm
  delta?: number;   // ring accuracy (0 = perfect overlap)
  rating?: 'PERFECT' | 'GREAT' | 'GOOD' | 'MISS';
}

export interface GhostTimeline {
  v: 1;
  mode: GameMode;
  duration: number;
  score: number;
  events: GhostEvent[];
}
