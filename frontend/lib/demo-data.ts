import type {
  AdminStats,
  Item,
  Loan,
  PageResponse,
  Review,
  UserProfileResponse,
} from "./api/types";
import type { Notification } from "./api/notificationService";

export type DemoAccount = "admin" | "owner" | "borrower";

type DemoSeedUser = {
  id: number;
  fullName: string;
  email: string;
  roles: string[];
  enabled: boolean;
  createdAt: string;
};

const DEMO_USERS: DemoSeedUser[] = [
  {
    id: 100,
    fullName: "Demo Admin",
    email: "admin@demo.unilend.local",
    roles: ["ADMIN"],
    enabled: true,
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: 101,
    fullName: "Demo Owner",
    email: "owner@demo.unilend.local",
    roles: ["USER"],
    enabled: true,
    createdAt: "2024-01-02T00:00:00Z",
  },
  {
    id: 102,
    fullName: "Demo Borrower",
    email: "borrower@demo.unilend.local",
    roles: ["USER"],
    enabled: true,
    createdAt: "2024-01-03T00:00:00Z",
  },
];

const DEMO_CATEGORIES: Array<{ id: number; name: string; description: string | null; createdAt: string }> = [
  { id: 1, name: "Laptop", description: "Thiết bị công nghệ", createdAt: "2024-01-01T00:00:00Z" },
  { id: 2, name: "Học tập", description: "Dụng cụ trường học", createdAt: "2024-01-03T00:00:00Z" },
  { id: 3, name: "Camera", description: "Thiết bị quay phim", createdAt: "2024-01-08T00:00:00Z" },
  { id: 4, name: "Phụ kiện", description: "Phụ kiện sinh viên", createdAt: "2024-01-12T00:00:00Z" },
];

const DEMO_ITEMS: Item[] = [
  {
    id: 1,
    title: "MacBook Air 13 inch",
    description: "Laptop siêu mỏng, pin ấn tượng, phù hợp học tập và làm việc nhóm.",
    imageUrls: [],
    images: [],
    status: "AVAILABLE",
    owner: { id: 101, fullName: "Demo Owner" },
    category: { id: 1, name: "Laptop", description: "Thiết bị công nghệ", createdAt: "2024-01-01T00:00:00Z" },
    createdAt: "2024-01-05T00:00:00Z",
  },
  {
    id: 2,
    title: "Máy chiếu mini",
    description: "Máy chiếu dễ mang theo, sáng rõ, rất phù hợp thuyết trình nhóm.",
    imageUrls: [],
    images: [],
    status: "AVAILABLE",
    owner: { id: 101, fullName: "Demo Owner" },
    category: { id: 2, name: "Học tập", description: "Dụng cụ trường học", createdAt: "2024-01-03T00:00:00Z" },
    createdAt: "2024-01-07T00:00:00Z",
  },
  {
    id: 3,
    title: "Camera Sony ZV-1",
    description: "Dùng cho quay video, chụp sự kiện và bài tập thực hành.",
    imageUrls: [],
    images: [],
    status: "AVAILABLE",
    owner: { id: 101, fullName: "Demo Owner" },
    category: { id: 3, name: "Camera", description: "Thiết bị quay phim", createdAt: "2024-01-08T00:00:00Z" },
    createdAt: "2024-01-10T00:00:00Z",
  },
  {
    id: 4,
    title: "Loa Bluetooth mini",
    description: "Loa nhỏ gọn, âm thanh rõ, hỗ trợ học nhóm và sự kiện ngoài trời.",
    imageUrls: [],
    images: [],
    status: "AVAILABLE",
    owner: { id: 102, fullName: "Demo Borrower" },
    category: { id: 2, name: "Học tập", description: "Dụng cụ trường học", createdAt: "2024-01-03T00:00:00Z" },
    createdAt: "2024-01-11T00:00:00Z",
  },
  {
    id: 5,
    title: "Balo chống nước cho sinh viên",
    description: "Balo chống nước do Demo Borrower sở hữu, đủ chứa laptop, sách vở và thiết bị cá nhân cho sinh viên.",
    imageUrls: [],
    images: [],
    status: "AVAILABLE",
    owner: { id: 102, fullName: "Demo Borrower" },
    category: { id: 4, name: "Phụ kiện", description: "Phụ kiện sinh viên", createdAt: "2024-01-12T00:00:00Z" },
    createdAt: "2024-01-12T00:00:00Z",
  },
];

