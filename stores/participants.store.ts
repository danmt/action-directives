import { inject, Injectable } from '@angular/core';
import { Participant } from '@heavy-duty/event-participants-utils';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { EMPTY, switchMap } from 'rxjs';
import { ParticipantApiService, ParticipantsFilter } from '../services';

interface ViewModel {
  filters: ParticipantsFilter | null;
  participants: Participant[];
  error: unknown;
  isLoading: boolean;
}

const initialState: ViewModel = {
  filters: null,
  participants: [],
  error: null,
  isLoading: false,
};

@Injectable()
export class ParticipantsStore extends ComponentStore<ViewModel> {
  private readonly _participantApiService = inject(ParticipantApiService);

  readonly filters$ = this.select(({ filters }) => filters);
  readonly isLoading$ = this.select(({ isLoading }) => isLoading);
  readonly error$ = this.select(({ error }) => error);
  readonly participants$ = this.select(({ participants }) => participants);

  readonly setFilters = this.updater<ParticipantsFilter | null>(
    (state, filters) => ({
      ...state,
      filters,
    })
  );

  private readonly _loadParticipants = this.effect<ParticipantsFilter | null>(
    switchMap((filters) => {
      if (filters === null) {
        this.patchState({ participants: [] });
        return EMPTY;
      }

      this.patchState({ isLoading: true });

      return this._participantApiService.getParticipants(filters).pipe(
        tapResponse(
          (participants) => this.patchState({ participants, isLoading: false }),
          (error) => this.patchState({ error, isLoading: false })
        )
      );
    })
  );

  constructor() {
    super(initialState);

    this._loadParticipants(this.filters$);
  }
}
