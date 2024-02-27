import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { AllPostComponent } from './all-post.component';
import { PostService } from 'src/app/services/post/post.service';
import { PostFromFirebase, PostFromFirebaseRaw } from 'src/app/models/post';
import { createPostsDataFromFirebaseRaw } from 'src/app/spec-helpers/post.data';
import { PostAdapterService } from 'src/app/services/post/post.adapter.service';
import { RouterTestingModule } from '@angular/router/testing';
import { findEls, makeClickEvent } from 'src/app/spec-helpers/element.spec-helper';

describe('AllPostComponent', () => {
  let component: AllPostComponent;
  let postAdapterService: PostAdapterService;
  let fixture: ComponentFixture<AllPostComponent>;
  let postServiceSpy: jasmine.SpyObj<PostService>
  let postData: PostFromFirebase[] = []
  let postDataRaw: PostFromFirebaseRaw[] = []

  beforeEach(() => {
    postDataRaw = createPostsDataFromFirebaseRaw()


    const postServiceSpyObj = jasmine.createSpyObj('PostService', ['getPostsList', 'deleteImage', 'deletePost', 'markFeatured'])

    TestBed.configureTestingModule({
      declarations: [AllPostComponent],
      imports: [RouterTestingModule],
      providers: [
        PostAdapterService,
        {
          provide: PostService,
          useValue: postServiceSpyObj
        }
      ]
    })
    .compileComponents();

    postAdapterService = TestBed.inject(PostAdapterService);
    postServiceSpy = TestBed.inject(PostService) as jasmine.SpyObj<PostService>

    fixture = TestBed.createComponent(AllPostComponent);
    component = fixture.componentInstance;
    postData = postDataRaw.map((item) => ({
      id: item.id,
      data: postAdapterService.formatDateFromFirebase(item.data)
    }))
    postServiceSpy.getPostsList.and.returnValue(of(postData));

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should add data in posts component', () => {
    expect(component.posts).toEqual(postData);
    expect(postServiceSpy.getPostsList).toHaveBeenCalledTimes(1);
  })

  describe('onDelete()', () => {
    it('should call method postServiceSpy deleteImage & deletePost is confirm true', async () => {
      const confirmSpy = spyOn(window, 'confirm').and.returnValue(true)

      await component.onDelete(postData[0]);

      expect(confirmSpy).toHaveBeenCalled();
      expect(postServiceSpy.deleteImage).toHaveBeenCalledTimes(1)
      expect(postServiceSpy.deleteImage).toHaveBeenCalledWith(postData[0].data.postImgPath)
      expect(postServiceSpy.deletePost).toHaveBeenCalledTimes(1)
      expect(postServiceSpy.deletePost).toHaveBeenCalledWith(postData[0].id)
    })

    it('should do not call method categoryService deleteData is confirm false', async () => {
      const confirmSpy = spyOn(window, 'confirm').and.returnValue(false)

      await component.onDelete(postData[0]);

      expect(confirmSpy).toHaveBeenCalled();
      expect(postServiceSpy.deleteImage).not.toHaveBeenCalled()
      expect(postServiceSpy.deletePost).not.toHaveBeenCalled()
    })
  })

  describe('onFeatured()', () => {
    it('should call markFeatured method postService', async () => {
      await component.onFeatured('1', true)

      expect(postServiceSpy.markFeatured).toHaveBeenCalledTimes(1);
      expect(postServiceSpy.markFeatured).toHaveBeenCalledWith('1', {isFeatured: true})
    })
  })

  describe('HTML template', () => {
    it('should call onDelete method when click button delete', () => {
      const spyOnDelete = spyOn(component, 'onDelete');
      const elementsButtons = findEls(fixture, 'button-delete');

      for(let i = 0; i < elementsButtons.length; i++) {
        const element = elementsButtons[i]
        const event = makeClickEvent(element.nativeElement);
        element.triggerEventHandler('click', event);

        expect(spyOnDelete).toHaveBeenCalledWith(postData[i]);
      }

      expect(spyOnDelete).toHaveBeenCalledTimes(postData.length);
    })

    it('should call onFeatured method when click button featured', () => {
      const spOnFeatured = spyOn(component, 'onFeatured');
      const elementsButtons = findEls(fixture, 'button-featured');

      for(let i = 0; i < elementsButtons.length; i++) {
        const element = elementsButtons[i]
        const event = makeClickEvent(element.nativeElement);
        element.triggerEventHandler('click', event);

        expect(spOnFeatured).toHaveBeenCalledWith(postData[i].id, true);
      }

      expect(spOnFeatured).toHaveBeenCalledTimes(postData.length);
    })

    it('should call onFeatured method when click button nonFeatured', () => {
      const postData = postDataRaw.map((item) => ({
        id: item.id,
        data: postAdapterService.formatDateFromFirebase({
          ...item.data,
          isFeatured: true
        })
      }))
      component.posts = postData
      fixture.detectChanges();

      const spOnFeatured = spyOn(component, 'onFeatured');
      const elementsButtons = findEls(fixture, 'button-nonFeatured');

      for(let i = 0; i < elementsButtons.length; i++) {
        const element = elementsButtons[i]
        const event = makeClickEvent(element.nativeElement);
        element.triggerEventHandler('click', event);

        expect(spOnFeatured).toHaveBeenCalledWith(postData[i].id, false);
      }

      expect(spOnFeatured).toHaveBeenCalledTimes(postData.length);
    })

    it('should display button-featured & non display button-nonFeatured', () => {
      const postData = postDataRaw.map((item) => ({
        id: item.id,
        data: postAdapterService.formatDateFromFirebase({
          ...item.data,
          isFeatured: false
        })
      }))
      component.posts = postData
      fixture.detectChanges();

      const elementsButtonsFeatured = findEls(fixture, 'button-featured');
      const elementsButtonsNonFeatured = findEls(fixture, 'button-nonFeatured');

      expect(elementsButtonsFeatured.length).toBe(postData.length)
      expect(elementsButtonsNonFeatured.length).toBe(0)
    })

    it('should display button-nonFeatured & non display button-featured', () => {
      const postData = postDataRaw.map((item) => ({
        id: item.id,
        data: postAdapterService.formatDateFromFirebase({
          ...item.data,
          isFeatured: true
        })
      }))
      component.posts = postData
      fixture.detectChanges();

      const elementsButtonsFeatured = findEls(fixture, 'button-featured');
      const elementsButtonsNonFeatured = findEls(fixture, 'button-nonFeatured');

      expect(elementsButtonsFeatured.length).toBe(0)
      expect(elementsButtonsNonFeatured.length).toBe(postData.length)
    })
  })
});