const DEMO_LOANS: Loan[] = [
  {
    id: 11,
    item: { id: 2, title: "Máy chiếu mini" },
    borrower: { id: 102, fullName: "Demo Borrower" },
    owner: { id: 101, fullName: "Demo Owner" },
    status: "PENDING",
    borrowFrom: "2026-11-03",
    dueDate: "2026-11-10",
    note: "Mượn để thuyết trình cuối kỳ và làm video báo cáo nhóm.",
    requestedAt: "2026-11-01T10:00:00Z",
    respondedAt: null,
    returnedAt: null,
  },
  {
    id: 12,
    item: { id: 1, title: "MacBook Air 13 inch" },
    borrower: { id: 102, fullName: "Demo Borrower" },
    owner: { id: 101, fullName: "Demo Owner" },
    status: "APPROVED",
    borrowFrom: "2026-10-20",
    dueDate: "2026-11-05",
    note: "Mượn để làm bài tập kỹ thuật số và làm việc từ xa.",
    requestedAt: "2026-10-10T09:00:00Z",
    respondedAt: "2026-10-12T11:20:00Z",
    returnedAt: null,
  },
  {
    id: 13,
    item: { id: 3, title: "Camera Sony ZV-1" },
    borrower: { id: 103, fullName: "Demo Borrower 2" },
    owner: { id: 101, fullName: "Demo Owner" },
    status: "OVERDUE",
    borrowFrom: "2026-10-12",
    dueDate: "2026-10-28",
    note: "Mượn để quay video hội thảo khoa; đã quá hạn nhưng còn đang sử dụng.",
    requestedAt: "2026-10-09T12:00:00Z",
    respondedAt: "2026-10-10T15:00:00Z",
    returnedAt: null,
  },
  {
    id: 14,
    item: { id: 4, title: "Loa Bluetooth mini" },
    borrower: { id: 102, fullName: "Demo Borrower" },
    owner: { id: 102, fullName: "Demo Borrower" },
    status: "RETURNED",
    borrowFrom: "2026-09-20",
    dueDate: "2026-09-27",
    note: "Cho bạn mượn để dùng trong buổi họp nhóm.",
    requestedAt: "2026-09-18T07:30:00Z",
    respondedAt: "2026-09-19T08:00:00Z",
    returnedAt: "2026-09-27T18:10:00Z",
  },
];

const DEMO_REVIEWS: Review[] = [
  {
    id: 1,
    loanId: 12,
    itemId: 1,
    itemTitle: "MacBook Air 13 inch",
    rating: 5,
    comment: "Cho thuê rất chuyên nghiệp, máy mới và bảo quản cẩn thận.",
    reviewer: { id: 102, fullName: "Demo Borrower" },
    reviewee: { id: 101, fullName: "Demo Owner" },
    createdAt: "2026-10-12T11:30:00Z",
  },
  {
    id: 2,
    loanId: 12,
    itemId: 1,
    itemTitle: "MacBook Air 13 inch",
    rating: 4,
    comment: "Mượn đúng lịch, trả máy đầy đủ và liên lạc nhanh.",
    reviewer: { id: 101, fullName: "Demo Owner" },
    reviewee: { id: 102, fullName: "Demo Borrower" },
    createdAt: "2026-10-12T12:00:00Z",
  },
];

const DEMO_NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    title: "Yêu cầu mượn mới",
    message: "Có yêu cầu mượn mới cho máy chiếu mini từ Demo Borrower.",
    createdAt: "2026-11-01T10:20:00Z",
    read: false,
    link: "/loans/11",
  },
  {
    id: 2,
    title: "Yêu cầu đã được duyệt",
    message: "Yêu cầu mượn MacBook Air của bạn đã được chấp thuận.",
    createdAt: "2026-10-12T12:15:00Z",
    read: false,
    link: "/loans/12",
  },
];

function getDemoUserByEmail(email: string | null): (typeof DEMO_USERS)[number] | null {
  if (!email) return null;
  const normalized = email.trim().toLowerCase();
  return DEMO_USERS.find((user) => user.email.toLowerCase() === normalized) ?? null;
}

function readSessionUser(): (typeof DEMO_USERS)[number] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem("unilend.mock.session");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { email?: string };
    return getDemoUserByEmail(parsed.email ?? null);
  } catch {
    return null;
  }
}

export function isDemoModeEnabled(): boolean {
  return readSessionUser() !== null;
}

function pageOf<T>(items: T[], page = 0, size = 10): PageResponse<T> {
  const start = page * size;
  const sliced = items.slice(start, start + size);
  return {
    content: sliced,
    page,
    size,
    totalElements: items.length,
    totalPages: Math.max(1, Math.ceil(items.length / size)),
    last: start + size >= items.length,
  };
}

