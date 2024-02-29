import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ToastrService } from 'ngx-toastr';
import { Observable, map } from 'rxjs';
import { Subscriber, SubscriberFromFirebase } from 'src/app/models/subscriber';

@Injectable({
  providedIn: 'root',
})
export class SubscriberService {
  private keyCollection = 'subscribers';

  constructor(
    private firestore: AngularFirestore,
    private toastrService: ToastrService
  ) {}

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

  async deleteData(id: string): Promise<void> {
    try {
      await this.firestore
        .doc<Subscriber>(`${this.keyCollection}/${id}`)
        .delete();

      this.toastrService.success('Data Deleted!');
    } catch (err) {
      console.log(err);
    }
  }
}
