import { Component, OnInit } from '@angular/core';
import { PostFromFirebase } from 'src/app/models/post';

import { PostService } from 'src/app/services/post/post.service';

@Component({
  selector: 'app-all-post',
  templateUrl: './all-post.component.html',
  styleUrls: ['./all-post.component.css']
})
export class AllPostComponent implements OnInit {
  posts!: PostFromFirebase[]
  constructor(private postService: PostService) {}

  ngOnInit(): void {
    this.postService
      .getPostsList()
      .subscribe((val) => {
        this.posts = val
      })
  }
}
