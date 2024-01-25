import { of } from "rxjs";

interface IDataItem {
  id: string
  data: Record<string, any>
}

export class AngularFirestoreDocumentMock {
  data: IDataItem[]
  id: string

  constructor(data: IDataItem[], id: string) {
    const splitId = id.split('/')
    this.id = splitId[splitId.length - 1]

    this.data = data
  }

  update<T>(_data: T) {
    return new Promise((resolve, reject) => {
      if(!this.data.some(item => item.id === this.id)) {
        return reject('Error')
      }

      return resolve({id: '1'})
    })
  }

  delete(): Promise<void> {
    return Promise.resolve();
  }
}

export class AngularFirestoreCollectionMock {
  data: IDataItem[]
  constructor(data: IDataItem[]) {
    this.data = data
  }

  snapshotChanges() {
    const responseData = this.data.map((item) => ({
      payload: {
        doc: {
          id: item.id,
          data() {
            return item.data
          }
        }
      },
      type: "added"
    }))

    return of(responseData)
  }

  add<T>(_data: T) {
    return new Promise((resolve) => {
      return resolve({id: '1'})
    })
  }

  doc(id: string) {
    return new AngularFirestoreDocumentMock(this.data, id)
  }
}

class AngularFirestoreMock {
  data: IDataItem[]
  constructor(data: IDataItem[]) {
    this.data = data
  }

  collection(_path: string) {
    return new AngularFirestoreCollectionMock(this.data)
  }

  doc(id: string) {
    return new AngularFirestoreDocumentMock(this.data, id)
  }
}

export const createFirestoreMock = (data: IDataItem[]) => {
  return new AngularFirestoreMock(data)
}

//---------- Storage --------
export class AngularFireStorageReferenceMock {
  path: string
  constructor(path: string) {
    this.path = path
  }

  getDownloadURL() {
    return of(this.path)
  }
}

export class AngularFireStorageMock {
  upload(path: string, _data: any) {
    return new Promise((resolve) => {
      return resolve(path)
    })
  }

  ref(path: string) {
    return new AngularFireStorageReferenceMock(path)
  }
}

export const createFireStorageMock = () => {
  return new AngularFireStorageMock()
}
