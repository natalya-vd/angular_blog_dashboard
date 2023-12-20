import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';

import { CategoriesComponent } from './categories.component';
import { CategoryService } from '../services/category/category.service';
import { CategoryFromFirebase } from '../models/category';
import { click, expectText, findEl, findEls, makeClickEvent, setFieldValue } from '../spec-helpers/element.spec-helper';

describe('CategoriesComponent', () => {
  let component: CategoriesComponent;
  let fixture: ComponentFixture<CategoriesComponent>;
  let categoryServiceSpy: jasmine.SpyObj<CategoryService>
  let categoriesData: CategoryFromFirebase[] = []

  beforeEach(async () => {
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

    const categoryServiceSpyObj = jasmine.createSpyObj('CategoryService', ['saveData', 'getCategoriesList', 'updateData'])

    await TestBed
      .configureTestingModule({
        declarations: [CategoriesComponent],
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

    fixture = TestBed.createComponent(CategoriesComponent);
    component = fixture.componentInstance;

    categoryServiceSpy.getCategoriesList.and.returnValue(of(categoriesData))

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should add data in categoryArray component', () => {
    expect(component.categoryArray).toEqual(categoriesData);
    expect(categoryServiceSpy.getCategoriesList).toHaveBeenCalledTimes(1);
  })

  it('should mode is "add" when init loading', () => {
    expect(component.mode).toBe('add')
  })

  describe('onSubmit()', () => {
    it('should call method categoryService saveData mode is "add"', () => {
      const value = 'Category test'
      const spyReset = spyOn(component.categoryForm, 'reset').and.callThrough();

      setFieldValue(fixture, 'new-category', value);
      findEl(fixture, 'form').triggerEventHandler('submit', {});
      fixture.detectChanges();

      expect(categoryServiceSpy.saveData).toHaveBeenCalledTimes(1);
      expect(categoryServiceSpy.saveData).toHaveBeenCalledWith({category: value});
      expect(spyReset).toHaveBeenCalledTimes(1);
      expect(component.mode).toBe('add')
    })

    it('should call method categoryService updateData mode is "edit"', () => {
      const value = 'Category test'
      const spyReset = spyOn(component.categoryForm, 'reset').and.callThrough();

      component.onEdit(categoriesData[0]);
      setFieldValue(fixture, 'new-category', value);
      findEl(fixture, 'form').triggerEventHandler('submit', {});
      fixture.detectChanges();

      expect(categoryServiceSpy.updateData).toHaveBeenCalledTimes(1);
      expect(categoryServiceSpy.updateData).toHaveBeenCalledWith(categoriesData[0].id, {category: value});
      expect(spyReset).toHaveBeenCalledTimes(1);
      expect(component.mode).toBe('add')
    })
  })

  describe('onEdit()', () => {
    it('should change formCategoryValue', () => {
      component.onEdit(categoriesData[0]);

      expect(component.formCategoryValue).toBe(categoriesData[0].data.category)
    })

    it('should change mode', () => {
      component.onEdit(categoriesData[0]);

      expect(component.mode).toBe('edit');
    })

    it('should change updateCategoryId', () => {
      component.onEdit(categoriesData[0]);

      expect(component.updateCategoryId).toBe(categoriesData[0].id);
    })
  })

  describe('HTML template', () => {
    it('should button disabled true', () => {
      const button = findEl(fixture, 'button-submit').nativeElement as HTMLButtonElement;
      fixture.detectChanges();

      expect(button.disabled).toBe(true);
    })

    it('should button disabled false', () => {
      const value = 'Category test'
      setFieldValue(fixture, 'new-category', value);

      const button = findEl(fixture, 'button-submit').nativeElement as HTMLButtonElement;
      fixture.detectChanges();

      expect(button.disabled).toBe(false);
    })

    it('should render row category', () => {
      const elements = findEls(fixture, 'row-category');

      expect(elements.length).toBe(categoriesData.length);
    })

    it('should title mode is "add"', () => {
      expectText(fixture, 'form-title', 'New Categories')
    })

    it('should title mode is "edit"', () => {
      component.onEdit(categoriesData[0]);
      fixture.detectChanges();

      expectText(fixture, 'form-title', 'Edit Category');
    })

    it('should titleButton mode is "add"', () => {
      expectText(fixture, 'button-submit', 'Add')
    })

    it('should titleButton mode is "edit"', () => {
      component.onEdit(categoriesData[0]);
      fixture.detectChanges();

      expectText(fixture, 'button-submit', 'Edit');
    })

    it('should call onEdit method when click button edit', () => {
      const spyOnEdit = spyOn(component, 'onEdit');
      const elementsButtons = findEls(fixture, 'button-edit');

      for(let i = 0; i < elementsButtons.length; i++) {
        const element = elementsButtons[i]
        const event = makeClickEvent(element.nativeElement);
        element.triggerEventHandler('click', event);

        expect(spyOnEdit).toHaveBeenCalledWith(categoriesData[i]);
      }

      expect(spyOnEdit).toHaveBeenCalledTimes(categoriesData.length);
    })
  })
});
