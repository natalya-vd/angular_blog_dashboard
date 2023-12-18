import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';

import { Category } from 'src/app/models/category';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  constructor(private firestore: AngularFirestore) { }

  saveData(data: Category): void {
    this.firestore
      .collection<Category>('categories')
      .add(data)
      .then(docRef => {
        console.log(docRef)
      })
      .catch(err => {
        console.log(err)
      })
  }
}
