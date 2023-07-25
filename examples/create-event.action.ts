import { Directive, EventEmitter, inject, Output } from '@angular/core';
import { FirebaseError } from '@angular/fire/app';
import { EventApiService } from '@heavy-duty/events';
import { EventType } from '@heavy-duty/events-utils';
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
 * This directive gives the ability to create a new event.
 */
@Directive({
  selector: '[hdCreateEventAction]',
  standalone: true,
  exportAs: 'createEventAction',
})
export class CreateEventActionDirective extends ComponentStore<ViewModel> {
  private readonly _eventApiService = inject(EventApiService);

  readonly isRunning$ = this.select(({ isRunning }) => isRunning);
  readonly error$ = this.select(({ error }) => error);

  @Output() hdCreateEventStarts = new EventEmitter();
  @Output() hdCreateEventSuccess = new EventEmitter();
  @Output() hdCreateEventError = new EventEmitter<string>();
  @Output() hdCreateEventEnds = new EventEmitter();

  constructor() {
    super(initialState);
  }

  /**
   * This method creates a new event
   *
   * @param name Name of the event to create
   * @param title Title that will be assigned to the event
   * @param description Description that will be assigned to the event
   * @param type Type of the event to create
   */
  async run(name: string, title: string, description: string, type: EventType) {
    this.patchState({ isRunning: true });
    this.hdCreateEventStarts.emit();

    try {
      await this._eventApiService.createEvent({
        name,
        title,
        description,
        type,
      });
      this.hdCreateEventSuccess.emit();
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
            error = 'Unknown error creating event.';
        }
      } else {
        error = JSON.stringify(err);
      }

      this.patchState({ error });
      this.hdCreateEventError.emit(error);
    } finally {
      this.patchState({ isRunning: false });
      this.hdCreateEventEnds.emit();
    }
  }
}
