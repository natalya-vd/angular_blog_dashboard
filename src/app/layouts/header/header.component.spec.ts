import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderComponent } from './header.component';
import { AuthService } from 'src/app/services/auth/auth.service';
import { of } from 'rxjs';
import { findEl } from 'src/app/spec-helpers/element.spec-helper';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  function setupIsLogin() {
    const authServiceSpyObj = jasmine.createSpyObj('AuthService', [
      'logout',
      'isLoggedIn',
    ]);

    TestBed.configureTestingModule({
      declarations: [HeaderComponent],
      providers: [
        {
          provide: AuthService,
          useValue: authServiceSpyObj,
        },
      ],
    });

    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    authServiceSpy.isLoggedIn.and.returnValue(of(true));
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  }

  function setupNotIsLogin() {
    const authServiceSpyObj = jasmine.createSpyObj('AuthService', [
      'logout',
      'isLoggedIn',
    ]);

    TestBed.configureTestingModule({
      declarations: [HeaderComponent],
      providers: [
        {
          provide: AuthService,
          useValue: authServiceSpyObj,
        },
      ],
    });

    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    authServiceSpy.isLoggedIn.and.returnValue(of(false));
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  }

  it('should create', () => {
    setupIsLogin();

    expect(component).toBeTruthy();
  });

  it('should isLoggedIn$ is true', () => {
    setupIsLogin();

    component.isLoggedIn$.subscribe(val => {
      expect(val).toBe(true);
    });
  });

  it('should isLoggedIn$ is false', () => {
    setupNotIsLogin();

    component.isLoggedIn$.subscribe(val => {
      expect(val).toBe(false);
    });
  });

  describe('onLogout()', () => {
    it('should call authService method', () => {
      setupIsLogin();

      component.onLogout();

      expect(authServiceSpy.logout).toHaveBeenCalledTimes(1);
    });
  });

  describe('HTML template', () => {
    it('should visible button logout when user is loggedIn', () => {
      setupIsLogin();

      const element = findEl(fixture, 'loggedIn')
        ?.nativeElement as HTMLDivElement;

      expect(element).toBeDefined();
    });

    it('should do not visible button logout when user is loggedOut', () => {
      setupNotIsLogin();

      const element = findEl(fixture, 'loggedIn')
        ?.nativeElement as HTMLDivElement;

      expect(element).not.toBeDefined();
    });
  });
});
