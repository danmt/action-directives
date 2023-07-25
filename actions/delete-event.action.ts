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
 * This directive gives the ability to delete a event.
 */
@Directive({
  selector: '[hdDeleteEventAction]',
  standalone: true,
  exportAs: 'deleteEventAction',
})
export class DeleteEventActionDirective extends ComponentStore<ViewModel> {
  private readonly _eventApiService = inject(EventApiService);

  readonly isRunning$ = this.select(({ isRunning }) => isRunning);
  readonly error$ = this.select(({ error }) => error);

  @Output() hdDeleteEventStarts = new EventEmitter();
  @Output() hdDeleteEventSuccess = new EventEmitter();
  @Output() hdDeleteEventError = new EventEmitter<string>();
  @Output() hdDeleteEventEnds = new EventEmitter();

  constructor() {
    super(initialState);
  }

  /**
   * This method deletes a event
   *
   * @param eventId Id of the event that will be deleted
   */
  async run(eventId: string) {
    this.patchState({ isRunning: true });
    this.hdDeleteEventStarts.emit();

    try {
      await this._eventApiService.deleteEvent({
        eventId,
      });
      this.hdDeleteEventSuccess.emit();
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
            error = 'Unknown error deleting event.';
        }
      } else {
        error = JSON.stringify(err);
      }

      this.patchState({ error });
      this.hdDeleteEventError.emit(error);
    } finally {
      this.patchState({ isRunning: false });
      this.hdDeleteEventEnds.emit();
    }
  }
}
