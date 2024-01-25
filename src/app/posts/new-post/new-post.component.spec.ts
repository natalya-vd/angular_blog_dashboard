import { ComponentFixture, TestBed } from '@angular/core/testing';
import {HttpClientTestingModule} from '@angular/common/http/testing'

import { NewPostComponent } from './new-post.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { findEl, findEls, markFieldAsTouched, setFieldValue, uploadFile } from 'src/app/spec-helpers/element.spec-helper';
import { CategoryService } from 'src/app/services/category/category.service';
import { CategoryFromFirebase } from 'src/app/models/category';
import { of } from 'rxjs';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { PostService } from 'src/app/services/post/post.service';
import { Post } from 'src/app/models/post';

describe('NewPostComponent', () => {
  let component: NewPostComponent;
  let fixture: ComponentFixture<NewPostComponent>;
  let categoryServiceSpy: jasmine.SpyObj<CategoryService>
  let postServiceSpy: jasmine.SpyObj<PostService>
  let categoriesData: CategoryFromFirebase[] = []
  let postData: Post

  function fillForm(file: File) {
    setFieldValue(fixture, 'title', postData.title);
      setFieldValue(fixture, 'permalink', postData.permalink);
      setFieldValue(fixture, 'categoryId', postData.category.categoryId);
      setFieldValue(fixture, 'excerpt', postData.excerpt);
      component.postForm.controls['content'].setValue(postData.content)
      uploadFile(file, fixture, 'image-preview')
  }

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
    postData = {
      title: 'Cool title',
      permalink: 'Cool-title',
      category: {
        categoryId: categoriesData[0].id,
        category: categoriesData[0].data.category
      },
      postImgPath: '',
      excerpt: 'excerpt jkdjkjfdkg fkdjfkjfkfdjkgjkfdj fkdkfdkfkdfkdkfdflkdlfkdfkfldklf',
      content: 'content',
      isFeatured: false,
      views: 0,
      status: 'new',
      createdAt: new Date()
    }

    const categoryServiceSpyObj = jasmine.createSpyObj('CategoryService', ['getCategoriesList'])
    const postServiceSpyObj = jasmine.createSpyObj('PostService', ['uploadImage'])

    TestBed
    .configureTestingModule({
      declarations: [NewPostComponent],
      imports: [
        FormsModule,
        ReactiveFormsModule,
        HttpClientTestingModule,
        AngularEditorModule
      ],
      providers: [
        {
          provide: CategoryService,
          useValue: categoryServiceSpyObj
        },
        {
          provide: PostService,
          useValue: postServiceSpyObj
        }
      ]
    })
    .compileComponents();

    categoryServiceSpy = TestBed.inject(CategoryService) as jasmine.SpyObj<CategoryService>
    postServiceSpy = TestBed.inject(PostService) as jasmine.SpyObj<PostService>

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

      expect(component.postForm.controls['permalink'].value).toBe(permalink)
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

  describe('onSubmit()', () => {
    it('should do not call method postService uploadImage if form is invalid', async () => {
      await component.onSubmit()

      expect(postServiceSpy.uploadImage).not.toHaveBeenCalled()
    })

    it('should call method postService uploadImage if form is valid', () => {
      const mockFile = new File([''], 'filename', { type: 'jpg' });
      // setFieldValue(fixture, 'title', postData.title);
      // setFieldValue(fixture, 'permalink', postData.permalink);
      // setFieldValue(fixture, 'categoryId', postData.category.categoryId);
      // setFieldValue(fixture, 'excerpt', postData.excerpt);
      // component.postForm.controls['content'].setValue(postData.content)
      // uploadFile(mockFile, fixture, 'image-preview')
      fillForm(mockFile)

      findEl(fixture, 'form').triggerEventHandler('submit', {});

      fixture.detectChanges();

      expect(postServiceSpy.uploadImage).toHaveBeenCalledTimes(1)
      expect(postServiceSpy.uploadImage).toHaveBeenCalledWith(component.selectedImg, {
        ...postData, createdAt: jasmine.objectContaining(postData.createdAt)
      })
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

    it('should disabled button when invalid form', () => {
      const button = findEl(fixture, 'button-save').nativeElement as HTMLButtonElement;

      expect(button.disabled).toBe(true);
    })

    it('should submit form when valid data', () => {
      const onSubmitSpy = spyOn(component, 'onSubmit')
      const button = findEl(fixture, 'button-save').nativeElement as HTMLButtonElement;
      const mockFile = new File([''], 'filename', { type: 'jpg' });
      fillForm(mockFile);

      findEl(fixture, 'form').triggerEventHandler('submit', {});
      fixture.detectChanges();

      expect(button.disabled).toBe(false);
      expect(onSubmitSpy).toHaveBeenCalledTimes(1)
    })

    xit('marks fields as required', () => {
      //Проверяю какие поля обязательные и что если они не заполнены (и было касание поля), то выдается сообщение с ошибкой
      // https://testing-angular.com/testing-complex-forms/#required-fields
    })

    xit('marks fields with minLength', ()=>{
      //проверяю поля у которых должна быть минимальная длина. Если она не соответствует, то должно быть сообщение об ошибке
    })
  })
});
