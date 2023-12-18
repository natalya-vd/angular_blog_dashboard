import { Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';

import { CategoryService } from '../services/category/category.service';
import { Category } from '../models/category';


@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent {
  @ViewChild('categoryForm') categoryForm!: NgForm

  constructor(private categoryService: CategoryService) {}

  onSubmit(): void {
    const data: Category = {
      category: this.categoryForm.value.category
    }

    this.categoryService.saveData(data)
  }
}
