import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import {
  AngularFireStorage,
  AngularFireUploadTask,
} from '@angular/fire/compat/storage';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Observable, from, map, of, switchMap } from 'rxjs';

import { DataFromFirebase, Post, PostFromFirebase } from 'src/app/models/post';
import { PostAdapterService } from './post.adapter.service';

@Injectable({
  providedIn: 'root',
})
export class PostService {
  private keyCollection = 'posts';

  constructor(
    private storage: AngularFireStorage,
    private firestore: AngularFirestore,
    private toastrService: ToastrService,
    private router: Router,
    private postAdapterService: PostAdapterService
  ) {}

  uploadImage(selectedImage: any) {
    const filePath = `postImg/${Date.now()}`;
    const uploadTask: AngularFireUploadTask = this.storage.upload(
      filePath,
      selectedImage
    );

    return this.getDownloadUrl$(uploadTask, filePath);
  }

  async deleteImage(postImg: string): Promise<void> {
    await this.storage.storage.refFromURL(postImg).delete();
  }

  async saveData(postData: Post): Promise<void> {
    try {
      await this.firestore.collection(this.keyCollection).add(postData);

      this.toastrService.success('Data Insert Successfully');
      this.router.navigate(['/posts']);
    } catch (err) {
      console.log(err);
    }
  }

  async deletePost(id: string): Promise<void> {
    try {
      await this.firestore
        .doc<DataFromFirebase>(`${this.keyCollection}/${id}`)
        .delete();

      this.toastrService.warning('Post Deleted!');
    } catch (err) {
      console.log(err);
    }
  }

  getPostsList(): Observable<PostFromFirebase[]> {
    return this.firestore
      .collection<DataFromFirebase>(this.keyCollection)
      .snapshotChanges()
      .pipe(
        map(actions => {
          return actions.map(a => {
            const data = this.postAdapterService.formatDateFromFirebase(
              a.payload.doc.data()
            );
            const id = a.payload.doc.id;

            return { id, data };
          });
        })
      );
  }

  getOnePost(id: string | undefined) {
    return id
      ? this.firestore
          .doc<DataFromFirebase>(`${this.keyCollection}/${id}`)
          .valueChanges()
          .pipe(
            map(val => {
              return val && this.postAdapterService.formatDateFromFirebase(val);
            })
          )
      : of(undefined);
  }

  async updatePost(id: string, postData: Post): Promise<void> {
    try {
      await this.firestore
        .doc<Post>(`${this.keyCollection}/${id}`)
        .update(postData);

      this.toastrService.success('Data Update Successfully!');
      this.router.navigate(['/posts']);
    } catch (err) {
      console.log(err);
    }
  }

  async markFeatured(id: string, postData: Partial<Post>): Promise<void> {
    try {
      await this.firestore
        .doc<Post>(`${this.keyCollection}/${id}`)
        .update(postData);

      this.toastrService.info('Featured Status Updated');
    } catch (err) {
      console.log(err);
    }
  }

  private getDownloadUrl$(
    uploadTask: AngularFireUploadTask,
    path: string
  ): Observable<string> {
    return from(uploadTask).pipe(
      switchMap(_ => this.storage.ref(path).getDownloadURL())
    );
  }
}
