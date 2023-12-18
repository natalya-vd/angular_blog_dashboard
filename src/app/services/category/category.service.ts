import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ToastrService } from 'ngx-toastr';

import { Category } from 'src/app/models/category';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  constructor(private firestore: AngularFirestore, private toastrService: ToastrService) { }

  saveData(data: Category): void {
    this.firestore
      .collection<Category>('categories')
      .add(data)
      .then(docRef => {
        console.log(docRef)
        this.toastrService.success('Data Insert Successfully!')
      })
      .catch(err => {
        console.log(err)
      })
  }
}
