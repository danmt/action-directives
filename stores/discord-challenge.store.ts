import { inject, Injectable } from '@angular/core';
import { DiscordChallenge } from '@heavy-duty/coding-challenges-utils';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { EMPTY, switchMap } from 'rxjs';
import {
  DiscordChallengeApiService,
  GetDiscordChallengeFilter,
} from '../services';

interface ViewModel {
  discordChallenge: DiscordChallenge | null;
  error: unknown;
  filters: GetDiscordChallengeFilter | null;
  isLoading: boolean;
}

const initialState: ViewModel = {
  discordChallenge: null,
  error: null,
  filters: null,
  isLoading: false,
};

@Injectable()
export class DiscordChallengeStore extends ComponentStore<ViewModel> {
  private readonly _discordChallengeApiService = inject(
    DiscordChallengeApiService
  );

  readonly discordChallenge$ = this.select(
    ({ discordChallenge }) => discordChallenge
  );
  readonly filters$ = this.select(({ filters }) => filters);
  readonly isLoading$ = this.select(({ isLoading }) => isLoading);
  readonly error$ = this.select(({ error }) => error);

  readonly setFilters = this.updater<GetDiscordChallengeFilter | null>(
    (state, filters) => ({
      ...state,
      filters,
    })
  );

  private readonly _loadDiscordChallenge =
    this.effect<GetDiscordChallengeFilter | null>(
      switchMap((filters) => {
        this.patchState({ discordChallenge: null });

        if (filters === null) {
          return EMPTY;
        }

        this.patchState({ isLoading: true });

        return this._discordChallengeApiService
          .getDiscordChallenge(filters)
          .pipe(
            tapResponse(
              (discordChallenge) =>
                this.patchState({ discordChallenge, isLoading: false }),
              (error) => this.patchState({ error, isLoading: false })
            )
          );
      })
    );

  constructor() {
    super(initialState);

    this._loadDiscordChallenge(this.filters$);
  }
}
