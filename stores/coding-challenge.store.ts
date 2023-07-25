import { inject, Injectable } from '@angular/core';
import { CodingChallenge } from '@heavy-duty/coding-challenges-utils';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { EMPTY, switchMap } from 'rxjs';
import {
  CodingChallengeApiService,
  GetCodingChallengeFilter,
} from '../services';

interface ViewModel {
  codingChallenge: CodingChallenge | null;
  error: unknown;
  filters: GetCodingChallengeFilter | null;
  isLoading: boolean;
}

const initialState: ViewModel = {
  codingChallenge: null,
  error: null,
  filters: null,
  isLoading: false,
};

@Injectable()
export class CodingChallengeStore extends ComponentStore<ViewModel> {
  private readonly _codingChallengeApiService = inject(
    CodingChallengeApiService
  );

  readonly codingChallenge$ = this.select(
    ({ codingChallenge }) => codingChallenge
  );
  readonly filters$ = this.select(({ filters }) => filters);
  readonly isLoading$ = this.select(({ isLoading }) => isLoading);
  readonly error$ = this.select(({ error }) => error);

  readonly setFilters = this.updater<GetCodingChallengeFilter | null>(
    (state, filters) => ({
      ...state,
      filters,
    })
  );

  private readonly _loadCodingChallenge =
    this.effect<GetCodingChallengeFilter | null>(
      switchMap((filters) => {
        if (filters === null) {
          this.patchState({ codingChallenge: null });
          return EMPTY;
        }

        this.patchState({ isLoading: true });

        return this._codingChallengeApiService.getCodingChallenge(filters).pipe(
          tapResponse(
            (codingChallenge) =>
              this.patchState({ codingChallenge, isLoading: false }),
            (error) => this.patchState({ error, isLoading: false })
          )
        );
      })
    );

  constructor() {
    super(initialState);

    this._loadCodingChallenge(this.filters$);
  }
}
