import { Directive, EventEmitter, inject, Output } from '@angular/core';
import { FirebaseError } from '@angular/fire/app';
import { CodingChallengeApiService } from '@heavy-duty/coding-challenges';
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
 * This directive gives the ability to delete a coding challenge.
 */
@Directive({
  selector: '[hdDeleteCodingChallengeAction]',
  standalone: true,
  exportAs: 'deleteCodingChallengeAction',
})
export class DeleteCodingChallengeActionDirective extends ComponentStore<ViewModel> {
  private readonly _challengeApiService = inject(CodingChallengeApiService);

  readonly isRunning$ = this.select(({ isRunning }) => isRunning);
  readonly error$ = this.select(({ error }) => error);

  @Output() hdDeleteCodingChallengeStarts = new EventEmitter();
  @Output() hdDeleteCodingChallengeEnds = new EventEmitter();
  @Output() hdDeleteCodingChallengeSuccess = new EventEmitter();
  @Output() hdDeleteCodingChallengeError = new EventEmitter<string>();

  constructor() {
    super(initialState);
  }

  /**
   * This method deletes a coding challenge
   *
   * @param id Id of the coding challenge that will be deleted
   */
  async run(id: string) {
    this.patchState({ isRunning: true });
    this.hdDeleteCodingChallengeStarts.emit();

    try {
      await this._challengeApiService.deleteCodingChallenge({
        id,
      });
      this.hdDeleteCodingChallengeSuccess.emit();
    } catch (err) {
      let error: string;

      if (typeof err === 'string') {
        error = err;
      } else if (err instanceof FirebaseError) {
        switch (err.code) {
          default:
            error = 'Unknown error deleting coding challenge.';
        }
      } else {
        error = JSON.stringify(err);
      }

      this.patchState({ error });
      this.hdDeleteCodingChallengeError.emit(error);
    } finally {
      this.patchState({ isRunning: false });
      this.hdDeleteCodingChallengeEnds.emit();
    }
  }
}
