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
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { fromDocumentSnapshot, fromQuerySnapshot } from '@heavy-duty/blueprint';
import { SeasonAttribute, toSeason } from '@heavy-duty/seasons-utils';
import { map } from 'rxjs';

export interface CreateSeasonPayload {
  id: string;
  name: string;
  title: string;
  description: string;
}

export interface UpdateSeasonPayload {
  id: string;
  title: string;
  description: string;
  website: string;
  symbol: string;
  attributes: SeasonAttribute[];
}

export interface UpdateSeasonImagePayload {
  id: string;
  imageUrl: string;
}

export interface UpdateSeasonIsActivePayload {
  id: string;
  isActive: boolean;
}

export interface DeleteSeasonPayload {
  id: string;
}

export interface GetSeasonFilterById {
  id: string;
}

export interface GetSeasonFilterByFields {
  fields: {
    name?: string;
  };
}

export type GetSeasonFilter = GetSeasonFilterById | GetSeasonFilterByFields;

@Injectable({ providedIn: 'root' })
export class SeasonApiService {
  private readonly _firestore = inject(Firestore);

  async createSeason(payload: CreateSeasonPayload) {
    const seasonsRef = collection(this._firestore, `seasons`);

    await addDoc(seasonsRef, {
      name: payload.name,
      title: payload.title,
      description: payload.description,
      createdAt: serverTimestamp(),
      attributes: [],
      isActive: false,
    });
  }

  async updateSeason(payload: UpdateSeasonPayload) {
    const codingChallengeRef = doc(this._firestore, `seasons/${payload.id}`);

    await updateDoc(codingChallengeRef, {
      title: payload.title,
      description: payload.description,
      website: payload.website,
      symbol: payload.symbol,
      attributes: payload.attributes,
    });
  }

  async updateSeasonImage(payload: UpdateSeasonImagePayload) {
    const codingChallengeRef = doc(this._firestore, `seasons/${payload.id}`);

    await updateDoc(codingChallengeRef, {
      imageUrl: payload.imageUrl,
    });
  }

  async updateSeasonIsActive(payload: UpdateSeasonIsActivePayload) {
    const codingChallengeRef = doc(this._firestore, `seasons/${payload.id}`);

    await updateDoc(codingChallengeRef, {
      isActive: payload.isActive,
    });
  }

  async deleteSeason(payload: DeleteSeasonPayload) {
    const codingChallengeRef = doc(this._firestore, `seasons/${payload.id}`);

    await deleteDoc(codingChallengeRef);
  }

  getSeasons() {
    const seasonsRef = collection(this._firestore, `seasons`);

    return fromQuerySnapshot(seasonsRef).pipe(
      map((querySnapshot) =>
        querySnapshot.docs.map((docSnapshot) =>
          toSeason(docSnapshot.id, docSnapshot.data())
        )
      )
    );
  }

  getSeason(filters: GetSeasonFilter) {
    if ('id' in filters) {
      const codingChallengeRef = doc(this._firestore, `seasons/${filters.id}`);

      return fromDocumentSnapshot(codingChallengeRef).pipe(
        map((docSnapshot) => toSeason(docSnapshot.id, docSnapshot.data()))
      );
    } else {
      const seasonsRef = collection(this._firestore, `seasons`);

      const constraints = [];

      if (filters.fields.name !== undefined) {
        constraints.push(where('name', '==', filters.fields.name));
      }

      constraints.push(limit(1));

      return fromQuerySnapshot(query(seasonsRef, ...constraints)).pipe(
        map((querySnapshot) => {
          if (querySnapshot.empty) {
            return null;
          }

          return toSeason(
            querySnapshot.docs[0].id,
            querySnapshot.docs[0].data()
          );
        })
      );
    }
  }
}
