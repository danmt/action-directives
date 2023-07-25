import { inject, Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  Firestore,
  limit,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { fromDocumentSnapshot, fromQuerySnapshot } from '@heavy-duty/blueprint';
import { EventType, toEvent } from '@heavy-duty/events-utils';
import { map } from 'rxjs';

export interface CreateEventPayload {
  name: string;
  title: string;
  description: string;
  type: EventType;
}

export interface UpdateEventInfoPayload {
  eventId: string;
  title: string;
  description: string;
  location: string | null;
  isDiscordEvent: boolean;
  tags: string;
  startDate: Date;
  endDate: Date;
}

export interface UpdateEventAdvancedPayload {
  eventId: string;
  joinCode: string | null;
}

export interface DeleteEventPayload {
  eventId: string;
}

export interface UpdateImagePayload {
  eventId: string;
  imageUrl: string;
}

export interface GetEventFilterById {
  eventId: string;
}

export interface GetEventFilterByFields {
  fields: {
    name?: string;
  };
}

export type GetEventFilter = GetEventFilterById | GetEventFilterByFields;

@Injectable({ providedIn: 'root' })
export class EventApiService {
  private readonly _firestore = inject(Firestore);

  async createEvent(payload: CreateEventPayload) {
    const eventsRef = collection(this._firestore, `events`);

    await addDoc(eventsRef, {
      title: payload.title,
      description: payload.description,
      name: payload.name,
      type: payload.type,
      isDiscordEventLinked: false,
      createdAt: serverTimestamp(),
    });
  }

  async updateEventInfo(payload: UpdateEventInfoPayload) {
    const eventRef = doc(this._firestore, `events/${payload.eventId}`);

    await updateDoc(eventRef, {
      title: payload.title,
      description: payload.description,
      info: {
        tags: payload.tags,
        startDate: Timestamp.fromDate(payload.startDate),
        endDate: Timestamp.fromDate(payload.endDate),
        location: payload.location,
        isDiscordEvent: payload.isDiscordEvent,
      },
    });
  }

  async updateEventAdvanced(payload: UpdateEventAdvancedPayload) {
    const eventRef = doc(this._firestore, `events/${payload.eventId}`);

    await updateDoc(eventRef, {
      advanced: {
        joinCode: payload.joinCode,
      },
    });
  }

  async deleteEvent(payload: DeleteEventPayload) {
    const eventRef = doc(this._firestore, `events/${payload.eventId}`);

    await deleteDoc(eventRef);
  }

  async updateImage(payload: UpdateImagePayload) {
    const eventRef = doc(this._firestore, `events/${payload.eventId}`);

    await updateDoc(eventRef, {
      imageUrl: payload.imageUrl,
    });
  }

  getEvents() {
    const eventsCollection = collection(this._firestore, `events`);

    return fromQuerySnapshot(eventsCollection).pipe(
      map((querySnapshot) =>
        querySnapshot.docs.map((doc) => toEvent(doc.id, doc.data()))
      )
    );
  }

  getEvent(filters: GetEventFilter) {
    if ('eventId' in filters) {
      const eventRef = doc(this._firestore, `events/${filters.eventId}`);

      return fromDocumentSnapshot(eventRef).pipe(
        map((docSnapshot) => toEvent(filters.eventId, docSnapshot))
      );
    } else {
      const eventsRef = collection(this._firestore, `events`);

      const constraints = [];

      if (filters.fields.name !== undefined) {
        constraints.push(where('name', '==', filters.fields.name));
      }

      constraints.push(limit(1));

      return fromQuerySnapshot(query(eventsRef, ...constraints)).pipe(
        map((querySnapshot) => {
          if (querySnapshot.empty) {
            return null;
          }

          return toEvent(
            querySnapshot.docs[0].id,
            querySnapshot.docs[0].data()
          );
        })
      );
    }
  }
}
