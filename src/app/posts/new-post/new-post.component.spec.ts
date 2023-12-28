import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewPostComponent } from './new-post.component';
import { FormsModule } from '@angular/forms';
import { findEl, findEls, setFieldValue } from 'src/app/spec-helpers/element.spec-helper';
import { CategoryService } from 'src/app/services/category/category.service';
import { CategoryFromFirebase } from 'src/app/models/category';
import { of } from 'rxjs';

describe('NewPostComponent', () => {
  let component: NewPostComponent;
  let fixture: ComponentFixture<NewPostComponent>;
  let categoryServiceSpy: jasmine.SpyObj<CategoryService>
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

    const categoryServiceSpyObj = jasmine.createSpyObj('CategoryService', ['getCategoriesList'])

    TestBed
    .configureTestingModule({
      declarations: [NewPostComponent],
      imports: [FormsModule],
      providers: [
        {
          provide: CategoryService,
          useValue: categoryServiceSpyObj
        }
      ]
    })
    .compileComponents();

    categoryServiceSpy = TestBed.inject(CategoryService) as jasmine.SpyObj<CategoryService>

    fixture = TestBed.createComponent(NewPostComponent);
    component = fixture.componentInstance;

    categoryServiceSpy.getCategoriesList.and.returnValue(of(categoriesData));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should add data in categories component', () => {
    expect(component.categories).toEqual(categoriesData);
    expect(categoryServiceSpy.getCategoriesList).toHaveBeenCalledTimes(1);
  })

  describe('onTitleChange()', () => {
    it('should write the text in variable component', () => {
      const value = 'change permalink cool'
      const permalink = 'change-permalink-cool'

      setFieldValue(fixture, 'title', value);
      fixture.detectChanges();

      expect(component.permalink).toBe(permalink)
    })
  });

  describe('showPreview()', () => {
    it('should select file', () => {
      const mockFile = new File([''], 'filename', { type: 'jpg' });
      const mockEvt = { target: { files: [mockFile] } } as unknown as Event;
      const mockReader: FileReader = jasmine.createSpyObj('FileReader', ['readAsDataURL', 'onload']);
      spyOn(window, 'FileReader').and.returnValue(mockReader);

      component.showPreview(mockEvt);

      expect(window.FileReader).toHaveBeenCalled();
      expect(mockReader.readAsDataURL).toHaveBeenCalledOnceWith(mockFile); // Проходит даже если отправить сюда новый new File(), хотя не должен
      expect(component.selectedImg).toEqual(mockFile);
    })
  })

  describe('HTML template', () => {
    it('should disabled input permalink', () => {
      const element = findEl(fixture, 'permalink').nativeElement as HTMLInputElement

      expect(element.disabled).toBe(true);
    })

    it('should call method showPreview', () => {
      const showPreviewSpy = spyOn(component, 'showPreview');
      const element = findEl(fixture, 'image-preview')

      element.triggerEventHandler('change', {});

      expect(showPreviewSpy).toHaveBeenCalled();
    })

    it('should accept attribute in input type=file', () => {
      const element = findEl(fixture, 'image-preview').nativeElement as HTMLInputElement;

      expect(element.accept).toBe('image/*');
    })

    it('should render categories in option', () => {
      const elements = findEls(fixture, 'option-category');

      for(let i = 0; i < elements.length; i++) {
        const element = elements[i];
        const option = element.nativeElement as HTMLOptionElement;

        expect(option.value).toBe(categoriesData[i].id);
        expect(option.textContent).toContain(categoriesData[i].data.category);
      }

      expect(elements.length).toBe(categoriesData.length);
    })
  })
});
