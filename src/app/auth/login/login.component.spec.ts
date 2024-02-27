import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';

import { LoginComponent } from './login.component';
import { AuthService } from 'src/app/services/auth/auth.service';
import {
  findEl,
  setFieldValue,
} from 'src/app/spec-helpers/element.spec-helper';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let email: string;
  let password: string;

  function fillForm() {
    setFieldValue(fixture, 'email', email);
    setFieldValue(fixture, 'password', password);
  }

  beforeEach(async () => {
    const authServiceSpyObj = jasmine.createSpyObj('AuthService', ['login']);
    email = 'email@email.com';
    password = 'password';

    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [FormsModule],
      providers: [
        {
          provide: AuthService,
          useValue: authServiceSpyObj,
        },
      ],
    }).compileComponents();

    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('onSubmit()', () => {
    it('should call login method authService if form is valid', () => {
      fillForm();

      findEl(fixture, 'form').triggerEventHandler('submit', {});
      fixture.detectChanges();

      expect(authServiceSpy.login).toHaveBeenCalledTimes(1);
      expect(authServiceSpy.login).toHaveBeenCalledWith(email, password);
    });

    it('should do not call login method authService if form is invalid', async () => {
      await component.onSubmit();

      expect(authServiceSpy.login).not.toHaveBeenCalled();
    });
  });

  describe('HTML template', () => {
    it('should button disabled true', () => {
      const button = findEl(fixture, 'button-submit')
        .nativeElement as HTMLButtonElement;
      fixture.detectChanges();

      expect(button.disabled).toBe(true);
    });

    it('should button disabled false', () => {
      fillForm();

      const button = findEl(fixture, 'button-submit')
        .nativeElement as HTMLButtonElement;
      fixture.detectChanges();

      expect(button.disabled).toBe(false);
    });
  });
});
