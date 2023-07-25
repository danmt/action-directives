import { Directive, EventEmitter, inject, Output } from '@angular/core';
import { FirebaseError } from '@angular/fire/app';
import { EventApiService } from '@heavy-duty/events';
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
 * This directive gives the ability to update a event's data.
 */
@Directive({
  selector: '[hdUpdateEventInfoAction]',
  standalone: true,
  exportAs: 'updateEventInfoAction',
})
export class UpdateEventInfoActionDirective extends ComponentStore<ViewModel> {
  private readonly _eventApiService = inject(EventApiService);

  readonly isRunning$ = this.select(({ isRunning }) => isRunning);
  readonly error$ = this.select(({ error }) => error);

  @Output() hdUpdateEventInfoStarts = new EventEmitter();
  @Output() hdUpdateEventInfoSuccess = new EventEmitter();
  @Output() hdUpdateEventInfoError = new EventEmitter<string>();
  @Output() hdUpdateEventInfoEnds = new EventEmitter();

  constructor() {
    super(initialState);
  }

  /**
   * This method updates a event
   *
   * @param eventId Id of the event to update
   * @param title Title that will be assigned to the event
   * @param description Description that will be assigned to the event
   * @param location Location that will be assigned to the event
   * @param isDiscordEvent Whether the event is a discord event
   * @param tags Tags that will be assigned to the event
   * @param startDate Start date of the event
   * @param endDate End date of the event
   */
  async run(
    eventId: string,
    title: string,
    description: string,
    location: string | null,
    isDiscordEvent: boolean,
    tags: string,
    startDate: Date,
    endDate: Date
  ) {
    this.patchState({ isRunning: true });
    this.hdUpdateEventInfoStarts.emit();

    try {
      await this._eventApiService.updateEventInfo({
        eventId,
        title,
        description,
        location,
        isDiscordEvent,
        tags,
        startDate,
        endDate,
      });
      this.hdUpdateEventInfoSuccess.emit();
    } catch (err) {
      let error: string;

      if (typeof err === 'string') {
        error = err;
      } else if (err instanceof FirebaseError) {
        switch (err.code) {
          case 'permission-denied':
            error = 'Permission denied.';
            break;
          default:
            error = 'Unknown error updating event info.';
        }
      } else {
        error = JSON.stringify(err);
      }

      this.patchState({ error });
      this.hdUpdateEventInfoError.emit(error);
    } finally {
      this.patchState({ isRunning: false });
      this.hdUpdateEventInfoEnds.emit();
    }
  }
}
