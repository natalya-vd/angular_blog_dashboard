import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Category, CategoryFromFirebase } from 'src/app/models/category';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private keyCollection = 'categories';

  constructor(
    private firestore: AngularFirestore,
    private toastrService: ToastrService
  ) {}

  getCategoriesList(): Observable<CategoryFromFirebase[]> {
    return this.firestore
      .collection<Category>(this.keyCollection)
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

  async saveData(data: Category): Promise<void> {
    try {
      const docRef = await this.firestore
        .collection<Category>(this.keyCollection)
        .add(data);
      this.toastrService.success('Data Insert Successfully!');
    } catch (err) {
      console.log(err);
    }
  }

  async updateData(id: string, newValue: Category): Promise<void> {
    try {
      await this.firestore
        .doc<Category>(`${this.keyCollection}/${id}`)
        .update(newValue);

      this.toastrService.success('Data Update Successfully!');
    } catch (err) {
      console.log(err);
    }
  }

  async deleteData(id: string): Promise<void> {
    try {
      await this.firestore
        .doc<Category>(`${this.keyCollection}/${id}`)
        .delete();

      this.toastrService.success('Data Deleted!');
    } catch (err) {
      console.log(err);
    }
  }
}
