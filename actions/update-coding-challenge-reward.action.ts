import { Directive, EventEmitter, inject, Output } from '@angular/core';
import { FirebaseError } from '@angular/fire/app';
import { CodingChallengeRewardApiService } from '@heavy-duty/coding-challenge-rewards';
import { SeasonAttribute } from '@heavy-duty/seasons-utils';
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
 * This directive gives the ability to update a rewards's data.
 */
@Directive({
  selector: '[hdUpdateCodingChallengeRewardAction]',
  standalone: true,
  exportAs: 'updateCodingChallengeRewardAction',
})
export class UpdateCodingChallengeRewardActionDirective extends ComponentStore<ViewModel> {
  private readonly _codingChallengeRewardApiService = inject(CodingChallengeRewardApiService);

  readonly isRunning$ = this.select(({ isRunning }) => isRunning);
  readonly error$ = this.select(({ error }) => error);

  @Output() hdUpdateCodingChallengeRewardStarts = new EventEmitter();
  @Output() hdUpdateCodingChallengeRewardEnds = new EventEmitter();
  @Output() hdUpdateCodingChallengeRewardSuccess = new EventEmitter();
  @Output() hdUpdateCodingChallengeRewardError = new EventEmitter<string>();

  constructor() {
    super(initialState);
  }

  /**
   * This method updates a reward
   *
   * @param id Id of the reward to update
   * @param title Title that will be assigned to the reward
   * @param description Description that will be assigned to the reward
   * @param website Website that will be assigned to the reward
   * @param symbol Symbol that will be assigned to the reward
   * @param attributes Attributes that will be assigned to the reward
   */
  async run(
    id: string,
    title: string,
    description: string,
    website: string,
    symbol: string,
    attributes: SeasonAttribute[]
  ) {
    this.patchState({ isRunning: true });
    this.hdUpdateCodingChallengeRewardStarts.emit();

    try {
      await this._codingChallengeRewardApiService.updateCodingChallengeReward({
        id,
        title,
        description,
        website,
        symbol,
        attributes,
      });
      this.hdUpdateCodingChallengeRewardSuccess.emit();
    } catch (err) {
      let error: string;

      if (typeof err === 'string') {
        error = err;
      } else if (err instanceof FirebaseError) {
        switch (err.code) {
          default:
            error = 'Unknown error updating reward.';
        }
      } else {
        error = JSON.stringify(err);
      }

      this.patchState({ error });
      this.hdUpdateCodingChallengeRewardError.emit(error);
    } finally {
      this.patchState({ isRunning: false });
      this.hdUpdateCodingChallengeRewardEnds.emit();
    }
  }
}
