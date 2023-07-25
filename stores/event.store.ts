import { inject, Injectable } from '@angular/core';
import { Event } from '@heavy-duty/events-utils';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { EMPTY, switchMap } from 'rxjs';
import { EventApiService, GetEventFilter } from '../services';

interface ViewModel {
  event: Event | null;
  error: unknown;
  filters: GetEventFilter | null;
  isLoading: boolean;
}

const initialState: ViewModel = {
  event: null,
  error: null,
  filters: null,
  isLoading: false,
};

@Injectable()
export class EventStore extends ComponentStore<ViewModel> {
  private readonly _eventApiService = inject(EventApiService);

  readonly event$ = this.select(({ event }) => event);
  readonly filters$ = this.select(({ filters }) => filters);
  readonly isLoading$ = this.select(({ isLoading }) => isLoading);
  readonly error$ = this.select(({ error }) => error);

  readonly setFilters = this.updater<GetEventFilter | null>(
    (state, filters) => ({
      ...state,
      filters,
    })
  );

  private readonly _loadEvent = this.effect<GetEventFilter | null>(
    switchMap((filters) => {
      this.patchState({ event: null });

      if (filters === null) {
        return EMPTY;
      }

      this.patchState({ isLoading: true });

      return this._eventApiService.getEvent(filters).pipe(
        tapResponse(
          (event) => this.patchState({ event, isLoading: false }),
          (error) => this.patchState({ error, isLoading: false })
        )
      );
    })
  );

  constructor() {
    super(initialState);

    this._loadEvent(this.filters$);
  }
}
