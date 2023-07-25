import { inject, Injectable } from '@angular/core';
import {
  doc,
  Firestore,
  serverTimestamp,
  setDoc,
  updateDoc,
} from '@angular/fire/firestore';
import { fromDocumentSnapshot } from '@heavy-duty/blueprint';
import { toDiscordEvent } from '@heavy-duty/events-utils';
import { map } from 'rxjs';

export interface CreateDiscordEventPayload {
  eventId: string;
}

export interface CancelDiscordEventPayload {
  eventId: string;
}

export interface StartDiscordEventPayload {
  eventId: string;
}

export interface EndDiscordEventPayload {
  eventId: string;
}

export interface GetDiscordEventFilter {
  eventId: string;
}

@Injectable({ providedIn: 'root' })
export class DiscordEventApiService {
  private readonly _firestore = inject(Firestore);

  async createDiscordEvent(payload: CreateDiscordEventPayload) {
    const discordEventRef = doc(
      this._firestore,
      `discord-events/${payload.eventId}`
    );

    await setDoc(discordEventRef, {
      status: 'creating',
      createdAt: serverTimestamp(),
    });
  }

  async cancelDiscordEvent(payload: CancelDiscordEventPayload) {
    const discordEventRef = doc(
      this._firestore,
      `discord-events/${payload.eventId}`
    );

    await updateDoc(discordEventRef, {
      status: 'cancelling',
    });
  }

  async startDiscordEvent(payload: StartDiscordEventPayload) {
    const discordEventRef = doc(
      this._firestore,
      `discord-events/${payload.eventId}`
    );

    await updateDoc(discordEventRef, {
      status: 'starting',
    });
  }

  async endDiscordEvent(payload: EndDiscordEventPayload) {
    const discordEventRef = doc(
      this._firestore,
      `discord-events/${payload.eventId}`
    );

    await updateDoc(discordEventRef, {
      status: 'ending',
    });
  }

  getDiscordEvent(filters: GetDiscordEventFilter) {
    const discordEventRef = doc(
      this._firestore,
      `discord-events/${filters.eventId}`
    );

    return fromDocumentSnapshot(discordEventRef).pipe(
      map((docSnapshot) => {
        if (!docSnapshot.exists()) {
          return null;
        }

        return toDiscordEvent(docSnapshot.id, docSnapshot.data());
      })
    );
  }
}
