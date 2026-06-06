import type { ChallengeSession, ChallengeState } from '../types/challenge';
import type { GhostTimeline } from '../types/ghost';
import { StorageService } from './StorageService';

const SESSION_KEY = 'session';
const DNF_KEY = 'dnf_guard';

class SessionService {
  private session: ChallengeSession | null = null;

  create(id: string, stake: string): ChallengeSession {
    this.session = {
      id,
      stake,
      createdAt: Date.now(),
      state: 'CREATED',
    };
    this.persist();
    return this.session;
  }

  load(): ChallengeSession | null {
    if (!this.session) {
      this.session = StorageService.get<ChallengeSession>(SESSION_KEY);
    }
    return this.session;
  }

  setState(state: ChallengeState): void {
    if (!this.session) return;
    this.session.state = state;
    this.persist();
  }

  setTimeline(timeline: GhostTimeline): void {
    if (!this.session) return;
    this.session.timeline = timeline;
    this.persist();
  }

  setReceiverScore(score: number): void {
    if (!this.session) return;
    this.session.receiverScore = score;
    this.persist();
  }

  /** Written before game loop starts — survives a forced tab close */
  armDnfGuard(sessionId: string): void {
    StorageService.set(DNF_KEY, sessionId);
  }

  /** Removed when the game completes normally */
  disarmDnfGuard(): void {
    StorageService.remove(DNF_KEY);
  }

  /** Returns the session ID of a mid-game tab that was force-closed */
  getPendingDnf(): string | null {
    return StorageService.get<string>(DNF_KEY);
  }

  clear(): void {
    this.session = null;
    StorageService.remove(SESSION_KEY);
    StorageService.remove(DNF_KEY);
  }

  private persist(): void {
    if (this.session) StorageService.set(SESSION_KEY, this.session);
  }
}

export const sessionService = new SessionService();
