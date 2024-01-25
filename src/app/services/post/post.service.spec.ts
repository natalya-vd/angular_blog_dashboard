import { TestBed } from '@angular/core/testing';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ToastrService } from 'ngx-toastr';
import { AngularFireStorage } from '@angular/fire/compat/storage';

import { PostService } from './post.service';
import { AngularFireStorageMock, AngularFireStorageReferenceMock, AngularFirestoreCollectionMock, createFireStorageMock, createFirestoreMock } from 'src/app/spec-helpers/firestore-mock';
import { PostFromFirebase } from 'src/app/models/post';

describe('PostService', () => {
  let postService: PostService;
  let firestoreMock: AngularFirestore
  let fireStorageMock: AngularFireStorage
  let toastrServiceSpy: jasmine.SpyObj<ToastrService>
  let postData: PostFromFirebase[] = []

  beforeEach(() => {
    postData = [
      {
        id: '1',
        data: {
          title: 'Title 1',
          permalink: 'Title-1',
          category: {
            categoryId: '1',
            category: 'Category 1'
          },
          postImgPath: '',
          excerpt: 'excerpt',
          content: 'content',
          isFeatured: false,
          views: 0,
          status: 'new',
          createdAt: new Date()
        }
      },
      {
        id: '2',
        data: {
          title: 'Title 2',
          permalink: 'Title-2',
          category: {
            categoryId: '2',
            category: 'Category 2'
          },
          postImgPath: '',
          excerpt: 'excerpt',
          content: 'content',
          isFeatured: false,
          views: 0,
          status: 'new',
          createdAt: new Date()
        }
      },
      {
        id: '3',
        data: {
          title: 'Title 3',
          permalink: 'Title-3',
          category: {
            categoryId: '3',
            category: 'Category 3'
          },
          postImgPath: '',
          excerpt: 'excerpt',
          content: 'content',
          isFeatured: false,
          views: 0,
          status: 'new',
          createdAt: new Date()
        }
      },
    ]

    const toastrServiceSpyObj = jasmine.createSpyObj('ToastrService', ['success'])

    TestBed.configureTestingModule({
      providers: [
        PostService,
        {
          provide: AngularFirestore,
          useValue: createFirestoreMock(postData)
        },
        {
          provide: AngularFireStorage,
          useValue: createFireStorageMock()
        },
        {
          provide: ToastrService,
          useValue: toastrServiceSpyObj
        }
      ]
    });

    postService = TestBed.inject(PostService);
    firestoreMock = TestBed.inject(AngularFirestore);
    fireStorageMock = TestBed.inject(AngularFireStorage);
    toastrServiceSpy = TestBed.inject(ToastrService) as jasmine.SpyObj<ToastrService>;
  });

  it('should be created', () => {
    expect(postService).toBeTruthy();
  });

  describe('saveData()', () => {
    it('should call firebase methods', async () => {
      const spyFirebase = spyOn(firestoreMock, 'collection').and.callThrough()
      const spyAdd = spyOn(AngularFirestoreCollectionMock.prototype, 'add').and.callThrough()

      await postService.saveData(postData[0].data)

      expect(spyFirebase).toHaveBeenCalledTimes(1);
      expect(spyAdd).toHaveBeenCalledTimes(1);
      expect(spyAdd).toHaveBeenCalledWith(postData[0].data)
    });

    it('should call toastrService.success for success add', async () => {
      await postService.saveData(postData[0].data)

      expect(toastrServiceSpy.success).toHaveBeenCalledTimes(1);
      expect(toastrServiceSpy.success).toHaveBeenCalledWith('Data Insert Successfully');
    });

    it('should call console.log for error add', async () => {
      const spyLog = spyOn(window.console, 'log')
      spyOn(AngularFirestoreCollectionMock.prototype, 'add').and.throwError('Error')

      await postService.saveData(postData[0].data)

      expect(spyLog).toHaveBeenCalledTimes(1);
      expect(spyLog).toHaveBeenCalledWith(new Error('Error'));
    });
  });

  describe('uploadImage()', () => {
    it('should call upload method firebase', async () => {
      const spyFireStorage = spyOn(fireStorageMock, 'upload').and.callThrough();
      const mockFile = new File([''], 'filename', { type: 'jpg' });

      await postService.uploadImage(mockFile, postData[0].data);

      expect(spyFireStorage).toHaveBeenCalledTimes(1);
    });

    it('should call methods firebase', async () => {
      const spyFireStorage = spyOn(fireStorageMock, 'ref').and.callThrough()
      const spyGetDownloadURL = spyOn(AngularFireStorageReferenceMock.prototype, 'getDownloadURL').and.callThrough()
      const mockFile = new File([''], 'filename', { type: 'jpg' });

      await postService.uploadImage(mockFile, postData[0].data);

      expect(spyFireStorage).toHaveBeenCalledTimes(1);
      expect(spyGetDownloadURL).toHaveBeenCalledTimes(1);

    });

    it('should call saveData method', async () => {
      const spySaveData = spyOn(postService, 'saveData').and.callThrough()
      const mockFile = new File([''], 'filename', { type: 'jpg' });

      await postService.uploadImage(mockFile, postData[0].data);

      expect(spySaveData).toHaveBeenCalledTimes(1);
    });

    it('should call console.log for error add', async () => {
      const spyLog = spyOn(window.console, 'log')
      spyOn(AngularFireStorageMock.prototype, 'upload').and.throwError('Error')
      const mockFile = new File([''], 'filename', { type: 'jpg' });

      await postService.uploadImage(mockFile, postData[0].data);

      expect(spyLog).toHaveBeenCalledTimes(1);
      expect(spyLog).toHaveBeenCalledWith(new Error('Error'));
    });
  })
});
