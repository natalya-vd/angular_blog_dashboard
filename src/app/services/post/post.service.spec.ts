import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ToastrService } from 'ngx-toastr';
import { AngularFireStorage } from '@angular/fire/compat/storage';

import { PostService } from './post.service';
import {
  AngularFireStorageReferenceMock,
  AngularFirestoreCollectionMock,
  AngularFirestoreDocumentMock,
  createFireStorageMock,
  createFirestoreMock,
} from 'src/app/spec-helpers/firestore-mock';
import { Post, PostFromFirebaseRaw } from 'src/app/models/post';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import {
  createPostDataFromForm,
  createPostsDataFromFirebaseRaw,
} from 'src/app/spec-helpers/post.data';
import { PostAdapterService } from './post.adapter.service';

describe('PostService', () => {
  let postService: PostService;
  let postAdapterService: PostAdapterService;
  let firestoreMock: AngularFirestore;
  let fireStorageMock: AngularFireStorage;
  let toastrServiceSpy: jasmine.SpyObj<ToastrService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let postDataRaw: PostFromFirebaseRaw[] = [];
  let postFormData: Post;

  beforeEach(() => {
    postDataRaw = createPostsDataFromFirebaseRaw();
    postFormData = createPostDataFromForm();

    const toastrServiceSpyObj = jasmine.createSpyObj('ToastrService', [
      'success',
      'warning',
      'info',
    ]);
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        PostService,
        PostAdapterService,
        {
          provide: AngularFirestore,
          useValue: createFirestoreMock(postDataRaw),
        },
        {
          provide: AngularFireStorage,
          useValue: createFireStorageMock(),
        },
        {
          provide: ToastrService,
          useValue: toastrServiceSpyObj,
        },
        {
          provide: Router,
          useValue: routerSpyObj,
        },
      ],
    });

    postService = TestBed.inject(PostService);
    postAdapterService = TestBed.inject(PostAdapterService);
    firestoreMock = TestBed.inject(AngularFirestore);
    fireStorageMock = TestBed.inject(AngularFireStorage);
    toastrServiceSpy = TestBed.inject(
      ToastrService
    ) as jasmine.SpyObj<ToastrService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should be created', () => {
    expect(postService).toBeTruthy();
  });

  describe('saveData()', () => {
    it('should call firebase methods', async () => {
      const spyFirebase = spyOn(firestoreMock, 'collection').and.callThrough();
      const spyAdd = spyOn(
        AngularFirestoreCollectionMock.prototype,
        'add'
      ).and.callThrough();

      await postService.saveData(postFormData);

      expect(spyFirebase).toHaveBeenCalledTimes(1);
      expect(spyAdd).toHaveBeenCalledTimes(1);
      expect(spyAdd).toHaveBeenCalledWith(postFormData);
    });

    it('should call toastrService.success for success add', async () => {
      await postService.saveData(postFormData);

      expect(toastrServiceSpy.success).toHaveBeenCalledTimes(1);
      expect(toastrServiceSpy.success).toHaveBeenCalledWith(
        'Data Insert Successfully'
      );
    });

    it('should navigate in "posts" for success add', async () => {
      await postService.saveData(postFormData);

      expect(routerSpy.navigate).toHaveBeenCalledTimes(1);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/posts']);
    });

    it('should call console.log for error add', async () => {
      const spyLog = spyOn(window.console, 'log');
      spyOn(AngularFirestoreCollectionMock.prototype, 'add').and.throwError(
        'Error'
      );

      await postService.saveData(postFormData);

      expect(spyLog).toHaveBeenCalledTimes(1);
      expect(spyLog).toHaveBeenCalledWith(new Error('Error'));
    });
  });

  describe('uploadImage()', () => {
    it('should call upload method firebase', () => {
      const spyFireStorage = spyOn(fireStorageMock, 'upload').and.callThrough();
      const mockFile = new File([''], 'filename', { type: 'jpg' });
      const filePath = `postImg/${Date.now()}`;

      postService.uploadImage(mockFile);

      expect(spyFireStorage).toHaveBeenCalledTimes(1);
      expect(spyFireStorage).toHaveBeenCalledWith(
        jasmine.stringContaining(filePath),
        mockFile
      );
    });

    it('should call methods firebase', fakeAsync(() => {
      const spyFireStorage = spyOn(fireStorageMock, 'ref').and.callThrough();
      const spyGetDownloadURL = spyOn(
        AngularFireStorageReferenceMock.prototype,
        'getDownloadURL'
      ).and.callThrough();
      const filePath = `postImg/${Date.now()}`;
      const mockFile = new File([''], 'filename', { type: 'jpg' });
      let result = '';

      postService.uploadImage(mockFile).subscribe(path => {
        result = path;
      });
      tick();

      expect(result).toBe(filePath);
      expect(spyFireStorage).toHaveBeenCalledTimes(1);
      expect(spyFireStorage).toHaveBeenCalledWith(
        jasmine.stringContaining(filePath)
      );
      expect(spyGetDownloadURL).toHaveBeenCalledTimes(1);
    }));
  });

  describe('getPostsList()', () => {
    it('should call firebase methods', () => {
      const spyFirebase = spyOn(firestoreMock, 'collection').and.callThrough();
      const spySnapshotChanges = spyOn(
        AngularFirestoreCollectionMock.prototype,
        'snapshotChanges'
      ).and.callThrough();

      postService.getPostsList();

      expect(spyFirebase).toHaveBeenCalledTimes(1);
      expect(spySnapshotChanges).toHaveBeenCalledTimes(1);
    });

    it('should return observable with categories', (done: DoneFn) => {
      const postData = postDataRaw.map(item => ({
        id: item.id,
        data: postAdapterService.formatDateFromFirebase(item.data),
      }));

      postService.getPostsList().subscribe(data => {
        expect(data).toEqual(postData);
        done();
      });
    });
  });

  describe('getOnePost()', () => {
    it('should call firestore methods when getOnePost("1")', () => {
      const spyFirebase = spyOn(firestoreMock, 'doc').and.callThrough();
      const spyValueChanges = spyOn(
        AngularFirestoreDocumentMock.prototype,
        'valueChanges'
      ).and.callThrough();

      postService.getOnePost('1');

      expect(spyFirebase).toHaveBeenCalledTimes(1);
      expect(spyValueChanges).toHaveBeenCalledTimes(1);
    });

    it('should not call firestore methods when getOnePost(undefined)', () => {
      const spyFirebase = spyOn(firestoreMock, 'doc').and.callThrough();
      const spyValueChanges = spyOn(
        AngularFirestoreDocumentMock.prototype,
        'valueChanges'
      ).and.callThrough();

      postService.getOnePost(undefined);

      expect(spyFirebase).not.toHaveBeenCalledTimes(1);
      expect(spyValueChanges).not.toHaveBeenCalledTimes(1);
    });

    it('should return undefined when getOnePost(undefined)', done => {
      postService.getOnePost(undefined).subscribe(value => {
        done();

        expect(value).toBe(undefined);
      });
    });

    it('should return Post when getOnePost("1")', done => {
      const postData = postAdapterService.formatDateFromFirebase(
        postDataRaw[0].data
      );

      postService.getOnePost('1').subscribe(value => {
        done();

        expect(value).toEqual(postData);
      });
    });
  });

  describe('updatePost()', () => {
    it('should call firebase methods', async () => {
      const spyFirebase = spyOn(firestoreMock, 'doc').and.callThrough();
      const spyUpdate = spyOn(
        AngularFirestoreDocumentMock.prototype,
        'update'
      ).and.callThrough();

      await postService.updatePost('1', postFormData);

      expect(spyFirebase).toHaveBeenCalledTimes(1);
      expect(spyUpdate).toHaveBeenCalledTimes(1);
      expect(spyUpdate).toHaveBeenCalledWith(postFormData);
    });

    it('should call toastrService.success when success update', async () => {
      await postService.updatePost('1', postFormData);

      expect(toastrServiceSpy.success).toHaveBeenCalledTimes(1);
      expect(toastrServiceSpy.success).toHaveBeenCalledWith(
        'Data Update Successfully!'
      );
    });

    it('should navigate in "posts" for success update', async () => {
      await postService.saveData(postFormData);

      expect(routerSpy.navigate).toHaveBeenCalledTimes(1);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/posts']);
    });

    it('should call console.log when error update', async () => {
      const spyLog = spyOn(window.console, 'log');

      await postService.updatePost('10', postFormData);

      expect(spyLog).toHaveBeenCalledTimes(1);
      expect(spyLog).toHaveBeenCalledWith('Error');
    });
  });

  describe('deleteImage()', () => {
    it('should call fireStorage methods', async () => {
      const spyRefFromURL = spyOn(
        fireStorageMock.storage,
        'refFromURL'
      ).and.callThrough();
      const spyDelete = spyOn(
        AngularFireStorageReferenceMock.prototype,
        'delete'
      ).and.callThrough();

      await postService.deleteImage('url');

      expect(spyRefFromURL).toHaveBeenCalledTimes(1);
      expect(spyDelete).toHaveBeenCalledTimes(1);
    });
  });

  describe('deletePost()', () => {
    it('should call firebase methods', async () => {
      const spyFirebase = spyOn(firestoreMock, 'doc').and.callThrough();
      const spyDelete = spyOn(
        AngularFirestoreDocumentMock.prototype,
        'delete'
      ).and.callThrough();

      await postService.deletePost('1');

      expect(spyFirebase).toHaveBeenCalledTimes(1);
      expect(spyDelete).toHaveBeenCalledTimes(1);
    });

    it('should call toastrService.success when success delete', async () => {
      await postService.deletePost('1');

      expect(toastrServiceSpy.warning).toHaveBeenCalledTimes(1);
      expect(toastrServiceSpy.warning).toHaveBeenCalledWith('Post Deleted!');
    });

    it('should call console.log when error delete', async () => {
      const spyLog = spyOn(window.console, 'log');
      spyOn(AngularFirestoreDocumentMock.prototype, 'delete').and.throwError(
        'Error'
      );

      await postService.deletePost('1');

      expect(spyLog).toHaveBeenCalledTimes(1);
      expect(spyLog).toHaveBeenCalledWith(new Error('Error'));
    });
  });

  describe('markFeatured()', () => {
    it('should call firebase methods', async () => {
      const spyFirebase = spyOn(firestoreMock, 'doc').and.callThrough();
      const spyUpdate = spyOn(
        AngularFirestoreDocumentMock.prototype,
        'update'
      ).and.callThrough();
      const data = { isFeatured: true };

      await postService.markFeatured('1', data);

      expect(spyFirebase).toHaveBeenCalledTimes(1);
      expect(spyUpdate).toHaveBeenCalledTimes(1);
      expect(spyUpdate).toHaveBeenCalledWith(data);
    });

    it('should call toastrService.info when success update', async () => {
      const data = { isFeatured: true };

      await postService.markFeatured('1', data);

      expect(toastrServiceSpy.info).toHaveBeenCalledTimes(1);
      expect(toastrServiceSpy.info).toHaveBeenCalledWith(
        'Featured Status Updated'
      );
    });

    it('should call console.log when error update', async () => {
      const spyLog = spyOn(window.console, 'log');
      spyOn(AngularFirestoreDocumentMock.prototype, 'update').and.throwError(
        'Error'
      );
      const data = { isFeatured: true };

      await postService.markFeatured('1', data);

      expect(spyLog).toHaveBeenCalledTimes(1);
      expect(spyLog).toHaveBeenCalledWith(new Error('Error'));
    });
  });
});
