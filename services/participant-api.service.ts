import { inject, Injectable } from '@angular/core';
import { collection, Firestore, query, where } from '@angular/fire/firestore';
import { fromQuerySnapshot } from '@heavy-duty/blueprint';
import {
  Participant,
  toParticipant,
} from '@heavy-duty/event-participants-utils';
import { map, Observable } from 'rxjs';

export interface ParticipantsFilterByEvent {
  eventId: string;
}

export interface ParticipantsFilterByUser {
  userId: string;
}

export type ParticipantsFilter =
  | ParticipantsFilterByEvent
  | ParticipantsFilterByUser;

export interface ParticipatingEventsFilterByUser {
  userId: string;
}

export type ParticipatingEventsFilter = ParticipatingEventsFilterByUser;

@Injectable({ providedIn: 'root' })
export class ParticipantApiService {
  private readonly _firestore = inject(Firestore);

  getParticipants(filters: ParticipantsFilter): Observable<Participant[]> {
    const eventParticipantsRef = collection(
      this._firestore,
      `event-participants`
    );

    const constraints = [];

    if ('userId' in filters) {
      constraints.push(where('userId', '==', filters.userId));
    }

    if ('eventId' in filters) {
      constraints.push(where('eventId', '==', filters.eventId));
    }

    return fromQuerySnapshot(query(eventParticipantsRef, ...constraints)).pipe(
      map((querySnapshot) => {
        if (querySnapshot.empty) {
          return [];
        }

        return querySnapshot.docs.map((docSnapshot) =>
          toParticipant(docSnapshot.id, docSnapshot.data())
        );
      })
    );
  }
}
