import { TestBed } from '@angular/core/testing';
import { ToastrService } from 'ngx-toastr';
import { AngularFireAuth } from '@angular/fire/compat/auth';

import { AuthService } from './auth.service';
import { createAngularFireAuthMock } from 'src/app/spec-helpers/firestore-mock';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

describe('AuthService', () => {
  let authService: AuthService;
  let toastrServiceSpy: jasmine.SpyObj<ToastrService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let firestoreAuthMock: AngularFireAuth;

  beforeEach(() => {
    const toastrServiceSpyObj = jasmine.createSpyObj('ToastrService', [
      'success',
      'error',
    ]);
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
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
        {
          provide: Router,
          useValue: routerSpyObj,
        },
      ],
    });

    authService = TestBed.inject(AuthService);
    firestoreAuthMock = TestBed.inject(AngularFireAuth);
    toastrServiceSpy = TestBed.inject(
      ToastrService
    ) as jasmine.SpyObj<ToastrService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
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

    it('should navigate in "/" for success add', async () => {
      const email = 'email@email.com';
      const password = 'password';

      await authService.login(email, password);

      expect(routerSpy.navigate).toHaveBeenCalledTimes(1);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should call console.log for error add', async () => {
      spyOn(firestoreAuthMock, 'signInWithEmailAndPassword').and.returnValue(
        Promise.reject('Error')
      );
      const email = 'email@email.com';
      const password = 'password';

      await authService.login(email, password);

      expect(toastrServiceSpy.error).toHaveBeenCalledTimes(1);
      expect(toastrServiceSpy.error).toHaveBeenCalledWith('Error');
    });
  });
});
