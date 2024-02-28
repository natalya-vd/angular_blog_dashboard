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

    it('should navigate in "/" for success login', async () => {
      const email = 'email@email.com';
      const password = 'password';

      await authService.login(email, password);

      expect(routerSpy.navigate).toHaveBeenCalledTimes(1);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should loggedIn is true for success login', async () => {
      const email = 'email@email.com';
      const password = 'password';

      await authService.login(email, password);

      authService.loggedIn.subscribe(value => {
        expect(value).toBe(true);
      });
    });

    it('should call toastrService.error for error login', async () => {
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

  describe('logout()', () => {
    it('should call firebase methods', async () => {
      const spyFirebase = spyOn(firestoreAuthMock, 'signOut').and.callThrough();

      await authService.logout();

      expect(spyFirebase).toHaveBeenCalledTimes(1);
    });

    it('should call toastrService.success for success logout', async () => {
      await authService.logout();

      expect(toastrServiceSpy.success).toHaveBeenCalledTimes(1);
      expect(toastrServiceSpy.success).toHaveBeenCalledWith(
        'User Logged Out Successfully'
      );
    });

    it('should navigate in "/login" for success logout', async () => {
      await authService.logout();

      expect(routerSpy.navigate).toHaveBeenCalledTimes(1);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should loggedIn is false for success logout', async () => {
      await authService.logout();

      authService.loggedIn.subscribe(value => {
        expect(value).toBe(false);
      });
    });

    it('should call toastrService.error for error logout', async () => {
      spyOn(firestoreAuthMock, 'signOut').and.returnValue(
        Promise.reject('Error')
      );

      await authService.logout();

      expect(toastrServiceSpy.error).toHaveBeenCalledTimes(1);
      expect(toastrServiceSpy.error).toHaveBeenCalledWith('Error');
    });
  });

  describe('isLoggedIn()', () => {
    it('should return loggedIn.asObservable', () => {
      const isLoggedIn$ = authService.isLoggedIn();

      isLoggedIn$.subscribe(val => {
        expect(typeof val).toBe('boolean');
      });
    });
  });
});
