import { inject, Injectable } from '@angular/core';
import { Event } from '@heavy-duty/events-utils';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { switchMap } from 'rxjs';
import { EventApiService } from '../services';

interface ViewModel {
  events: Event[];
  error: unknown;
  isLoading: boolean;
}

const initialState: ViewModel = {
  events: [],
  error: null,
  isLoading: false,
};

@Injectable()
export class EventsStore extends ComponentStore<ViewModel> {
  private readonly _eventApiService = inject(EventApiService);

  readonly events$ = this.select(({ events }) => events);
  readonly isLoading$ = this.select(({ isLoading }) => isLoading);
  readonly error$ = this.select(({ error }) => error);

  private readonly _loadEvents = this.effect<void>(
    switchMap(() => {
      this.patchState({ isLoading: false });

      return this._eventApiService.getEvents().pipe(
        tapResponse(
          (events) => this.patchState({ events }),
          (error) => this.patchState({ error })
        )
      );
    })
  );

  constructor() {
    super(initialState);

    this._loadEvents();
  }
}
