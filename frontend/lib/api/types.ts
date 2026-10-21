export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  statusCode: number;
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
  imageUrls: string[];
  images: ItemImage[];
  status: ItemStatus;
  owner: {
    id: number;
    fullName: string;
  };
  category: Category | null;
  createdAt: string;
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
