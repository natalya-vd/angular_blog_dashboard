import { TestBed } from '@angular/core/testing';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ToastrService } from 'ngx-toastr';
import { AngularFireStorage } from '@angular/fire/compat/storage';

import { PostService } from './post.service';
import { AngularFireStorageMock, AngularFireStorageReferenceMock, AngularFirestoreCollectionMock, createFireStorageMock, createFirestoreMock } from 'src/app/spec-helpers/firestore-mock';
import { Post, PostFromFirebase, PostFromFirebaseRaw } from 'src/app/models/post';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { createPostDataFromForm, createPostsDataFromFirebaseRaw } from 'src/app/spec-helpers/post.data';
import { PostAdapterService } from './post.adapter.service';

describe('PostService', () => {
  let postService: PostService;
  let postAdapterService: PostAdapterService;
  let firestoreMock: AngularFirestore
  let fireStorageMock: AngularFireStorage
  let toastrServiceSpy: jasmine.SpyObj<ToastrService>
  let routerSpy: jasmine.SpyObj<Router>
  let postDataRaw: PostFromFirebaseRaw[] = []
  let postFormData: Post

  beforeEach(() => {
    postDataRaw = createPostsDataFromFirebaseRaw()
    postFormData = createPostDataFromForm()

    const toastrServiceSpyObj = jasmine.createSpyObj('ToastrService', ['success'])
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate'])

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        PostService,
        PostAdapterService,
        {
          provide: AngularFirestore,
          useValue: createFirestoreMock(postDataRaw)
        },
        {
          provide: AngularFireStorage,
          useValue: createFireStorageMock()
        },
        {
          provide: ToastrService,
          useValue: toastrServiceSpyObj
        },
        {
          provide: Router,
          useValue: routerSpyObj
        }
      ]
    });

    postService = TestBed.inject(PostService);
    postAdapterService = TestBed.inject(PostAdapterService);
    firestoreMock = TestBed.inject(AngularFirestore);
    fireStorageMock = TestBed.inject(AngularFireStorage);
    toastrServiceSpy = TestBed.inject(ToastrService) as jasmine.SpyObj<ToastrService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should be created', () => {
    expect(postService).toBeTruthy();
  });

  describe('saveData()', () => {
    it('should call firebase methods', async () => {
      const spyFirebase = spyOn(firestoreMock, 'collection').and.callThrough()
      const spyAdd = spyOn(AngularFirestoreCollectionMock.prototype, 'add').and.callThrough()

      await postService.saveData(postFormData)

      expect(spyFirebase).toHaveBeenCalledTimes(1);
      expect(spyAdd).toHaveBeenCalledTimes(1);
      expect(spyAdd).toHaveBeenCalledWith(postFormData)
    });

    it('should call toastrService.success for success add', async () => {
      await postService.saveData(postFormData)

      expect(toastrServiceSpy.success).toHaveBeenCalledTimes(1);
      expect(toastrServiceSpy.success).toHaveBeenCalledWith('Data Insert Successfully');
    });

    it('should navigate in "posts" for success add', async () => {
      await postService.saveData(postFormData)

      expect(routerSpy.navigate).toHaveBeenCalledTimes(1);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/posts']);
    });

    it('should call console.log for error add', async () => {
      const spyLog = spyOn(window.console, 'log')
      spyOn(AngularFirestoreCollectionMock.prototype, 'add').and.throwError('Error')

      await postService.saveData(postFormData)

      expect(spyLog).toHaveBeenCalledTimes(1);
      expect(spyLog).toHaveBeenCalledWith(new Error('Error'));
    });
  });

  describe('uploadImage()', () => {
    it('should call upload method firebase', async () => {
      const spyFireStorage = spyOn(fireStorageMock, 'upload').and.callThrough();
      const mockFile = new File([''], 'filename', { type: 'jpg' });

      await postService.uploadImage(mockFile, postFormData);

      expect(spyFireStorage).toHaveBeenCalledTimes(1);
    });

    it('should call methods firebase', async () => {
      const spyFireStorage = spyOn(fireStorageMock, 'ref').and.callThrough()
      const spyGetDownloadURL = spyOn(AngularFireStorageReferenceMock.prototype, 'getDownloadURL').and.callThrough()
      const mockFile = new File([''], 'filename', { type: 'jpg' });

      await postService.uploadImage(mockFile, postFormData);

      expect(spyFireStorage).toHaveBeenCalledTimes(1);
      expect(spyGetDownloadURL).toHaveBeenCalledTimes(1);

    });

    it('should call saveData method', async () => {
      const spySaveData = spyOn(postService, 'saveData').and.callThrough()
      const mockFile = new File([''], 'filename', { type: 'jpg' });

      await postService.uploadImage(mockFile, postFormData);

      expect(spySaveData).toHaveBeenCalledTimes(1);
    });

    it('should call console.log for error add', async () => {
      const spyLog = spyOn(window.console, 'log')
      spyOn(AngularFireStorageMock.prototype, 'upload').and.throwError('Error')
      const mockFile = new File([''], 'filename', { type: 'jpg' });

      await postService.uploadImage(mockFile, postFormData);

      expect(spyLog).toHaveBeenCalledTimes(1);
      expect(spyLog).toHaveBeenCalledWith(new Error('Error'));
    });
  })

  describe('getPostsList()', () => {
    it('should call firebase methods', () => {
      const spyFirebase = spyOn(firestoreMock, 'collection').and.callThrough()
      const spySnapshotChanges = spyOn(AngularFirestoreCollectionMock.prototype, 'snapshotChanges').and.callThrough()

      postService.getPostsList()

      expect(spyFirebase).toHaveBeenCalledTimes(1);
      expect(spySnapshotChanges).toHaveBeenCalledTimes(1);
    });

    it('should return observable with categories', (done: DoneFn) => {
      const postData = postDataRaw.map((item) => ({
        id: item.id,
        data: postAdapterService.formatDateFromFirebase(item.data)
      }))


      postService.getPostsList().subscribe((data) => {
        expect(data).toEqual(postData)
        done()
      })
    })
  })
});
