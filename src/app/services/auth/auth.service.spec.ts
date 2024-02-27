import { TestBed } from '@angular/core/testing';
import { ToastrService } from 'ngx-toastr';
import { AngularFireAuth } from '@angular/fire/compat/auth';

import { AuthService } from './auth.service';
import { createAngularFireAuthMock } from 'src/app/spec-helpers/firestore-mock';

describe('AuthService', () => {
  let authService: AuthService;
  let toastrServiceSpy: jasmine.SpyObj<ToastrService>;
  let firestoreAuthMock: AngularFireAuth;

  beforeEach(() => {
    const toastrServiceSpyObj = jasmine.createSpyObj('ToastrService', [
      'success',
    ]);

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        {
          provide: AngularFireAuth,
          useValue: createAngularFireAuthMock(),
        },
        {
          provide: ToastrService,
          useValue: toastrServiceSpyObj,
        },
      ],
    });

    authService = TestBed.inject(AuthService);
    firestoreAuthMock = TestBed.inject(AngularFireAuth);
    toastrServiceSpy = TestBed.inject(
      ToastrService
    ) as jasmine.SpyObj<ToastrService>;
  });

  it('should be created', () => {
    expect(authService).toBeTruthy();
  });

  describe('login()', () => {
    it('should call firebase methods', async () => {
      const spyFirebase = spyOn(
        firestoreAuthMock,
        'signInWithEmailAndPassword'
      ).and.callThrough();
      const email = 'email@email.com';
      const password = 'password';

      await authService.login(email, password);

      expect(spyFirebase).toHaveBeenCalledTimes(1);
      expect(spyFirebase).toHaveBeenCalledWith(email, password);
    });

    it('should call toastrService.success for success login', async () => {
      const email = 'email@email.com';
      const password = 'password';

      await authService.login(email, password);

      expect(toastrServiceSpy.success).toHaveBeenCalledTimes(1);
      expect(toastrServiceSpy.success).toHaveBeenCalledWith(
        'Logged In Successfully'
      );
    });

    it('should call console.log for error add', async () => {
      const spyLog = spyOn(window.console, 'log');
      spyOn(firestoreAuthMock, 'signInWithEmailAndPassword').and.throwError(
        'Error'
      );
      const email = 'email@email.com';
      const password = 'password';

      await authService.login(email, password);

      expect(spyLog).toHaveBeenCalledTimes(1);
      expect(spyLog).toHaveBeenCalledWith(new Error('Error'));
    });
  });
});
