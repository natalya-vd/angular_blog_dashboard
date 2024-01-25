import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Observable, map } from 'rxjs';

import { DataFromFirebase, Post, PostFromFirebase } from 'src/app/models/post';
import { PostAdapterService } from './post.adapter.service';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private keyCollection = 'posts'

  constructor(
    private storage: AngularFireStorage,
    private firestore: AngularFirestore,
    private toastrService: ToastrService,
    private router: Router,
    private postAdapterService: PostAdapterService
  ) { }

  async uploadImage(selectedImage: any, postData: Post): Promise<void> {
    try {
      const filePath = `postImg/${Date.now()}`

      await this.storage.upload(filePath, selectedImage)

      this.storage
        .ref(filePath)
        .getDownloadURL()
        .subscribe(url => {
          postData.postImgPath = url
          this.saveData(postData)
        })
    } catch(err) {
      console.log(err)
    }
  }

  async saveData(postData: Post): Promise<void> {
    try {
      await this.firestore
      .collection(this.keyCollection)
      .add(postData)

      this.toastrService.success('Data Insert Successfully')
      this.router.navigate(['/posts'])
    } catch(err) {
      console.log(err)
    }
  }

  getPostsList(): Observable<PostFromFirebase[]> {
    return this.firestore
      .collection<DataFromFirebase>(this.keyCollection)
      .snapshotChanges()
      .pipe(map((actions) => {
        return actions.map(a => {
          const data = this.postAdapterService.formatDateFromFirebase(a.payload.doc.data())
          const id = a.payload.doc.id

          return {id, data}
        })
      }))
  }
}
