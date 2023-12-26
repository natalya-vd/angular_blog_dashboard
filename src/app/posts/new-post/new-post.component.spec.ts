import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewPostComponent } from './new-post.component';
import { FormsModule } from '@angular/forms';
import { findEl, setFieldValue } from 'src/app/spec-helpers/element.spec-helper';

describe('NewPostComponent', () => {
  let component: NewPostComponent;
  let fixture: ComponentFixture<NewPostComponent>;

  beforeEach(() => {
    TestBed
    .configureTestingModule({
      declarations: [NewPostComponent],
      imports: [FormsModule],
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewPostComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('onTitleChange()', () => {
    it('should write the text in variable component', () => {
      const value = 'change permalink cool'
      const permalink = 'change-permalink-cool'

      setFieldValue(fixture, 'title', value);
      fixture.detectChanges();

      expect(component.permalink).toBe(permalink)
    })
  });

  describe('HTML template', () => {
    it('should disabled input permalink', () => {
      const element = findEl(fixture, 'permalink').nativeElement as HTMLInputElement

      expect(element.disabled).toBe(true);
    })
  })
});
