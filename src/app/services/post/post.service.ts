import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { ToastrService } from 'ngx-toastr';
import { Post } from 'src/app/models/post';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private keyCollection = 'posts'

  constructor(
    private storage: AngularFireStorage,
    private firestore: AngularFirestore,
    private toastrService: ToastrService
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
    } catch(err) {
      console.log(err)
    }
  }
}
