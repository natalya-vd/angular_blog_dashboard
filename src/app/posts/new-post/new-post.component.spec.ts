import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { NewPostComponent } from './new-post.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  expectText,
  findEl,
  findEls,
  setFieldValue,
  uploadFile,
} from 'src/app/spec-helpers/element.spec-helper';
import { CategoryService } from 'src/app/services/category/category.service';
import { CategoryFromFirebase } from 'src/app/models/category';
import { of } from 'rxjs';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { PostService } from 'src/app/services/post/post.service';
import { Post } from 'src/app/models/post';
import { createCategoriesDataFromFirebase } from 'src/app/spec-helpers/category.data';
import { createPostDataFromForm } from 'src/app/spec-helpers/post.data';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';

describe('NewPostComponent', () => {
  let component: NewPostComponent;
  let fixture: ComponentFixture<NewPostComponent>;
  let categoryServiceSpy: jasmine.SpyObj<CategoryService>;
  let postServiceSpy: jasmine.SpyObj<PostService>;
  let route: ActivatedRoute;
  let categoriesData: CategoryFromFirebase[] = [];
  let postData: Post;

  function fillForm(file: File) {
    setFieldValue(fixture, 'title', postData.title);
    setFieldValue(fixture, 'permalink', postData.permalink);
    setFieldValue(fixture, 'categoryId', postData.category.categoryId);
    setFieldValue(fixture, 'excerpt', postData.excerpt);
    component.postForm.controls['content'].setValue(postData.content);
    uploadFile(file, fixture, 'image-preview');
  }

  function setupAddPost() {
    categoriesData = createCategoriesDataFromFirebase();
    postData = createPostDataFromForm();

    const categoryServiceSpyObj = jasmine.createSpyObj('CategoryService', [
      'getCategoriesList',
    ]);
    const postServiceSpyObj = jasmine.createSpyObj('PostService', {
      uploadImage: of('path'),
      getOnePost: of(undefined),
      saveData: Promise.resolve(),
      updatePost: Promise.resolve(),
    });

    TestBed.configureTestingModule({
      declarations: [NewPostComponent],
      imports: [
        FormsModule,
        ReactiveFormsModule,
        HttpClientTestingModule,
        AngularEditorModule,
        RouterTestingModule.withRoutes([]),
      ],
      providers: [
        {
          provide: CategoryService,
          useValue: categoryServiceSpyObj,
        },
        {
          provide: PostService,
          useValue: postServiceSpyObj,
        },
      ],
    }).compileComponents();

    categoryServiceSpy = TestBed.inject(
      CategoryService
    ) as jasmine.SpyObj<CategoryService>;
    postServiceSpy = TestBed.inject(PostService) as jasmine.SpyObj<PostService>;
    route = TestBed.inject(ActivatedRoute);
    categoryServiceSpy.getCategoriesList.and.returnValue(of(categoriesData));

    fixture = TestBed.createComponent(NewPostComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  }

  function setupEditPost() {
    categoriesData = createCategoriesDataFromFirebase();
    postData = createPostDataFromForm();

    const categoryServiceSpyObj = jasmine.createSpyObj('CategoryService', [
      'getCategoriesList',
    ]);
    const postServiceSpyObj = jasmine.createSpyObj('PostService', {
      uploadImage: of('path'),
      getOnePost: of(postData),
      saveData: Promise.resolve(),
      updatePost: Promise.resolve(),
    });

    TestBed.configureTestingModule({
      declarations: [NewPostComponent],
      imports: [
        FormsModule,
        ReactiveFormsModule,
        HttpClientTestingModule,
        AngularEditorModule,
        RouterTestingModule.withRoutes([]),
      ],
      providers: [
        {
          provide: CategoryService,
          useValue: categoryServiceSpyObj,
        },
        {
          provide: PostService,
          useValue: postServiceSpyObj,
        },
      ],
    }).compileComponents();

    categoryServiceSpy = TestBed.inject(
      CategoryService
    ) as jasmine.SpyObj<CategoryService>;
    postServiceSpy = TestBed.inject(PostService) as jasmine.SpyObj<PostService>;
    route = TestBed.inject(ActivatedRoute);

    categoryServiceSpy.getCategoriesList.and.returnValue(of(categoriesData));
    route.queryParams = of({
      id: '1',
    });

    fixture = TestBed.createComponent(NewPostComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  }

  it('should create', () => {
    setupEditPost();

    expect(component).toBeTruthy();
  });

  it('should add data in categories component', () => {
    setupEditPost();

    expect(component.categories).toEqual(categoriesData);
    expect(categoryServiceSpy.getCategoriesList).toHaveBeenCalledTimes(1);
  });

  it('should mode is "add" when init loading', () => {
    setupAddPost();

    expect(component.mode).toBe('add');
    expect(postServiceSpy.getOnePost).toHaveBeenCalledTimes(1);
    expect(postServiceSpy.getOnePost).toHaveBeenCalledWith(undefined);
  });

  it('should mode is "edit" when route.queryParams', () => {
    setupEditPost();

    expect(component.mode).toBe('edit');
    expect(postServiceSpy.getOnePost).toHaveBeenCalledTimes(1);
    expect(postServiceSpy.getOnePost).toHaveBeenCalledWith('1');
  });

  describe('onTitleChange()', () => {
    beforeEach(() => {
      setupEditPost();
    });

    it('should write the text in variable component', () => {
      const value = 'change permalink cool';
      const permalink = 'change-permalink-cool';

      setFieldValue(fixture, 'title', value);
      fixture.detectChanges();

      expect(component.postForm.controls['permalink'].value).toBe(permalink);
    });
  });

  describe('showPreview()', () => {
    beforeEach(() => {
      setupAddPost();
    });

    it('should select file', () => {
      const mockFile = new File([''], 'filename', { type: 'jpg' });
      const mockEvt = { target: { files: [mockFile] } } as unknown as Event;
      const mockReader: FileReader = jasmine.createSpyObj('FileReader', [
        'readAsDataURL',
        'onload',
      ]);
      spyOn(window, 'FileReader').and.returnValue(mockReader);

      component.showPreview(mockEvt);

      expect(window.FileReader).toHaveBeenCalled();
      expect(mockReader.readAsDataURL).toHaveBeenCalledOnceWith(mockFile); // Проходит даже если отправить сюда новый new File(), хотя не должен
      expect(component.selectedImg).toEqual(mockFile);
    });
  });

  describe('onSubmit()', () => {
    it('should call method postService saveData mode is "add"', fakeAsync(() => {
      setupAddPost();

      const mockFile = new File([''], 'filename', { type: 'jpg' });
      fillForm(mockFile);
      const spyReset = spyOn(component.postForm, 'reset').and.callThrough();
      findEl(fixture, 'form').triggerEventHandler('submit', {});

      tick();
      fixture.detectChanges();

      expect(postServiceSpy.saveData).toHaveBeenCalledTimes(1);
      expect(component.mode).toBe('add');
      expect(spyReset).toHaveBeenCalledTimes(1);
      expect(component.imgSrc).toBe(component.defaultImg);
    }));

    it('should call method postService updatePost mode is "edit"', fakeAsync(() => {
      setupEditPost();

      const mockFile = new File([''], 'filename', { type: 'jpg' });
      fillForm(mockFile);
      const spyReset = spyOn(component.postForm, 'reset').and.callThrough();
      findEl(fixture, 'form').triggerEventHandler('submit', {});

      tick();
      fixture.detectChanges();

      expect(postServiceSpy.updatePost).toHaveBeenCalledTimes(1);
      expect(component.mode).toBe('edit');
      expect(spyReset).toHaveBeenCalledTimes(1);
      expect(component.imgSrc).toBe(component.defaultImg);
    }));

    it('should do not call method postService uploadImage if form is invalid', () => {
      setupAddPost();

      component.onSubmit();

      expect(postServiceSpy.uploadImage).not.toHaveBeenCalled();
    });

    it('should call method postService uploadImage if form is valid', () => {
      setupAddPost();
      const mockFile = new File([''], 'filename', { type: 'jpg' });
      fillForm(mockFile);

      findEl(fixture, 'form').triggerEventHandler('submit', {});

      fixture.detectChanges();

      expect(postServiceSpy.uploadImage).toHaveBeenCalledTimes(1);
      expect(postServiceSpy.uploadImage).toHaveBeenCalledWith(
        component.selectedImg
      );
    });
  });

  describe('HTML template', () => {
    it('should disabled input permalink', () => {
      setupAddPost();
      const element = findEl(fixture, 'permalink')
        .nativeElement as HTMLInputElement;

      expect(element.disabled).toBe(true);
    });

    it('should call method showPreview', () => {
      setupAddPost();
      const showPreviewSpy = spyOn(component, 'showPreview');
      const element = findEl(fixture, 'image-preview');

      element.triggerEventHandler('change', {});

      expect(showPreviewSpy).toHaveBeenCalled();
    });

    it('should accept attribute in input type=file', () => {
      setupAddPost();
      const element = findEl(fixture, 'image-preview')
        .nativeElement as HTMLInputElement;

      expect(element.accept).toBe('image/*');
    });

    it('should render categories in option', () => {
      setupAddPost();
      const elements = findEls(fixture, 'option-category');

      for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        const option = element.nativeElement as HTMLOptionElement;

        expect(option.value).toBe(categoriesData[i].id);
        expect(option.textContent).toContain(categoriesData[i].data.category);
      }

      expect(elements.length).toBe(categoriesData.length);
    });

    it('should disabled button when invalid form', fakeAsync(() => {
      setupAddPost();
      tick();
      fixture.detectChanges();
      const button = findEl(fixture, 'button-save')
        .nativeElement as HTMLButtonElement;

      expect(button.disabled).toBe(true);
    }));

    it('should submit form when valid data', () => {
      setupAddPost();
      const onSubmitSpy = spyOn(component, 'onSubmit');
      const button = findEl(fixture, 'button-save')
        .nativeElement as HTMLButtonElement;
      const mockFile = new File([''], 'filename', { type: 'jpg' });
      fillForm(mockFile);

      findEl(fixture, 'form').triggerEventHandler('submit', {});
      fixture.detectChanges();

      expect(button.disabled).toBe(false);
      expect(onSubmitSpy).toHaveBeenCalledTimes(1);
    });

    it('should title mode is "add"', () => {
      setupAddPost();

      expectText(fixture, 'form-title', 'Add New Post');
    });

    it('should title mode is "edit"', () => {
      setupEditPost();

      expectText(fixture, 'form-title', 'Edit Post');
    });

    it('should titleButton mode is "add"', () => {
      setupAddPost();

      expectText(fixture, 'button-save', 'Save Post');
    });

    it('should titleButton mode is "edit"', () => {
      setupEditPost();

      expectText(fixture, 'button-save', 'Update Post');
    });

    xit('marks fields as required', () => {
      //Проверяю какие поля обязательные и что если они не заполнены (и было касание поля), то выдается сообщение с ошибкой
      // https://testing-angular.com/testing-complex-forms/#required-fields
    });

    xit('marks fields with minLength', () => {
      //проверяю поля у которых должна быть минимальная длина. Если она не соответствует, то должно быть сообщение об ошибке
    });
  });
});
