import { Injectable } from '@angular/core';

import { DataFromFirebase, PostFromFirebase } from 'src/app/models/post';

@Injectable({
  providedIn: 'root',
})
export class PostAdapterService {
  formatDateFromFirebase(data: DataFromFirebase): PostFromFirebase['data'] {
    return {
      ...data,
      createdAt: data.createdAt.seconds * 1000,
    };
  }
}
