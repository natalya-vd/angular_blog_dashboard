import { of } from 'rxjs';

interface IDataItem {
  id: string;
  data: Record<string, any>;
}

export class AngularFirestoreDocumentMock {
  data: IDataItem[];
  id: string;

  constructor(data: IDataItem[], id: string) {
    const splitId = id.split('/');
    this.id = splitId[splitId.length - 1];

    this.data = data;
  }

  update<T>(_data: T) {
    return new Promise((resolve, reject) => {
      if (!this.data.some(item => item.id === this.id)) {
        return reject('Error');
      }

      return resolve({ id: this.id });
    });
  }

  delete(): Promise<void> {
    return Promise.resolve();
  }

  valueChanges() {
    return of(this.data.find(item => item.id === this.id)?.data);
  }
}

export class AngularFirestoreCollectionMock {
  data: IDataItem[];
  constructor(data: IDataItem[]) {
    this.data = data;
  }

  snapshotChanges() {
    const responseData = this.data.map(item => ({
      payload: {
        doc: {
          id: item.id,
          data() {
            return item.data;
          },
        },
      },
      type: 'added',
    }));

    return of(responseData);
  }

  add<T>(_data: T) {
    return new Promise(resolve => {
      return resolve({ id: '1' });
    });
  }

  doc(id: string) {
    return new AngularFirestoreDocumentMock(this.data, id);
  }
}

class AngularFirestoreMock {
  data: IDataItem[];
  constructor(data: IDataItem[]) {
    this.data = data;
  }

  collection(_path: string) {
    return new AngularFirestoreCollectionMock(this.data);
  }

  doc(id: string) {
    return new AngularFirestoreDocumentMock(this.data, id);
  }
}

export const createFirestoreMock = (data: IDataItem[]) => {
  return new AngularFirestoreMock(data);
};

//---------- Storage --------
export class AngularFireStorageReferenceMock {
  path: string;
  constructor(path: string) {
    this.path = path;
  }

  getDownloadURL() {
    return of(this.path);
  }

  delete() {
    return Promise.resolve();
  }
}

export class AngularFireStorageMock {
  readonly storage = {
    refFromURL(url: string) {
      return new AngularFireStorageReferenceMock(url);
    },
  };

  upload(path: string, _data: any) {
    return Promise.resolve({});
  }

  ref(path: string) {
    return new AngularFireStorageReferenceMock(path);
  }
}

export const createFireStorageMock = () => {
  return new AngularFireStorageMock();
};

//---------- AngularFireAuth --------
export class AngularFireAuthMock {
  authState = of({});

  signInWithEmailAndPassword(email: string, _password: string) {
    return Promise.resolve({
      kind: 'kind',
      localId: 'localId',
      email,
      displayName: '',
      idToken: 'idToken',
      registered: true,
      refreshToken: 'refreshToken',
      expiresIn: '3600',
    });
  }
}

export const createAngularFireAuthMock = () => {
  return new AngularFireAuthMock();
};
