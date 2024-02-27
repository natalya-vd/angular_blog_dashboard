interface Timestamp {
  seconds: number;
  nanoseconds: number;
}

export interface Post {
  title: string;
  permalink: string;
  category: {
    categoryId: string;
    category: string;
  };
  postImgPath: string;
  excerpt: string;
  content: string;
  isFeatured: boolean;
  views: number;
  status: string;
  createdAt: Date | number;
}

export interface PostFromFirebase {
  id: string;
  data: Post;
}

export interface DataFromFirebase extends Omit<Post, 'createdAt'> {
  createdAt: Timestamp;
}

export interface PostFromFirebaseRaw {
  id: string;
  data: DataFromFirebase;
}
