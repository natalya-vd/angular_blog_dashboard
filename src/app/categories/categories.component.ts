import { Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/compat/firestore';

interface Category {
  category: string
}

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent {
  @ViewChild('categoryForm') categoryForm!: NgForm

  constructor(private firestore: AngularFirestore) {}

  onSubmit(): void {
    const data: Category = {
      category: this.categoryForm.value.category
    }
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
