import { TestBed } from '@angular/core/testing';

import { CategoryService } from './category.service';
import { ToastrService } from 'ngx-toastr';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { CategoryFromFirebase } from 'src/app/models/category';
import { AngularFirestoreCollectionMock, AngularFirestoreDocumentMock, createFirestoreMock } from 'src/app/spec-helpers/firestore-mock';



describe('CategoryService', () => {
  let categoryService: CategoryService;
  let firestoreMock: AngularFirestore
  let toastrServiceSpy: jasmine.SpyObj<ToastrService>
  let categoriesData: CategoryFromFirebase[] = []

  beforeEach(() => {
    categoriesData = [
      {
        id: '1',
        data: {category: 'Category 1'}
      },
      {
        id: '2',
        data: {category: 'Category 2'}
      },
      {
        id: '3',
        data: {category: 'Category 3'}
      },
    ]

    const toastrServiceSpyObj = jasmine.createSpyObj('ToastrService', ['success'])

    TestBed.configureTestingModule({
      providers: [
        CategoryService,
        {
          provide: AngularFirestore,
          useValue: createFirestoreMock(categoriesData)
        },
        {
          provide: ToastrService,
          useValue: toastrServiceSpyObj
        }
      ]
    });

    categoryService = TestBed.inject(CategoryService);
    firestoreMock = TestBed.inject(AngularFirestore);
    toastrServiceSpy = TestBed.inject(ToastrService) as jasmine.SpyObj<ToastrService>
  });

  it('should be created', () => {
    expect(categoryService).toBeTruthy();
  });

  describe('saveData()', () => {
    it('should call firebase methods', async () => {
      const spyFirebase = spyOn(firestoreMock, 'collection').and.callThrough()
      const spyAdd = spyOn(AngularFirestoreCollectionMock.prototype, 'add').and.callThrough()
      const data = {category: 'Category 1'}

      await categoryService.saveData(data)

      expect(spyFirebase).toHaveBeenCalledTimes(1);
      expect(spyAdd).toHaveBeenCalledTimes(1);
      expect(spyAdd).toHaveBeenCalledWith(data)
    });

    it('should call toastrService.success for success add', async () => {
      await categoryService.saveData({category: 'Category 1'})

      expect(toastrServiceSpy.success).toHaveBeenCalledTimes(1);
      expect(toastrServiceSpy.success).toHaveBeenCalledWith('Data Insert Successfully!');
    })

    it('should call console.log for error add', async () => {
      const spyLog = spyOn(window.console, 'log')
      spyOn(AngularFirestoreCollectionMock.prototype, 'add').and.throwError('Error')

      await categoryService.saveData({category: 'Error'})

      expect(spyLog).toHaveBeenCalledTimes(1);
      expect(spyLog).toHaveBeenCalledWith(new Error('Error'));
    })
  })

  describe('getCategoriesList()', () => {
    it('should call firebase methods', () => {
      const spyFirebase = spyOn(firestoreMock, 'collection').and.callThrough()
      const spySnapshotChanges = spyOn(AngularFirestoreCollectionMock.prototype, 'snapshotChanges').and.callThrough()

      categoryService.getCategoriesList()

      expect(spyFirebase).toHaveBeenCalledTimes(1);
      expect(spySnapshotChanges).toHaveBeenCalledTimes(1);
    });

    it('should return observable with categories', (done: DoneFn) => {
      categoryService.getCategoriesList().subscribe((data) => {
        expect(data).toEqual(categoriesData)
        done()
      })
    })
  })

  describe('updateData()', () => {
    it('should call firebase methods', async() => {
      const spyFirebase = spyOn(firestoreMock, 'doc').and.callThrough()
      const spyUpdate = spyOn(AngularFirestoreDocumentMock.prototype, 'update').and.callThrough()
      const data = {category: 'Category 1'}

      await categoryService.updateData('1', data)

      expect(spyFirebase).toHaveBeenCalledTimes(1);
      expect(spyUpdate).toHaveBeenCalledTimes(1);
      expect(spyUpdate).toHaveBeenCalledWith(data)
    })

    it('should call toastrService.success when success add', async() => {
      await categoryService.updateData('1', {category: 'Category 1'})

      expect(toastrServiceSpy.success).toHaveBeenCalledTimes(1);
      expect(toastrServiceSpy.success).toHaveBeenCalledWith('Data Update Successfully!');
    })

    it('should call console.log when error add', async() => {
      const spyLog = spyOn(window.console, 'log')

      await categoryService.updateData('10', {category: 'Error'})

      expect(spyLog).toHaveBeenCalledTimes(1);
      expect(spyLog).toHaveBeenCalledWith('Error');
    })
  })

  describe('deleteData()', () => {
    it('should call firebase methods', async() => {
      const spyFirebase = spyOn(firestoreMock, 'doc').and.callThrough()
      const spyDelete = spyOn(AngularFirestoreDocumentMock.prototype, 'delete').and.callThrough();

      await categoryService.deleteData('1');

      expect(spyFirebase).toHaveBeenCalledTimes(1);
      expect(spyDelete).toHaveBeenCalledTimes(1);
    });

    it('should call toastrService.success when success delete', async() => {
      await categoryService.deleteData('1');

      expect(toastrServiceSpy.success).toHaveBeenCalledTimes(1);
      expect(toastrServiceSpy.success).toHaveBeenCalledWith('Data Deleted!');
    });

    it('should call console.log when error delete', async() => {
      const spyLog = spyOn(window.console, 'log')
      spyOn(AngularFirestoreDocumentMock.prototype, 'delete').and.throwError('Error');

      await categoryService.deleteData('1');

      expect(spyLog).toHaveBeenCalledTimes(1);
      expect(spyLog).toHaveBeenCalledWith(new Error('Error'));

    });
  })
});
