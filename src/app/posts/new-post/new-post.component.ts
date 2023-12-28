import { Component, OnInit } from '@angular/core';
import { CategoryFromFirebase } from 'src/app/models/category';
import { CategoryService } from 'src/app/services/category/category.service';

@Component({
  selector: 'app-new-post',
  templateUrl: './new-post.component.html',
  styleUrls: ['./new-post.component.css']
})
export class NewPostComponent implements OnInit {
  permalink: string = '';
  imgSrc: any = './assets/placeholder-image.png';
  selectedImg: any;
  categories: CategoryFromFirebase[] = [];

  constructor(private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.categoryService.getCategoriesList().subscribe(val => {
      this.categories = val
    })
  }

  onTitleChange($event: Event) {
    const input = $event.target as HTMLInputElement
    const title = input.value
    this.permalink = title.replace(/\s/g, '-')
  }

  showPreview($event: Event) {
    const reader = new FileReader();
    reader.onload = (e) => {
      this.imgSrc = e.target?.result;
    }

    const input = $event.target as HTMLInputElement

    if(input.files) {
      reader.readAsDataURL(input.files[0])
      this.selectedImg = input.files[0]
    }
  }
}
