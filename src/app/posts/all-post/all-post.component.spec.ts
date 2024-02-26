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


    const postServiceSpyObj = jasmine.createSpyObj('PostService', ['getPostsList', 'deleteImage', 'deletePost'])

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
  })
});
