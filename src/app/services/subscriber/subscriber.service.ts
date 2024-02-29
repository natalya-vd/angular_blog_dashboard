import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, map } from 'rxjs';
import { Subscriber, SubscriberFromFirebase } from 'src/app/models/subscriber';

@Injectable({
  providedIn: 'root',
})
export class SubscriberService {
  private keyCollection = 'subscribers';

  constructor(private firestore: AngularFirestore) {}

  getSubscribersList(): Observable<SubscriberFromFirebase[]> {
    return this.firestore
      .collection<Subscriber>(this.keyCollection)
      .snapshotChanges()
      .pipe(
        map(actions => {
          return actions.map(a => {
            const data = a.payload.doc.data();
            const id = a.payload.doc.id;

            return { id, data };
          });
        })
      );
  }
}
