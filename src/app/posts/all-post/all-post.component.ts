import { Component, OnInit } from '@angular/core';
import { PostFromFirebase } from 'src/app/models/post';

import { PostService } from 'src/app/services/post/post.service';

@Component({
  selector: 'app-all-post',
  templateUrl: './all-post.component.html',
  styleUrls: ['./all-post.component.css'],
})
export class AllPostComponent implements OnInit {
  posts!: PostFromFirebase[];
  constructor(private postService: PostService) {}

  ngOnInit(): void {
    this.postService.getPostsList().subscribe(val => {
      this.posts = val;
    });
  }

  async onDelete(post: PostFromFirebase) {
    const isDelete = confirm('Do you want to delete post?');

    if (!isDelete) return;

    try {
      if (post.data.postImgPath && post.data.postImgPath !== '') {
        await this.postService.deleteImage(post.data.postImgPath);
      }

      await this.postService.deletePost(post.id);
    } catch (err) {
      console.log(err);
    }
  }

  async onFeatured(postId: string, isFeatured: boolean) {
    const featuredData = {
      isFeatured,
    };

    await this.postService.markFeatured(postId, featuredData);
  }
}
