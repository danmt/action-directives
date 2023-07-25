import { inject, Injectable } from '@angular/core';
import { Season } from '@heavy-duty/seasons-utils';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { switchMap } from 'rxjs';
import { SeasonApiService } from '../services';

interface ViewModel {
  seasons: Season[];
  error: unknown;
  isLoading: boolean;
}

const initialState: ViewModel = {
  seasons: [],
  error: null,
  isLoading: false,
};

@Injectable()
export class SeasonsStore extends ComponentStore<ViewModel> {
  private readonly _seasonApiService = inject(SeasonApiService);

  readonly seasons$ = this.select(({ seasons }) => seasons);
  readonly isLoading$ = this.select(({ isLoading }) => isLoading);
  readonly error$ = this.select(({ error }) => error);

  private readonly _loadSeasons = this.effect<void>(
    switchMap(() => {
      this.patchState({ isLoading: false });

      return this._seasonApiService.getSeasons().pipe(
        tapResponse(
          (seasons) => this.patchState({ seasons }),
          (error) => this.patchState({ error })
        )
      );
    })
  );

  constructor() {
    super(initialState);

    this._loadSeasons();
  }
}