function buildUserProfile(user: (typeof DEMO_USERS)[number]): UserProfileResponse {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    phone: null,
    university: "Đại học Demo",
    avatarUrl: null,
    roles: user.roles,
    enabled: user.enabled,
    averageRating: 4.7,
    reviewCount: 2,
    createdAt: user.createdAt,
  };
}

function demoItemsForCurrentUser(): Item[] {
  const user = readSessionUser();
  if (!user) return DEMO_ITEMS;
  return DEMO_ITEMS.filter((item) => item.owner.id === user.id);
}

function demoLoansForCurrentUser(type: "mine" | "incoming"): Loan[] {
  const user = readSessionUser();
  if (!user) return [];

  if (type === "mine") {
    return DEMO_LOANS.filter((loan) => loan.borrower.id === user.id);
  }

  return DEMO_LOANS.filter((loan) => loan.owner.id === user.id);
}

export function resolveDemoApiResponse(url: string, method: string, data?: unknown, params?: Record<string, unknown>) {
  if (!isDemoModeEnabled()) return null;
  const reqUrl = url.split("?")[0];
  const lowerMethod = (method ?? "get").toLowerCase();

  if (reqUrl === "/users/me") {
    const user = readSessionUser();
    return user ? { success: true, message: "Success", data: buildUserProfile(user), statusCode: 200 } : null;
  }

  if (reqUrl === "/items/me") {
    return {
      success: true,
      message: "Success",
      data: pageOf(demoItemsForCurrentUser(), Number(params?.page ?? 0), Number(params?.size ?? 10)),
      statusCode: 200,
    };
  }

  if (reqUrl === "/categories") {
    if (lowerMethod === "get") {
      return { success: true, message: "Success", data: [...DEMO_CATEGORIES], statusCode: 200 };
    }

    if (lowerMethod === "post") {
      const payload = data as { name?: string; description?: string } | undefined;
      if (!payload?.name) return null;
      const nextCategory = {
        id: Date.now(),
        name: payload.name,
        description: payload.description ?? null,
        createdAt: new Date().toISOString(),
      };
      DEMO_CATEGORIES.unshift(nextCategory);
      return { success: true, message: "Success", data: nextCategory, statusCode: 200 };
    }
  }

  if (/^\/categories\/(\d+)$/.test(reqUrl)) {
    const match = reqUrl.match(/^\/categories\/(\d+)$/);
    if (!match) return null;
    const categoryId = Number(match[1]);
    const category = DEMO_CATEGORIES.find((entry) => entry.id === categoryId);
    if (!category) return { success: false, message: "Not found", data: null, statusCode: 404 };

    if (lowerMethod === "put") {
      const payload = data as { name?: string; description?: string } | undefined;
      if (payload?.name) category.name = payload.name;
      if (payload?.description !== undefined) category.description = payload.description ?? null;
      return { success: true, message: "Success", data: category, statusCode: 200 };
    }

    if (lowerMethod === "delete") {
      const index = DEMO_CATEGORIES.findIndex((entry) => entry.id === categoryId);
      if (index >= 0) DEMO_CATEGORIES.splice(index, 1);
      return { success: true, message: "Success", data: null, statusCode: 200 };
    }

    return { success: true, message: "Success", data: category, statusCode: 200 };
  }

  if (reqUrl === "/items") {
    if (lowerMethod === "get") {
      return {
        success: true,
        message: "Success",
        data: pageOf(DEMO_ITEMS, Number(params?.page ?? 0), Number(params?.size ?? 10)),
        statusCode: 200,
      };
    }

    if (lowerMethod === "post") {
      const payload = data as { title?: string; description?: string; categoryId?: number } | undefined;
      const user = readSessionUser();
      if (!user || !payload?.title) return null;
      const resolvedCategory = DEMO_CATEGORIES.find((category) => category.id === Number(payload.categoryId ?? 1)) ?? DEMO_CATEGORIES[0];
      const nextItem: Item = {
        id: Date.now(),
        title: payload.title,
        description: payload.description ?? null,
        imageUrls: [],
        images: [],
        status: "AVAILABLE",
        owner: { id: user.id, fullName: user.fullName },
        category: resolvedCategory ? { ...resolvedCategory, description: resolvedCategory.description ?? null } : null,
        createdAt: new Date().toISOString(),
      };
      DEMO_ITEMS.unshift(nextItem);
      return { success: true, message: "Success", data: nextItem, statusCode: 200 };
    }
  }

  if (/^\/items\/(\d+)$/.test(reqUrl)) {
    const match = reqUrl.match(/^\/items\/(\d+)$/);
    if (!match) return null;
    const id = Number(match[1]);
    const item = DEMO_ITEMS.find((entry) => entry.id === id);
    return item ? { success: true, message: "Success", data: item, statusCode: 200 } : { success: false, message: "Not found", data: null, statusCode: 404 };
  }

  if (reqUrl === "/loan-requests/mine") {
    return {
      success: true,
      message: "Success",
      data: pageOf(demoLoansForCurrentUser("mine"), Number(params?.page ?? 0), Number(params?.size ?? 10)),
      statusCode: 200,
    };
  }

  if (reqUrl === "/loan-requests/incoming") {
    return {
      success: true,
      message: "Success",
      data: pageOf(demoLoansForCurrentUser("incoming"), Number(params?.page ?? 0), Number(params?.size ?? 10)),
      statusCode: 200,
    };
  }

  if (/^\/loan-requests\/(\d+)$/.test(reqUrl)) {
    const match = reqUrl.match(/^\/loan-requests\/(\d+)$/);
    if (!match) return null;
    const id = Number(match[1]);
    const loan = DEMO_LOANS.find((entry) => entry.id === id);
    return loan ? { success: true, message: "Success", data: loan, statusCode: 200 } : { success: false, message: "Not found", data: null, statusCode: 404 };
  }

  if (reqUrl === "/loan-requests") {
    if (lowerMethod === "post") {
      const payload = data as { itemId?: number; borrowFrom?: string; dueDate?: string; note?: string } | undefined;
      const user = readSessionUser();
      if (!user || !payload?.itemId) return null;
      const item = DEMO_ITEMS.find((entry) => entry.id === Number(payload.itemId));
      const nextLoan: Loan = {
        id: Date.now(),
        item: { id: Number(payload.itemId), title: item?.title ?? "Sản phẩm demo" },
        borrower: { id: user.id, fullName: user.fullName },
        owner: item ? item.owner : { id: 101, fullName: "Demo Owner" },
        status: "PENDING",
        borrowFrom: payload.borrowFrom ?? null,
        dueDate: payload.dueDate ?? null,
        note: payload.note ?? null,
        requestedAt: new Date().toISOString(),
        respondedAt: null,
        returnedAt: null,
      };
      DEMO_LOANS.unshift(nextLoan);
      return { success: true, message: "Success", data: nextLoan, statusCode: 200 };
    }
  }

  if (/^\/loan-requests\/(\d+)\/approve$/.test(reqUrl)) {
    const match = reqUrl.match(/^\/loan-requests\/(\d+)\/approve$/);
    if (!match) return null;
    const id = Number(match[1]);
    const loan = DEMO_LOANS.find((entry) => entry.id === id);
    if (!loan) return { success: false, message: "Not found", data: null, statusCode: 404 };
    loan.status = "APPROVED";
    loan.respondedAt = new Date().toISOString();
    return { success: true, message: "Success", data: loan, statusCode: 200 };
  }

  if (/^\/loan-requests\/(\d+)\/reject$/.test(reqUrl)) {
    const match = reqUrl.match(/^\/loan-requests\/(\d+)\/reject$/);
    if (!match) return null;
    const id = Number(match[1]);
    const loan = DEMO_LOANS.find((entry) => entry.id === id);
    if (!loan) return { success: false, message: "Not found", data: null, statusCode: 404 };
    loan.status = "REJECTED";
    loan.respondedAt = new Date().toISOString();
    return { success: true, message: "Success", data: loan, statusCode: 200 };
  }

  if (/^\/loan-requests\/(\d+)\/return$/.test(reqUrl)) {
    const match = reqUrl.match(/^\/loan-requests\/(\d+)\/return$/);
    if (!match) return null;
    const id = Number(match[1]);
    const loan = DEMO_LOANS.find((entry) => entry.id === id);
    if (!loan) return { success: false, message: "Not found", data: null, statusCode: 404 };
    loan.status = "RETURNED";
    loan.returnedAt = new Date().toISOString();
    return { success: true, message: "Success", data: loan, statusCode: 200 };
  }

  if (/^\/items\/(\d+)\/images$/.test(reqUrl)) {
    const match = reqUrl.match(/^\/items\/(\d+)\/images$/);
    if (!match) return null;
    const itemId = Number(match[1]);
    const item = DEMO_ITEMS.find((entry) => entry.id === itemId);
    if (!item) return { success: false, message: "Not found", data: null, statusCode: 404 };

    const fileNames = data instanceof FormData
      ? Array.from(data.getAll("files")).map((file) => {
          if (typeof file === "string") return file;
          return file instanceof File ? file.name : "demo-upload";
        })
      : [];

    const imageUrls = fileNames.length > 0
      ? fileNames.map((name, index) => `/demo-images/${itemId}-${index}-${name.replace(/\s+/g, "-").toLowerCase()}`)
      : ["/demo-images/default-item.png"];

    item.imageUrls = imageUrls;
    item.images = imageUrls.map((url, index) => ({
      id: Date.now() + index,
      imageUrl: url,
      createdAt: new Date().toISOString(),
    }));

    return { success: true, message: "Success", data: item, statusCode: 200 };
  }

  if (/^\/loan-requests\/(\d+)\/reviews$/.test(reqUrl)) {
    const match = reqUrl.match(/^\/loan-requests\/(\d+)\/reviews$/);
    if (!match) return null;
    const loanId = Number(match[1]);
    if (lowerMethod === "get") {
      return { success: true, message: "Success", data: DEMO_REVIEWS.filter((review) => review.loanId === loanId), statusCode: 200 };
    }
    if (lowerMethod === "post") {
      const payload = data as { rating?: number; comment?: string } | undefined;
      const user = readSessionUser();
      if (!user || !payload?.rating) return null;
      const loan = DEMO_LOANS.find((entry) => entry.id === loanId);
      const review: Review = {
        id: Date.now(),
        loanId,
        itemId: loan?.item.id ?? null,
        itemTitle: loan?.item.title ?? "Demo review",
        rating: payload.rating,
        comment: payload.comment ?? null,
        reviewer: { id: user.id, fullName: user.fullName },
        reviewee: loan ? loan.owner : { id: 101, fullName: "Demo Owner" },
        createdAt: new Date().toISOString(),
      };
      DEMO_REVIEWS.push(review);
      return { success: true, message: "Success", data: review, statusCode: 200 };
    }
  }

  if (/^\/users\/(\d+)\/reviews$/.test(reqUrl)) {
    const match = reqUrl.match(/^\/users\/(\d+)\/reviews$/);
    if (!match) return null;
    const userId = Number(match[1]);
    return {
      success: true,
      message: "Success",
      data: pageOf(
        DEMO_REVIEWS.filter((review) => review.reviewee?.id === userId),
        Number(params?.page ?? 0),
        Number(params?.size ?? 10),
      ),
      statusCode: 200,
    };
  }

  if (/^\/users\/(\d+)\/rating$/.test(reqUrl)) {
    const match = reqUrl.match(/^\/users\/(\d+)\/rating$/);
    if (!match) return null;
    const userId = Number(match[1]);
    const relatedReviews = DEMO_REVIEWS.filter((review) => review.reviewee?.id === userId);
    const total = relatedReviews.reduce((sum, review) => sum + review.rating, 0);
    return {
      success: true,
      message: "Success",
      data: {
        averageRating: relatedReviews.length ? Number((total / relatedReviews.length).toFixed(1)) : 0,
        reviewCount: relatedReviews.length,
      },
      statusCode: 200,
    };
  }

  if (reqUrl === "/notifications") {
    return {
      success: true,
      message: "Success",
      data: pageOf(DEMO_NOTIFICATIONS, Number(params?.page ?? 0), Number(params?.size ?? 10)),
      statusCode: 200,
    };
  }

  if (reqUrl === "/notifications/unread-count") {
    return { success: true, message: "Success", data: DEMO_NOTIFICATIONS.filter((item) => !item.read).length, statusCode: 200 };
  }

  if (reqUrl === "/admin/stats") {
    const stats: AdminStats = {
      totalUsers: DEMO_USERS.length,
      totalItems: DEMO_ITEMS.length,
      loansByStatus: {
        PENDING: 1,
        APPROVED: 1,
        REJECTED: 0,
        RETURNED: 1,
        CANCELLED: 0,
        OVERDUE: 1,
      },
      mostBorrowedCategories: [
        { categoryId: 1, categoryName: "Laptop", loanCount: 1 },
        { categoryId: 2, categoryName: "Học tập", loanCount: 1 },
      ],
    };
    return { success: true, message: "Success", data: stats, statusCode: 200 };
  }

  if (reqUrl === "/admin/users") {
    return {
      success: true,
      message: "Success",
      data: pageOf(
        DEMO_USERS.map((user) => ({
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          roles: user.roles,
          enabled: user.enabled,
          createdAt: user.createdAt,
        })),
        Number(params?.page ?? 0),
        Number(params?.size ?? 10),
      ),
      statusCode: 200,
    };
  }

  return null;
}
