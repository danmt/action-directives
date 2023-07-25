import { Directive, EventEmitter, inject, Output } from '@angular/core';
import { FirebaseError } from '@angular/fire/app';
import { DiscordChallengeApiService } from '@heavy-duty/coding-challenges';
import { ComponentStore } from '@ngrx/component-store';

interface ViewModel {
  isRunning: boolean;
  error: string | null;
}

const initialState: ViewModel = {
  isRunning: false,
  error: null,
};

/**
 * This directive gives the ability to stop a new discord challenge.
 */
@Directive({
  selector: '[hdStopDiscordChallengeAction]',
  standalone: true,
  exportAs: 'stopDiscordChallengeAction',
})
export class StopDiscordChallengeActionDirective extends ComponentStore<ViewModel> {
  private readonly _discordChallengeApiService = inject(
    DiscordChallengeApiService
  );

  readonly isRunning$ = this.select(({ isRunning }) => isRunning);
  readonly error$ = this.select(({ error }) => error);

  @Output() hdStopDiscordChallengeStarts = new EventEmitter();
  @Output() hdStopDiscordChallengeSuccess = new EventEmitter();
  @Output() hdStopDiscordChallengeError = new EventEmitter<string>();
  @Output() hdStopDiscordChallengeEnds = new EventEmitter();

  constructor() {
    super(initialState);
  }

  /**
   * This method stops a new discord challenge
   *
   * @param challengeId Id of the source challenge for the discord challenge
   */
  async run(challengeId: string) {
    this.patchState({ isRunning: true });
    this.hdStopDiscordChallengeStarts.emit();

    try {
      await this._discordChallengeApiService.stopDiscordChallenge({
        challengeId,
      });
      this.hdStopDiscordChallengeSuccess.emit();
    } catch (err) {
      let error: string;

      if (typeof err === 'string') {
        error = err;
      } else if (err instanceof FirebaseError) {
        switch (err.code) {
          case 'permission-denied':
            error = 'Permission denied.';
            break;
          default:
            error = 'Unknown error creating discord challenge.';
        }
      } else {
        error = JSON.stringify(err);
      }

      this.patchState({ error });
      this.hdStopDiscordChallengeError.emit(error);
    } finally {
      this.patchState({ isRunning: false });
      this.hdStopDiscordChallengeEnds.emit();
    }
  }
}
