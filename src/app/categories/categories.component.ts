import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';

import { CategoryService } from '../services/category/category.service';
import { Category, CategoryFromFirebase } from '../models/category';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css'],
})
export class CategoriesComponent implements OnInit {
  @ViewChild('categoryForm') categoryForm!: NgForm;

  categoryArray: CategoryFromFirebase[] = [];
  formCategoryValue!: string;
  mode: 'add' | 'edit' = 'add';
  updateCategoryId: string | null = null;

  constructor(private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.categoryService.getCategoriesList().subscribe(val => {
      this.categoryArray = val;
    });
  }

  get title() {
    const statuses = {
      add: 'New Categories',
      edit: 'Edit Category',
    };
    return statuses[this.mode] ?? '';
  }

  get titleButton() {
    const statuses = {
      add: 'Add',
      edit: 'Edit',
    };
    return statuses[this.mode] ?? '';
  }

  onSubmit(): void {
    const data: Category = {
      category: this.categoryForm.value.category,
    };

    if (this.mode === 'add') {
      this.categoryService.saveData(data);
    } else if (this.mode === 'edit') {
      if (this.updateCategoryId) {
        this.categoryService.updateData(this.updateCategoryId, data);
        this.mode = 'add';
      }
    }

    this.categoryForm.reset();
  }

  onEdit(category: CategoryFromFirebase): void {
    this.formCategoryValue = category.data.category;
    this.mode = 'edit';
    this.updateCategoryId = category.id;
  }

  onDelete(category: CategoryFromFirebase): void {
    const isDelete = confirm('Do you want to delete category?');

    if (isDelete) {
      this.categoryService.deleteData(category.id);
    }
  }
}
