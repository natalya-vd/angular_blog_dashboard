import { TestBed } from '@angular/core/testing';

import { CategoryService } from './category.service';
import { of } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Category, CategoryFromFirebase } from 'src/app/models/category';

class AngularFirestoreDocumentMock {
  update(data: Category) {
    return new Promise((resolve, reject) => {
      if(data.category === 'Error') {
        return reject('Error')
      }

      return resolve({id: '1'})
    })
  }
}

class AngularFirestoreCollectionMock {
  snapshotChanges() {
    return of([
      {
        payload: {
          doc: {
            id: '1',
            data() {
              return {category: 'Category 1'}
            }
          }
        },
        type: "added"
      },
      {
        payload: {
          doc: {
            id: '2',
            data() {
              return {category: 'Category 2'}
            }
          }
        },
        type: "added"
      },
      {
        payload: {
          doc: {
            id: '3',
            data() {
              return {category: 'Category 3'}
            }
          }
        },
        type: "added"
      },
    ])
  }

  add(data: Category) {
    return new Promise((resolve, reject) => {
      if(data.category === 'Error') {
        return reject('Error')
      }

      return resolve({id: '1'})
    })
  }

  doc(id: string) {
    return new AngularFirestoreDocumentMock()
  }
}

class AngularFirestoreMock {
  collection(path: string) {
    return new AngularFirestoreCollectionMock()
  }
}

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
          useClass: AngularFirestoreMock
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

      await categoryService.saveData({category: 'Error'})

      expect(spyLog).toHaveBeenCalledTimes(1);
      expect(spyLog).toHaveBeenCalledWith('Error');
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
      const spyFirebase = spyOn(firestoreMock, 'collection').and.callThrough()
      const spyUpdate = spyOn(AngularFirestoreDocumentMock.prototype, 'update').and.callThrough()
      const data = {category: 'Category 1'}

      await categoryService.updateData('1', data)

      expect(spyFirebase).toHaveBeenCalledTimes(1);
      expect(spyUpdate).toHaveBeenCalledTimes(1);
      expect(spyUpdate).toHaveBeenCalledWith(data)
    })

    it('should call toastrService.success for success add', async() => {

      await categoryService.updateData('1', {category: 'Category 1'})

      expect(toastrServiceSpy.success).toHaveBeenCalledTimes(1);
      expect(toastrServiceSpy.success).toHaveBeenCalledWith('Data Update Successfully!');
    })

    it('should call console.log for error add', async() => {
      const spyLog = spyOn(window.console, 'log')

      await categoryService.updateData('1', {category: 'Error'})

      expect(spyLog).toHaveBeenCalledTimes(1);
      expect(spyLog).toHaveBeenCalledWith('Error');
    })
  })
});
