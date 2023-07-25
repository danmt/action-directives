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
import {
  CodingChallengeDifficulty,
  CodingChallengeStatus,
  toCodingChallenge,
} from '@heavy-duty/coding-challenges-utils';
import { map } from 'rxjs';

export interface CreateCodingChallengePayload {
  id: string;
  name: string;
  title: string;
  description: string;
}

export interface UpdateCodingChallengePayload {
  id: string;
  title: string;
  description: string;
  difficulty: CodingChallengeDifficulty;
  tags: string;
  startDate: Date;
  endDate: Date;
}

export interface UpdateCodingChallengeBodyPayload {
  id: string;
  body: string;
}

export interface UpdateCodingChallengeImagePayload {
  id: string;
  imageUrl: string;
}

export interface DeleteCodingChallengePayload {
  id: string;
}

export interface GetCodingChallengesFilterByFields {
  fields: {
    status?: CodingChallengeStatus;
  };
}

export type GetCodingChallengesFilter = GetCodingChallengesFilterByFields;

export interface GetCodingChallengeFilterById {
  id: string;
}

export interface GetCodingChallengeFilterByFields {
  fields: {
    name?: string;
    status?: CodingChallengeStatus;
  };
}

export type GetCodingChallengeFilter =
  | GetCodingChallengeFilterById
  | GetCodingChallengeFilterByFields;

@Injectable({ providedIn: 'root' })
export class CodingChallengeApiService {
  private readonly _firestore = inject(Firestore);

  async createCodingChallenge(payload: CreateCodingChallengePayload) {
    const codingChallengesRef = collection(
      this._firestore,
      `coding-challenges`
    );

    await addDoc(codingChallengesRef, {
      name: payload.name,
      title: payload.title,
      description: payload.description,
      body: '',
      isDiscordChallengeLinked: false,
      createdAt: serverTimestamp(),
    });
  }

  async updateCodingChallenge(payload: UpdateCodingChallengePayload) {
    const codingChallengeRef = doc(
      this._firestore,
      `coding-challenges/${payload.id}`
    );

    await updateDoc(codingChallengeRef, {
      title: payload.title,
      description: payload.description,
      info: {
        difficulty: payload.difficulty,
        tags: payload.tags,
        startDate: Timestamp.fromDate(payload.startDate),
        endDate: Timestamp.fromDate(payload.endDate),
      },
    });
  }

  async updateCodingChallengeBody(payload: UpdateCodingChallengeBodyPayload) {
    const codingChallengeRef = doc(
      this._firestore,
      `coding-challenges/${payload.id}`
    );

    await updateDoc(codingChallengeRef, {
      body: payload.body,
    });
  }

  async updateCodingChallengeImage(payload: UpdateCodingChallengeImagePayload) {
    const codingChallengeRef = doc(
      this._firestore,
      `coding-challenges/${payload.id}`
    );

    await updateDoc(codingChallengeRef, {
      imageUrl: payload.imageUrl,
    });
  }

  async deleteCodingChallenge(payload: DeleteCodingChallengePayload) {
    const codingChallengeRef = doc(
      this._firestore,
      `coding-challenges/${payload.id}`
    );

    await deleteDoc(codingChallengeRef);
  }

  getCodingChallenges(filters: GetCodingChallengesFilter) {
    const codingChallengesRef = collection(
      this._firestore,
      `coding-challenges`
    );

    const constraints = [];

    if ('fields' in filters) {
      if (filters.fields.status !== undefined) {
        constraints.push(where('status', '==', filters.fields.status));
      }
    }

    return fromQuerySnapshot(query(codingChallengesRef, ...constraints)).pipe(
      map((querySnapshot) =>
        querySnapshot.docs.map((docSnapshot) =>
          toCodingChallenge(docSnapshot.id, docSnapshot.data())
        )
      )
    );
  }

  getCodingChallenge(filters: GetCodingChallengeFilter) {
    if ('id' in filters) {
      const codingChallengeRef = doc(
        this._firestore,
        `coding-challenges/${filters.id}`
      );

      return fromDocumentSnapshot(codingChallengeRef).pipe(
        map((docSnapshot) =>
          toCodingChallenge(docSnapshot.id, docSnapshot.data())
        )
      );
    } else {
      const codingChallengesRef = collection(
        this._firestore,
        `coding-challenges`
      );

      const constraints = [];

      if (filters.fields.name !== undefined) {
        constraints.push(where('name', '==', filters.fields.name));
      }

      if (filters.fields.status !== undefined) {
        constraints.push(where('status', '==', filters.fields.status));
      }

      constraints.push(limit(1));

      return fromQuerySnapshot(query(codingChallengesRef, ...constraints)).pipe(
        map((querySnapshot) => {
          if (querySnapshot.empty) {
            return null;
          }

          return toCodingChallenge(
            querySnapshot.docs[0].id,
            querySnapshot.docs[0].data()
          );
        })
      );
    }
  }
}
