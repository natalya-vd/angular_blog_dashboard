import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Category, CategoryFromFirebase } from 'src/app/models/category';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  constructor(private firestore: AngularFirestore, private toastrService: ToastrService) { }

  getCategoriesList(): Observable<CategoryFromFirebase[]> {
    return this.firestore
      .collection<Category>('categories')
      .snapshotChanges()
      .pipe(map((actions) => {
        return actions.map(a => {
          console.log(a)
          const data = a.payload.doc.data()
          const id = a.payload.doc.id

          return {id, data}
        })
      }))
  }

  saveData(data: Category): void {
    this.firestore
      .collection<Category>('categories')
      .add(data)
      .then(docRef => {
        this.toastrService.success('Data Insert Successfully!')
      })
      .catch(err => {
        console.log(err)
      })
  }
}
