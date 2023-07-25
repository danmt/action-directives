import { inject, Injectable } from '@angular/core';
import { DiscordEvent } from '@heavy-duty/events-utils';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { EMPTY, switchMap } from 'rxjs';
import { DiscordEventApiService, GetDiscordEventFilter } from '../services';

interface ViewModel {
  discordEvent: DiscordEvent | null;
  error: unknown;
  filters: GetDiscordEventFilter | null;
  isLoading: boolean;
}

const initialState: ViewModel = {
  discordEvent: null,
  error: null,
  filters: null,
  isLoading: false,
};

@Injectable()
export class DiscordEventStore extends ComponentStore<ViewModel> {
  private readonly _discordEventApiService = inject(DiscordEventApiService);

  readonly discordEvent$ = this.select(({ discordEvent }) => discordEvent);
  readonly filters$ = this.select(({ filters }) => filters);
  readonly isLoading$ = this.select(({ isLoading }) => isLoading);
  readonly error$ = this.select(({ error }) => error);

  readonly setFilters = this.updater<GetDiscordEventFilter | null>(
    (state, filters) => ({
      ...state,
      filters,
    })
  );

  private readonly _loadDiscordEvent =
    this.effect<GetDiscordEventFilter | null>(
      switchMap((filters) => {
        this.patchState({ discordEvent: null });

        if (filters === null) {
          return EMPTY;
        }

        this.patchState({ isLoading: true });

        return this._discordEventApiService.getDiscordEvent(filters).pipe(
          tapResponse(
            (discordEvent) =>
              this.patchState({ discordEvent, isLoading: false }),
            (error) => this.patchState({ error, isLoading: false })
          )
        );
      })
    );

  constructor() {
    super(initialState);

    this._loadDiscordEvent(this.filters$);
  }
}
