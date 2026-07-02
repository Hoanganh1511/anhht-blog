export interface CommentUser {
  id: string;
  name: string | null;
  image: string | null;
}

export interface CommentData {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  parentId: string | null;
  user: CommentUser;
  likesCount: number;
  likedByMe: boolean;
  replies?: CommentData[];
}

export interface CommentsPage {
  comments: CommentData[];
  total: number;
  nextCursor: string | null;
}
