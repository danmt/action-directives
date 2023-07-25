import { Directive, EventEmitter, inject, Output } from '@angular/core';
import { FirebaseError } from '@angular/fire/app';
import { CodingChallengeApiService } from '@heavy-duty/coding-challenges';
import { CodingChallengeDifficulty } from '@heavy-duty/coding-challenges-utils';
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
 * This directive gives the ability to update a coding challenge's data.
 */
@Directive({
  selector: '[hdUpdateCodingChallengeAction]',
  standalone: true,
  exportAs: 'updateCodingChallengeAction',
})
export class UpdateCodingChallengeActionDirective extends ComponentStore<ViewModel> {
  private readonly _codingChallengeApiService = inject(
    CodingChallengeApiService
  );

  readonly isRunning$ = this.select(({ isRunning }) => isRunning);
  readonly error$ = this.select(({ error }) => error);

  @Output() hdUpdateCodingChallengeStarts = new EventEmitter();
  @Output() hdUpdateCodingChallengeEnds = new EventEmitter();
  @Output() hdUpdateCodingChallengeSuccess = new EventEmitter();
  @Output() hdUpdateCodingChallengeError = new EventEmitter<string>();

  constructor() {
    super(initialState);
  }

  /**
   * This method updates a coding challenge
   *
   * @param id Id of the coding challenge to update
   * @param title Title that will be assigned to the coding challenge
   * @param description Description that will be assigned to the coding challenge
   * @param difficulty Difficulty of the coding challenge
   * @param tags Tags of the coding challenge for searching purposes
   * @param startDate Start date of the coding challenge
   * @param endDate End date of the coding challenge
   */
  async run(
    id: string,
    title: string,
    description: string,
    difficulty: CodingChallengeDifficulty,
    tags: string,
    startDate: Date,
    endDate: Date
  ) {
    this.patchState({ isRunning: true });
    this.hdUpdateCodingChallengeStarts.emit();

    try {
      await this._codingChallengeApiService.updateCodingChallenge({
        id,
        title,
        description,
        difficulty,
        tags,
        startDate,
        endDate,
      });
      this.hdUpdateCodingChallengeSuccess.emit();
    } catch (err) {
      let error: string;

      if (typeof err === 'string') {
        error = err;
      } else if (err instanceof FirebaseError) {
        switch (err.code) {
          default:
            error = 'Unknown error updating coding challenge.';
        }
      } else {
        error = JSON.stringify(err);
      }

      this.patchState({ error });
      this.hdUpdateCodingChallengeError.emit(error);
    } finally {
      this.patchState({ isRunning: false });
      this.hdUpdateCodingChallengeEnds.emit();
    }
  }
}
