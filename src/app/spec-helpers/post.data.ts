import { Post, PostFromFirebaseRaw } from "../models/post"

export const createPostsDataFromFirebaseRaw = (): PostFromFirebaseRaw[] => {
  return [
    {
      id: '1',
      data: {
        title: 'Title 1',
        permalink: 'Title-1',
        category: {
          categoryId: '1',
          category: 'Category 1'
        },
        postImgPath: 'postImgPath_1',
        excerpt: 'excerpt',
        content: 'content',
        isFeatured: false,
        views: 0,
        status: 'new',
        createdAt: {
          nanoseconds: 831000000,
          seconds: 1705590854
        }
      }
    },
    {
      id: '2',
      data: {
        title: 'Title 2',
        permalink: 'Title-2',
        category: {
          categoryId: '2',
          category: 'Category 2'
        },
        postImgPath: 'postImgPath_2',
        excerpt: 'excerpt',
        content: 'content',
        isFeatured: false,
        views: 0,
        status: 'new',
        createdAt: {
          nanoseconds: 831000000,
          seconds: 1705590854
        }
      }
    },
    {
      id: '3',
      data: {
        title: 'Title 3',
        permalink: 'Title-3',
        category: {
          categoryId: '3',
          category: 'Category 3'
        },
        postImgPath: 'postImgPath_3',
        excerpt: 'excerpt',
        content: 'content',
        isFeatured: false,
        views: 0,
        status: 'new',
        createdAt: {
          nanoseconds: 831000000,
          seconds: 1705590854
        }
      }
    },
  ]
}

export const createPostDataFromForm = (): Post => {
  return {
    title: 'Cool title',
    permalink: 'Cool-title',
    category: {
      categoryId: '1',
      category: 'Category 1'
    },
    postImgPath: '',
    excerpt: 'excerpt jkdjkjfdkg fkdjfkjfkfdjkgjkfdj fkdkfdkfkdfkdkfdflkdlfkdfkfldklf',
    content: 'content',
    isFeatured: false,
    views: 0,
    status: 'new',
    createdAt: new Date()
  }
}
