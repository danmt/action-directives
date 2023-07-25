import { inject, Injectable } from '@angular/core';
import { Season } from '@heavy-duty/seasons-utils';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { EMPTY, switchMap } from 'rxjs';
import { GetSeasonFilter, SeasonApiService } from '../services';

interface ViewModel {
  season: Season | null;
  error: unknown;
  filters: GetSeasonFilter | null;
  isLoading: boolean;
}

const initialState: ViewModel = {
  season: null,
  error: null,
  filters: null,
  isLoading: false,
};

@Injectable()
export class SeasonStore extends ComponentStore<ViewModel> {
  private readonly _seasonApiService = inject(SeasonApiService);

  readonly season$ = this.select(({ season }) => season);
  readonly filters$ = this.select(({ filters }) => filters);
  readonly isLoading$ = this.select(({ isLoading }) => isLoading);
  readonly error$ = this.select(({ error }) => error);

  readonly setFilters = this.updater<GetSeasonFilter | null>(
    (state, filters) => ({
      ...state,
      filters,
    })
  );

  private readonly _loadSeason = this.effect<GetSeasonFilter | null>(
    switchMap((filters) => {
      if (filters === null) {
        this.patchState({ season: null });
        return EMPTY;
      }

      this.patchState({ isLoading: true });

      return this._seasonApiService.getSeason(filters).pipe(
        tapResponse(
          (season) => this.patchState({ season, isLoading: false }),
          (error) => this.patchState({ error, isLoading: false })
        )
      );
    })
  );

  constructor() {
    super(initialState);

    this._loadSeason(this.filters$);
  }
}
