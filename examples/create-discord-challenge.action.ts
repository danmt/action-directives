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
 * This directive gives the ability to create a new discord challenge.
 */
@Directive({
  selector: '[hdCreateDiscordChallengeAction]',
  standalone: true,
  exportAs: 'createDiscordChallengeAction',
})
export class CreateDiscordChallengeActionDirective extends ComponentStore<ViewModel> {
  private readonly _discordChallengeApiService = inject(
    DiscordChallengeApiService
  );

  readonly isRunning$ = this.select(({ isRunning }) => isRunning);
  readonly error$ = this.select(({ error }) => error);

  @Output() hdCreateDiscordChallengeStarts = new EventEmitter();
  @Output() hdCreateDiscordChallengeSuccess = new EventEmitter();
  @Output() hdCreateDiscordChallengeError = new EventEmitter<string>();
  @Output() hdCreateDiscordChallengeEnds = new EventEmitter();

  constructor() {
    super(initialState);
  }

  /**
   * This method creates a new discord challenge
   *
   * @param challengeId Id of the source challenge for the discord challenge
   */
  async run(challengeId: string) {
    this.patchState({ isRunning: true });
    this.hdCreateDiscordChallengeStarts.emit();

    try {
      await this._discordChallengeApiService.createDiscordChallenge({
        challengeId,
      });
      this.hdCreateDiscordChallengeSuccess.emit();
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
      this.hdCreateDiscordChallengeError.emit(error);
    } finally {
      this.patchState({ isRunning: false });
      this.hdCreateDiscordChallengeEnds.emit();
    }
  }
}
