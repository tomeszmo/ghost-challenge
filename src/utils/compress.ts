import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from 'lz-string';
import type { PackedChallenge } from '../types/challenge';
import type { GhostEvent } from '../types/ghost';

type WireMode = 'TG' | 'PC' | 'MR';

interface Wire {
  i: string;      // challenge id
  k: string;      // stake
  t: number;      // createdAt
  s: number;      // score
  d: number;      // duration ms
  m: WireMode;    // game mode
  e: number[][];  // mode-specific events
}

const MODE_TO_WIRE: Record<string, WireMode> = {
  TAP_GRID:     'TG',
  PERFECT_CUT:  'PC',
  MATCH_RHYTHM: 'MR',
};
const WIRE_TO_MODE: Record<WireMode, string> = {
  TG: 'TAP_GRID',
  PC: 'PERFECT_CUT',
  MR: 'MATCH_RHYTHM',
};
const RATING_IDX: Record<string, number> = { PERFECT: 0, GREAT: 1, GOOD: 2, MISS: 3 };
const IDX_RATING = ['PERFECT', 'GREAT', 'GOOD', 'MISS'] as const;

export function pack(challenge: PackedChallenge): string {
  const mode = challenge.timeline.mode;
  const wm   = MODE_TO_WIRE[mode] ?? 'PC';
  const evts = challenge.timeline.events;

  let encoded: number[][];

  if (wm === 'TG') {
    // [deltaT, cellIndex] — hits only, cap 30
    const hits = evts.filter(e => e.action === 'TAP_HIT').slice(0, 30);
    let prev = 0;
    encoded = hits.map(e => {
      const delta = e.t - prev; prev = e.t;
      return [delta, e.cell ?? 0];
    });

  } else if (wm === 'PC') {
    // [deltaT, angle*1000, speed*1000] — hits only, cap 25
    const hits = evts.filter(e => e.action === 'PC_HIT').slice(0, 25);
    let prev = 0;
    encoded = hits.map(e => {
      const delta = e.t - prev; prev = e.t;
      return [delta, Math.round((e.angle ?? 0) * 1000), Math.round((e.speed ?? 1800) * 1000)];
    });

  } else {
    // MR: [deltaT, ratingIndex] — all taps, cap 25
    const taps = evts.filter(e => e.action === 'MR_TAP').slice(0, 25);
    let prev = 0;
    encoded = taps.map(e => {
      const delta = e.t - prev; prev = e.t;
      return [delta, RATING_IDX[e.rating ?? 'MISS'] ?? 3];
    });
  }

  const wire: Wire = {
    i: challenge.id,
    k: challenge.stake,
    t: challenge.createdAt,
    s: challenge.timeline.score,
    d: challenge.timeline.duration,
    m: wm,
    e: encoded,
  };

  return compressToEncodedURIComponent(JSON.stringify(wire));
}

export function unpack(raw: string): PackedChallenge | null {
  try {
    const json = decompressFromEncodedURIComponent(raw);
    if (!json) return null;
    const wire = JSON.parse(json) as Wire;

    // Handle legacy TG wire that has no 'm' field
    const wm: WireMode = wire.m ?? 'TG';
    const mode = (WIRE_TO_MODE[wm] ?? 'TAP_GRID') as PackedChallenge['timeline']['mode'];

    let events: GhostEvent[];

    if (wm === 'TG') {
      let acc = 0;
      events = [
        { t: 0,      action: 'GAME_START', x: 0, y: 0 },
        ...wire.e.map(([delta, cell]): GhostEvent => {
          acc += delta!;
          return { t: acc, action: 'TAP_HIT', x: 0, y: 0, cell };
        }),
        { t: wire.d, action: 'GAME_END',   x: 0, y: 0 },
      ];

    } else if (wm === 'PC') {
      let acc = 0;
      // Initial state: dir=1, speed=1.8 rad/s, then each hit alternates dir & has new speed
      let dir: 1 | -1 = -1; // first PC_HIT reverses to -1
      events = [
        { t: 0,      action: 'GAME_START', x: 0, y: 0 },
        ...wire.e.map(([delta, angleInt, speedInt]): GhostEvent => {
          acc += delta!;
          const ev: GhostEvent = {
            t:      acc,
            action: 'PC_HIT',
            x: 0, y: 0,
            angle: (angleInt ?? 0) / 1000,
            speed: (speedInt ?? 1800) / 1000,
          };
          dir = (dir * -1) as 1 | -1;
          return ev;
        }),
        { t: wire.d, action: 'GAME_END',   x: 0, y: 0 },
      ];

    } else {
      // MR
      let acc = 0;
      events = [
        { t: 0,      action: 'GAME_START', x: 0, y: 0 },
        ...wire.e.map(([delta, rIdx]): GhostEvent => {
          acc += delta!;
          return { t: acc, action: 'MR_TAP', x: 0, y: 0, rating: IDX_RATING[rIdx ?? 3] };
        }),
        { t: wire.d, action: 'GAME_END',   x: 0, y: 0 },
      ];
    }

    return {
      id:        wire.i,
      stake:     wire.k,
      createdAt: wire.t,
      timeline:  { v: 1, mode, duration: wire.d, score: wire.s, events },
    };
  } catch {
    return null;
  }
}

/** Build the receive URL for a packed challenge (used by QRService). */
export function buildReceiveUrl(packed: string): string {
  const base = window.location.origin + window.location.pathname;
  return `${base}#/receive?d=${packed}`;
}
