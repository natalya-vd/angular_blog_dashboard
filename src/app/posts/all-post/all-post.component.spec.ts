import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { AllPostComponent } from './all-post.component';
import { PostService } from 'src/app/services/post/post.service';
import { PostFromFirebase, PostFromFirebaseRaw } from 'src/app/models/post';
import { createPostsDataFromFirebaseRaw } from 'src/app/spec-helpers/post.data';
import { PostAdapterService } from 'src/app/services/post/post.adapter.service';
import { RouterTestingModule } from '@angular/router/testing';

describe('AllPostComponent', () => {
  let component: AllPostComponent;
  let postAdapterService: PostAdapterService;
  let fixture: ComponentFixture<AllPostComponent>;
  let postServiceSpy: jasmine.SpyObj<PostService>
  let postData: PostFromFirebase[] = []
  let postDataRaw: PostFromFirebaseRaw[] = []

  beforeEach(() => {
    postDataRaw = createPostsDataFromFirebaseRaw()


    const postServiceSpyObj = jasmine.createSpyObj('PostService', ['getPostsList'])

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
});
