export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  statusCode: number;
}

export interface AuthResponse {
  id: number;
  email: string;
  fullName: string;
  roles: string[];
  emailVerified?: boolean;
  averageRating?: number | null;
  reviewCount?: number | null;
  tokenType?: string;
  token?: string;
}

export interface AdminStats {
  totalUsers: number;
  totalItems: number;
  loansByStatus: Record<LoanStatus, number>;
  mostBorrowedCategories: {
    categoryId: number;
    categoryName: string;
    loanCount: number;
  }[];
}

export interface Category {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
}

export type ItemStatus = "AVAILABLE" | "LENT_OUT" | "UNAVAILABLE";

export interface ItemImage {
  id: number;
  imageUrl: string;
  createdAt: string;
}

export interface Item {
  id: number;
  title: string;
  description: string | null;
  imageUrls?: string[];
  images?: ItemImage[];
  status: ItemStatus;
  owner: {
    id: number;
    fullName: string;
  };
  category: Category | null;
  createdAt: string;
}

export function getItemImageUrls(item: Pick<Item, "imageUrls" | "images">): string[] {
  if (item.images?.length) {
    return item.images.map((image) => image.imageUrl);
  }
  return item.imageUrls ?? [];
}

export interface ItemInput {
  title: string;
  description?: string;
  categoryId?: number;
  status?: "AVAILABLE" | "UNAVAILABLE";
}

export type LoanStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "RETURNED"
  | "CANCELLED"
  | "OVERDUE";

export interface Loan {
  id: number;
  item: {
    id: number;
    title: string;
  };
  borrower: {
    id: number;
    fullName: string;
  };
  owner: {
    id: number;
    fullName: string;
  };
  status: LoanStatus;
  borrowFrom: string | null;
  dueDate: string | null;
  note: string | null;
  requestedAt: string;
  respondedAt: string | null;
  returnedAt: string | null;
  hasReviewed?: boolean;
  canReview?: boolean;
}

export interface BookedPeriod {
  loanId: number;
  borrowFrom: string;
  dueDate: string;
  status: LoanStatus;
}

export interface Review {
  id: number;
  loanId: number | null;
  itemId: number | null;
  itemTitle: string | null;
  rating: number;
  comment: string | null;
  reviewer: {
    id: number;
    fullName: string;
  } | null;
  reviewee: {
    id: number;
    fullName: string;
  } | null;
  createdAt: string;
}

export interface UserProfileResponse {
  id: number;
  email: string;
  fullName: string;
  phone: string | null;
  university: string | null;
  avatarUrl: string | null;
  roles: string[];
  enabled: boolean;
  emailVerified?: boolean;
  averageRating: number;
  reviewCount: number;
  createdAt: string;
}

export interface UserRatingResponse {
  averageRating: number;
  reviewCount: number;
}

export interface CreateLoanInput {
  itemId: number;
  borrowFrom: string;
  dueDate: string;
  note?: string;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}
