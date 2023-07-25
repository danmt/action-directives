import { inject, Injectable } from '@angular/core';
import {
  collection,
  doc,
  Firestore,
  limit,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { fromDocumentSnapshot, fromQuerySnapshot } from '@heavy-duty/blueprint';
import {
  CodingChallengeSubmissionStatus,
  toCodingChallengeSubmission,
} from '@heavy-duty/coding-challenge-submissions-utils';
import { map } from 'rxjs';

export interface ReviewCodingChallengeSubmissionPayload {
  id: string;
  isApproved: boolean;
}

export interface GetCodingChallengeSubmissionsFilterByFields {
  fields: {
    status?: CodingChallengeSubmissionStatus;
    codingChallengeId?: string;
    userId?: string;
  };
}

export type GetCodingChallengeSubmissionsFilter =
  GetCodingChallengeSubmissionsFilterByFields;

export interface GetCodingChallengeSubmissionFilterById {
  id: string;
}

export interface GetCodingChallengeSubmissionFilterByFields {
  fields: {
    status?: CodingChallengeSubmissionStatus;
    codingChallengeId?: string;
    userId?: string;
  };
}

export type GetCodingChallengeSubmissionFilter =
  | GetCodingChallengeSubmissionFilterById
  | GetCodingChallengeSubmissionFilterByFields;

@Injectable({ providedIn: 'root' })
export class CodingChallengeSubmissionApiService {
  private readonly _firestore = inject(Firestore);

  async reviewCodingChallengeSubmission(
    payload: ReviewCodingChallengeSubmissionPayload
  ) {
    const codingChallengeSubmissionRef = doc(
      this._firestore,
      `coding-challenge-submissions/${payload.id}`
    );

    await updateDoc(codingChallengeSubmissionRef, {
      isApproved: payload.isApproved,
      doneAt: serverTimestamp(),
      status: 'done',
    });
  }

  getCodingChallengeSubmissions(filters: GetCodingChallengeSubmissionsFilter) {
    const codingChallengeSubmissionsRef = collection(
      this._firestore,
      `coding-challenge-submissions`
    );

    const constraints = [];

    if ('fields' in filters) {
      if (filters.fields.status !== undefined) {
        constraints.push(where('status', '==', filters.fields.status));
      }

      if (filters.fields.codingChallengeId !== undefined) {
        constraints.push(
          where('codingChallengeId', '==', filters.fields.codingChallengeId)
        );
      }

      if (filters.fields.userId !== undefined) {
        constraints.push(where('userId', '==', filters.fields.userId));
      }
    }

    return fromQuerySnapshot(
      query(codingChallengeSubmissionsRef, ...constraints)
    ).pipe(
      map((querySnapshot) =>
        querySnapshot.docs.map((docSnapshot) =>
          toCodingChallengeSubmission(docSnapshot.id, docSnapshot.data())
        )
      )
    );
  }

  getCodingChallengeSubmission(filters: GetCodingChallengeSubmissionFilter) {
    if ('id' in filters) {
      const codingChallengeSubmissionRef = doc(
        this._firestore,
        `coding-challenge-submissions/${filters.id}`
      );

      return fromDocumentSnapshot(codingChallengeSubmissionRef).pipe(
        map((docSnapshot) =>
          toCodingChallengeSubmission(docSnapshot.id, docSnapshot.data())
        )
      );
    } else {
      const codingChallengeSubmissionsRef = collection(
        this._firestore,
        `coding-challenge-submissions`
      );

      const constraints = [];

      if (filters.fields.status !== undefined) {
        constraints.push(where('status', '==', filters.fields.status));
      }

      if (filters.fields.codingChallengeId !== undefined) {
        constraints.push(
          where('codingChallengeId', '==', filters.fields.codingChallengeId)
        );
      }

      if (filters.fields.userId !== undefined) {
        constraints.push(where('userId', '==', filters.fields.userId));
      }

      constraints.push(limit(1));

      return fromQuerySnapshot(
        query(codingChallengeSubmissionsRef, ...constraints)
      ).pipe(
        map((querySnapshot) => {
          if (querySnapshot.empty) {
            return null;
          }

          return toCodingChallengeSubmission(
            querySnapshot.docs[0].id,
            querySnapshot.docs[0].data()
          );
        })
      );
    }
  }
}
