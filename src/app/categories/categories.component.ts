import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';

import { CategoryService } from '../services/category/category.service';
import { Category, CategoryFromFirebase } from '../models/category';


@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent implements OnInit {
  @ViewChild('categoryForm') categoryForm!: NgForm

  categoryArray: CategoryFromFirebase[] = []

  constructor(private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.categoryService.getCategoriesList().subscribe(val => {
      this.categoryArray = val
    })
  }

  onSubmit(): void {
    const data: Category = {
      category: this.categoryForm.value.category
    }

    this.categoryService.saveData(data)

    this.categoryForm.reset()
  }
}
