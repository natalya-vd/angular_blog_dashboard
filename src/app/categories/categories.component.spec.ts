import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';

import { CategoriesComponent } from './categories.component';
import { CategoryService } from '../services/category/category.service';
import { CategoryFromFirebase } from '../models/category';
import { click, findEl, findEls, setFieldValue } from '../spec-helpers/element.spec-helper';

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

    const categoryServiceSpyObj = jasmine.createSpyObj('CategoryService', ['saveData', 'getCategoriesList'])

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

  describe('onSubmit()', () => {
    it('should call method categoryService saveData', () => {
      const value = 'Category test'
      const spyReset = spyOn(component.categoryForm, 'reset').and.callThrough();

      setFieldValue(fixture, 'new-category', value);
      findEl(fixture, 'form').triggerEventHandler('submit', {});
      fixture.detectChanges();

      expect(categoryServiceSpy.saveData).toHaveBeenCalledTimes(1);
      expect(categoryServiceSpy.saveData).toHaveBeenCalledWith({category: value});
      expect(spyReset).toHaveBeenCalledTimes(1);
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
  })
});
