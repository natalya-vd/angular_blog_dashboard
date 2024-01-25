import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CategoryFromFirebase } from 'src/app/models/category';
import { Post } from 'src/app/models/post';
import { CategoryService } from 'src/app/services/category/category.service';
import { PostService } from 'src/app/services/post/post.service';

@Component({
  selector: 'app-new-post',
  templateUrl: './new-post.component.html',
  styleUrls: ['./new-post.component.css']
})
export class NewPostComponent implements OnInit {
  defaultImg = './assets/placeholder-image.png';
  imgSrc: any = this.defaultImg;
  selectedImg: any;
  categories: CategoryFromFirebase[] = [];

  postForm: FormGroup

  constructor(
    private categoryService: CategoryService,
    private formBuilder: FormBuilder,
    private postService: PostService
  ) {
    this.postForm = this.formBuilder.group({
      title: ['', [Validators.required, Validators.minLength(10)]],
      permalink: [{value: '', disabled: true}, Validators.required],
      excerpt: ['', [Validators.required, Validators.minLength(50)]],
      category: ['', Validators.required],
      postImg: ['', Validators.required],
      content: ['', Validators.required]
    })
  }

  ngOnInit(): void {
    this.categoryService.getCategoriesList().subscribe(val => {
      this.categories = val
    })
  }

  get formControls() {
    return this.postForm.controls
  }

  onTitleChange($event: Event) {
    const input = $event.target as HTMLInputElement
    const title = input.value
    this.postForm.controls['permalink'].setValue(title.replace(/\s/g, '-'))
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

  async onSubmit() {
    if(this.postForm.invalid) return

    const category = this.categories.find((category) => category.id === this.postForm.value.category)

    const postData: Post = {
      title: this.postForm.value.title,
      permalink: this.postForm.getRawValue().permalink,
      category: {
        categoryId: category?.id ?? '',
        category: category?.data.category ?? ''
      },
      postImgPath: '',
      excerpt: this.postForm.value.excerpt,
      content: this.postForm.value.content,
      isFeatured: false,
      views: 0,
      status: 'new',
      createdAt: new Date()
    }

    await this.postService.uploadImage(this.selectedImg, postData)

    this.postForm.reset()
    this.imgSrc = this.defaultImg
  }
}
