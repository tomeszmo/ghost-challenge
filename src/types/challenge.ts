import type { GhostTimeline } from './ghost';

export type ChallengeState =
  | 'CREATED'   // stake locked, game not yet started
  | 'PLAYING'   // sender mid-game (DNF window active)
  | 'DNF'       // sender quit or closed tab — auto-forfeit
  | 'SEALED'    // game finished, QR generated, awaiting receiver
  | 'OPENED'    // receiver scanned the QR
  | 'RESOLVED'; // receiver completed their one attempt

export interface ChallengeSession {
  id: string;
  /** Bet text — max 60 chars */
  stake: string;
  createdAt: number;
  state: ChallengeState;
  timeline?: GhostTimeline;
  receiverScore?: number;
}

/** Minimal payload encoded into the QR code URL */
export interface PackedChallenge {
  id: string;
  stake: string;
  createdAt: number;
  timeline: GhostTimeline;
}
