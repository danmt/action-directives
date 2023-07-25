import { inject, Injectable } from '@angular/core';
import { CodingChallenge } from '@heavy-duty/coding-challenges-utils';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { EMPTY, switchMap } from 'rxjs';
import {
  CodingChallengeApiService,
  GetCodingChallengesFilter,
} from '../services';

interface ViewModel {
  filters: GetCodingChallengesFilter | null;
  codingChallenges: CodingChallenge[];
  error: unknown;
  isLoading: boolean;
}

const initialState: ViewModel = {
  filters: null,
  codingChallenges: [],
  error: null,
  isLoading: false,
};

@Injectable()
export class CodingChallengesStore extends ComponentStore<ViewModel> {
  private readonly _codingChallengeApiService = inject(
    CodingChallengeApiService
  );

  readonly filters$ = this.select(({ filters }) => filters);
  readonly codingChallenges$ = this.select(
    ({ codingChallenges }) => codingChallenges
  );
  readonly isLoading$ = this.select(({ isLoading }) => isLoading);
  readonly error$ = this.select(({ error }) => error);

  readonly setFilters = this.updater<GetCodingChallengesFilter | null>(
    (state, filters) => ({
      ...state,
      filters,
    })
  );

  private readonly _loadCodingChallenges =
    this.effect<GetCodingChallengesFilter | null>(
      switchMap((filters) => {
        if (filters === null) {
          this.patchState({ codingChallenges: [] });
          return EMPTY;
        }

        this.patchState({ isLoading: false });

        return this._codingChallengeApiService
          .getCodingChallenges(filters)
          .pipe(
            tapResponse(
              (codingChallenges) => this.patchState({ codingChallenges }),
              (error) => this.patchState({ error })
            )
          );
      })
    );

  constructor() {
    super(initialState);

    this._loadCodingChallenges(this.filters$);
  }
}
