import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs';
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
  post: Post | undefined;
  mode: 'add' | 'edit' = 'add';
  postId: string | undefined

  postForm!: FormGroup

  constructor(
    private categoryService: CategoryService,
    private formBuilder: FormBuilder,
    private postService: PostService,
    private route: ActivatedRoute
  ) {
    this.route
      .queryParams
      .pipe(
        switchMap(params => {
          this.postId = params['id']

          return this.postService
          .getOnePost(this.postId)
        })
      )
      .subscribe(post => {
        this.post = post

        this.postForm = this.formBuilder.group({
          title: [ this.post?.title ?? '', [Validators.required, Validators.minLength(10)]],
          permalink: [{value: this.post?.permalink ?? '', disabled: true}, Validators.required],
          excerpt: [this.post?.excerpt ?? '', [Validators.required, Validators.minLength(50)]],
          category: [this.post?.category.categoryId ?? '', Validators.required],
          postImg: ['', Validators.required],
          content: [this.post?.content ?? '', Validators.required]
        })

        this.imgSrc = this.post?.postImgPath || this.defaultImg

        if(post) {
          this.mode = 'edit'
        }
      })
  }

  ngOnInit(): void {
    this.categoryService.getCategoriesList().subscribe(val => {
      this.categories = val
    })
  }

  get title() {
    const statuses = {
      add: 'Add New Post',
      edit: 'Edit Post'
    }
    return statuses[this.mode] ?? ''
  }

  get titleButton() {
    const statuses = {
      add: 'Save Post',
      edit: 'Update Post'
    }
    return statuses[this.mode] ?? ''
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

  onSubmit() {
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

    this.postService
      .uploadImage(this.selectedImg)
      .subscribe(async (url) => {
        postData.postImgPath = url

        if(this.mode === 'add') {
          await this.postService.saveData(postData)
        } else if (this.mode === 'edit' && this.postId) {
          await this.postService.updatePost(this.postId, postData)
        }

        this.clearForm()
      })
  }

  private clearForm() {
    this.postForm.reset()
    this.imgSrc = this.defaultImg
  }
}
