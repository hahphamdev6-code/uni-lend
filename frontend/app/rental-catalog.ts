import type { Item } from "../lib/api/types";

export type CategoryTab =
  | "All Items"
  | "Electronics"
  | "Home Appliances"
  | "Furniture"
  | "Tools & Equipment"
  | "Travel & Outdoor"
  | "Sports & Fitness"
  | "Events & Party"
  | "Other Items";

export const CATEGORY_LABELS_VI: Record<CategoryTab, string> = {
  "All Items": "Tất cả thiết bị",
  Electronics: "Điện tử & Công nghệ",
  "Home Appliances": "Thiết bị gia dụng",
  Furniture: "Nội thất & Học tập",
  "Tools & Equipment": "Dụng cụ & Kỹ thuật",
  "Travel & Outdoor": "Du lịch & Dã ngoại",
  "Sports & Fitness": "Thể thao & Sức khỏe",
  "Events & Party": "Sự kiện & Âm thanh",
  "Other Items": "Vật phẩm khác",
};

export type ItemCondition = "Like New" | "Good" | "Fair";

export const CONDITION_LABELS_VI: Record<ItemCondition, string> = {
  "Like New": "Như mới (99%)",
  Good: "Tốt (90-95%)",
  Fair: "Khá (Hoạt động tốt)",
};

export type SortOption =
  | "Recommended"
  | "Recently Added"
  | "Price: Low to High"
  | "Price: High to Low"
  | "Highest Rated";

export const SORT_LABELS_VI: Record<SortOption, string> = {
  Recommended: "Đề xuất phù hợp nhất",
  "Recently Added": "Mới đăng gần đây",
  "Price: Low to High": "Giá thuê: Thấp đến Cao",
  "Price: High to Low": "Giá thuê: Cao đến Thấp",
  "Highest Rated": "Đánh giá cao nhất",
};

export type ProductSpecification = {
  label: string;
  value: string;
};

export type SystemUser = {
  id: number;
  fullName: string;
  shortName: string;
  email: string;
  phone: string;
  university: string;
  department: string;
  avatar: string;
  rating: number;
  reviews: number;
  memberSince: string;
  responseTime: string;
};

/**
 * Danh sách 7 tài khoản thật thống nhất trên toàn hệ thống (đồng bộ 1-1 với bảng `users` trong MySQL).
 */
export const SYSTEM_USERS: SystemUser[] = [
  {
    id: 1,
    fullName: "Elena Rostova",
    shortName: "Elena",
    email: "elena.rostova@unilend.edu",
    phone: "0901234567",
    university: "ĐH Bách Khoa TP.HCM",
    department: "Khoa Kỹ thuật Điện - Điện tử",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuColqmD0BU0zcxh9H-0BTGrCWP0dwHhhzEy2bDmKlYnoqE4RMeX89Y6mj7f457ncuFPSSv8vgZKvZTuGIyjwDcY0wqWQVnAG7m4pk3h2oK6Vl0s9eSSfPLHeytYpLE_NnNWm_Dz_OJefyOjEV1e1YnDLGIMWMd5yvdcNzDgqzNebbuOOg-EHVN5QNwgym_6suYvPCPh-r6YEhdiTOM8omafSe3V4pS1sSQnPy0YhjVuXMZ09IgHbdfn-w",
    rating: 4.95,
    reviews: 128,
    memberSince: "2024",
    responseTime: "10 phút",
  },
  {
    id: 2,
    fullName: "Alex Morgan",
    shortName: "Alex",
    email: "alex.morgan@unilend.edu",
    phone: "0902345678",
    university: "ĐH Khoa Học Tự Nhiên",
    department: "Khoa Công nghệ Thông tin",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD5fP1JIrMlUiIkk3Iqk2lHsXZ6ErjEMC42bRCzU2bVysxnDWtM66et8v08R-iir5htXEzbkQb2KTkCLyU-SIi6ssn8B5C4yLqdqCnRUIZCRRamoibNji-i9gd1ATzGsYWYWUa3ynPWsidws6kb7rqbCQjg4Xn2uctM02V5W9Rq1HDRpHOvhh3CYmel5FLjHqseggP2fHiHhuvFOD0GA1jFfXuwcEKRFuyGtzmyfRLkx_VdAzR4OjgeIA",
    rating: 4.9,
    reviews: 44,
    memberSince: "2024",
    responseTime: "12 phút",
  },
  {
    id: 3,
    fullName: "Minh Quân",
    shortName: "Quân",
    email: "minh.quan@unilend.edu",
    phone: "0903456789",
    university: "ĐH Sư Phạm Kỹ Thuật",
    department: "Khoa Cơ khí Chế tạo máy",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDWkm30Qf3a7nwP6OVXx64XS4TZojn85KCtnA2mAParaJswajsEF979q0KBiDcski1mnM_jX2RnJttgA6MYTwC6fpEY5c0VrwoSZqbSGuHWILzAzVmsHqNDyjJ9OjbaG5k1fQuiDuVEDjEOi5ZOOHtzHtX94u2JhDklFcHH4BRztTHKOaPuHHQW4xJwurgNiMfWWzUw3ZGlclCWEjchuGXNnAfMhQinIIKTpDOe9S4kNUDhvGVf1qWsF-c0t8qF3CDUzoQZJ5qgfcqP",
    rating: 4.88,
    reviews: 49,
    memberSince: "2024",
    responseTime: "15 phút",
  },
  {
    id: 4,
    fullName: "Lan Anh",
    shortName: "Lan Anh",
    email: "lan.anh@unilend.edu",
    phone: "0904567890",
    university: "ĐH Quốc Tế (IU - ĐHQG)",
    department: "Khoa Quản trị Kinh doanh",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBMAl2gePDDvvlMmtpKHAzGRzSl448tz1U7MUfAsUnmQUhgMA8afTY27lTh6fy3m7vc5-hbPKx5qznaNdQYsw4C2MDjagAkT8vG9WhOk0e66FQM2tlWV8bQ3VbLf1uzTy3CqD-bKUKXbwd1t4EQVKootGn93iPYXl3G1Ac9nGSfMuTEu8_iDfYbS2qzTbkUBY46I7RENXh-HSapWq0W0uNzQSByuRvc5pAJMKcpCjWK6mKA12Yi9ICm7FL36UJY0dZJfMXJh2LaVjLD",
    rating: 4.92,
    reviews: 51,
    memberSince: "2025",
    responseTime: "10 phút",
  },
  {
    id: 5,
    fullName: "Hoàng Nam",
    shortName: "Nam",
    email: "hoang.nam@unilend.edu",
    phone: "0905678901",
    university: "ĐH Kinh Tế TP.HCM (UEH)",
    department: "Khoa Truyền thông Số & Thiết kế",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDSiaPwmk4CfVgO-JlBVEyKTPNMreh4g1lM9pqJrjoDgl331_fduxt_lVnZkhnI0NYmNtL9MaWh8B5JVBNaO1ibLKIsrKyrnhC27r5o6TbzKwc6zv3Qi_XDjW9UDYnh6Pg22x0KjqeL8NvOFayER7C3NyroVM9EsKuH_W31re0zHCU0qbybBsJRHt6-MFAyl47zoMv-ENzTQYMJ3G0Y3eFfajDdvHCScGA0pL5eYGKl_8FmvfGbEun_CKr0b01EzJU9UcJJtllzurQO",
    rating: 4.9,
    reviews: 40,
    memberSince: "2025",
    responseTime: "15 phút",
  },
  {
    id: 6,
    fullName: "Tuấn Kiệt",
    shortName: "Kiệt",
    email: "tuan.kiet@unilend.edu",
    phone: "0906789012",
    university: "ĐH Khoa Học Tự Nhiên",
    department: "Khoa Vật lý & Kỹ thuật Điện tử",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD-Wgqs_9Zq6eAIoBwS2cQJ2MFyBi6IBlf8BS5NyPowSgNHROseCS_55ZiVf1g8JdQ801cWDAOEIw-TrjWPBbfclzhH4TdSnBUkN1tRvthbSrYlzuYr8FnrffXyrJS286oOKOJght9tKKi9d8es6E1QEEGrizXBmfpqdgsSYjJsrKP8tBKys2NsMX22eKvYBV5bv3mU9lCFAMqyIl9Va-p18CBOIM_DOu1HLxees3_0c3Q-7k6QDVY9GV1D2cgn9x7jvnMsjMjYk_jt",
    rating: 4.95,
    reviews: 55,
    memberSince: "2024",
    responseTime: "12 phút",
  },
  {
    id: 7,
    fullName: "Minh Anh",
    shortName: "Minh Anh",
    email: "minh.anh@unilend.edu",
    phone: "0907890123",
    university: "ĐH Kiến Trúc TP.HCM",
    department: "Khoa Mỹ thuật Công nghiệp",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBo2S_mFUP4oBOHHF4kSpGeQ_70K4SR0v_rJpu-CKyOQ3ri4oIchfn_dNkttnEkt6EZAjFGoyKwaXE1RusHcYPVjdaKlBDRXHqPI5Fvi9OtLBOacbMp3AQw-FXFmBWgrWSCgQD22gFKh2H77hwMCHRZupzb4FUBDUbqNbT6mMEmsgaQ05IhZbGYlqIiph4IgJeukoH1hKMTqSbPpJdMverW7uO_umUSaZRJMJeyo1s_9_x_YJ2cx0JV8kpXL28-2D-MJTP6Z0rjSRZC",
    rating: 4.96,
    reviews: 53,
    memberSince: "2025",
    responseTime: "10 phút",
  },
];

export function getSystemUser(identifier?: {
  id?: number | null;
  fullName?: string | null;
  email?: string | null;
}): SystemUser {
  if (!identifier) return SYSTEM_USERS[0];

  if (identifier.id) {
    const byId = SYSTEM_USERS.find((u) => u.id === Number(identifier.id));
    if (byId) return byId;
  }

  if (identifier.email) {
    const cleanEmail = identifier.email.trim().toLowerCase();
    const byEmail = SYSTEM_USERS.find((u) => u.email.toLowerCase() === cleanEmail);
    if (byEmail) return byEmail;
  }

  if (identifier.fullName) {
    const cleanName = identifier.fullName.trim().toLowerCase();
    const byName = SYSTEM_USERS.find(
      (u) =>
        u.fullName.toLowerCase() === cleanName ||
        u.shortName.toLowerCase() === cleanName ||
        cleanName.includes(u.fullName.toLowerCase())
    );
    if (byName) return byName;
  }

  return SYSTEM_USERS[0];
}

export function getInitials(name?: string | null): string {
  if (!name) return "UL";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

export type RentalListingItem = {
  id: string;
  dbId?: number;
  brand: string;
  title: string;
  category: Exclude<CategoryTab, "All Items">;
  categoryId?: number;
  categoryLabel?: string;
  condition: ItemCondition;
  conditionScore?: string;
  rating: number;
  reviews: number;
  location: string;
  distance?: string;
  pickupArea?: string;
  pricePerDay: number;
  weeklyPrice?: number;
  securityDeposit?: number;
  insuredUpTo?: number;
  status?: "AVAILABLE" | "LENT_OUT" | "UNAVAILABLE";
  ownerId: number;
  ownerName: string;
  ownerEmail: string;
  ownerAvatar: string;
  ownerUniversity: string;
  ownerRating?: number;
  ownerReviews?: number;
  ownerResponseTime?: string;
  image: string;
  alt: string;
  gallery?: { src: string; alt: string }[];
  summary?: string;
  includedInKit?: string[];
  specifications?: ProductSpecification[];
  keywords?: string[];
};

export type RentalItem = RentalListingItem;

export const CATEGORY_TABS: CategoryTab[] = [
  "All Items",
  "Electronics",
  "Home Appliances",
  "Furniture",
  "Tools & Equipment",
  "Travel & Outdoor",
  "Sports & Fitness",
  "Events & Party",
  "Other Items",
];

export const POPULAR_TAGS = [
  "Sony A7 IV",
  "MacBook Pro M3",
  "DJI Air 3",
  "iPad Pro M4",
  "Máy chiếu 4K",
  "Bose S1 Pro+",
];

export const SONY_A7_IV_GALLERY = [
  {
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuAI4VIukCfCxINDFprJs9KDEZTeJ09Gtg6n1UjotZlqyrFm2n2eiUH92gzpzIsJm-JSYEKlx7X03PW4rbVR-p1esESMMOXeUNBL2byuS71VsIfcAytadbvs4J8t4bnipIewPYlz5UC_uP3DbNH4Fh8AvV3WcAC6LrSGLW1w_dM5YoywbH2TyCqVbciO8DK3fPu0hZL4HO8RMEv0L_zF6w6ca2CfL7Xsw3pqLdSMoZYFA9CPuUGQi0KykQ",
    alt: "Thân máy ảnh Sony Alpha A7 IV gắn ống kính 24-70mm f/2.8 GM trong studio ánh sáng tự nhiên.",
  },
  {
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuCwH7zYBmf-zBNeIYwgzKZG2q0mnR-ZRQ8eNULKLGNaedMPVROs4ALeU7_Tb_o_5YjmkdtmjpOl0Vb0AnW2zsHtEH9GmJU9t1qBiUCJEYJU0WU9ba_guV4i1--lFeyxWGvtBeNaFjXD_mH3uShJ6Wp8Fnl615mXAdy_qUykHRm4fH6bj5AEqJyNqsjVL_tDpFOd3kyhBTHyVtNb9CjzJL56gBVcXGruVAkMzKyr1vnOo2XlbpnFpZ7kTQ",
    alt: "Góc chụp chính diện ngàm ống kính và thấu kính Sony G Master trong trẻo không bụi xước.",
  },
  {
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDYIXfi4MVM2EN1Cv_NSDEpkfHJMvs-MQNrSOXBJn2i038hpdvsn9KuJ0qH-Eg0IJ7ZFzwqRAVqoHQEqVsFunpJJGsnIxoC_bbuFBtQwfSiKmxkzHe-6M02eM9qDmpl4a8nknGmnRRy0ui6zzucfPR_FfiomiLdChWO1d05zj1X_Mqqryy-uua4UX_nYJpuVsxWzWVnNWJ78JAQ0F__5waE1hyOPrCGOcYTvqwhpcCwoCdyrDlYn4Rcdw",
    alt: "Cận cảnh cảm biến Full-Frame Exmor R 33MP đã được vệ sinh kiểm định tại Campus Hub.",
  },
  {
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuAo_Hums8iPEhu3Jlc_rR6Wj92Mq9mHRdwUMEjWEo6dPFora1lmQR-Wxr-sFtSpSPTEqiQRjSkte_P-DSYkFIDRkXfkU2NXY7hSex3nDZlHh_ozvPukTctLGXzladCpTEyy9WC9mwaPEIPOlJbezb5TXPfPnHcsOJ88NgPDSj5_QW_0hauyIMBicVrRPXy2sD3bdwONcsV1Qtw_B4IIpzQ-hFRMjArjIu46Gy8nbAH172IEbvO9NCwYQA",
    alt: "Mặt sau máy ảnh Sony A7 IV với màn hình cảm ứng xoay lật 3.0 inch sắc nét.",
  },
  {
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuBWxeFDoVRlJ__8Pk67TcXJpqgpxKZa7nJl9RojmKORP1_taaNXL1SgAQAIh1vl5pAEaeLxg3pXdMwtLzH76Jnrz8iTssii8hM9YQUodcwehE06H0ISYxWn7n92CnzbMGMXgdkeB0D190AVzoDq1Ma1rIMF5rAr_nfLbqwhc2j-EdiLy6c2ht3Q9GIh-e00ANC5iPN-aQ_jfjeJc6ZjMAjWs54pdLStVEv4Eobm3U1XH1jZMz8llI1NDg",
    alt: "Trọn bộ phụ kiện đi kèm: 2 pin zin NP-FZ100, đốc sạc đôi USB-C, thẻ nhớ 128GB V90 và túi chống sốc.",
  },
];

const ELENA = SYSTEM_USERS[0];
const ALEX = SYSTEM_USERS[1];
const MINH_QUAN = SYSTEM_USERS[2];
const LAN_ANH = SYSTEM_USERS[3];
const HOANG_NAM = SYSTEM_USERS[4];
const TUAN_KIET = SYSTEM_USERS[5];
const MINH_ANH = SYSTEM_USERS[6];

export const RENTAL_ITEMS: RentalListingItem[] = [
  {
    id: "sony-a7-iv",
    dbId: 1,
    categoryId: 1,
    brand: "Sony",
    title: "Bộ Máy Ảnh Mirrorless Sony Alpha A7 IV & Lens 24-70mm GM",
    category: "Electronics",
    categoryLabel: "MÁY ẢNH & QUAY PHIM",
    condition: "Like New",
    conditionScore: "Như mới (Tình trạng 9.8/10)",
    rating: 4.9,
    reviews: 38,
    location: "Khu ĐHQG, TP. Thủ Đức",
    distance: "1.2 km",
    pickupArea: "Smart Locker #B14 - Nhà Văn Hóa Sinh Viên",
    pricePerDay: 45,
    weeklyPrice: 270,
    securityDeposit: 150,
    insuredUpTo: 3000,
    status: "AVAILABLE",
    ownerId: ELENA.id,
    ownerName: ELENA.fullName,
    ownerEmail: ELENA.email,
    ownerAvatar: ELENA.avatar,
    ownerUniversity: ELENA.university,
    ownerRating: ELENA.rating,
    ownerReviews: ELENA.reviews,
    ownerResponseTime: ELENA.responseTime,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD7q3WyHGwQczGxonMteIjyfBaTvXGwDJ_ur1L9QlcuVqfQMusOSmMoMh6XCFl-eIktAvTmqL1dyo8poZ5-A7l0Lk3JPQDWtYtHEfEYPBMLYEn6oClvM8jXwWDzlwxm3ia91lkfK1Khvslbs26LNUy6x9ZNLoI9QiKpX_Zrs-IiprBPs9fCC7PBsZ7UgSIAM9DfzayhJMV3gDlKZ33XixI_cDXpPSYJu7PCqMAW3i_yNiiPOv4IqNbx1A",
    alt: "Bộ máy ảnh Sony Alpha A7 IV kèm ống kính 24-70mm f/2.8 GM chuyên nghiệp.",
    gallery: SONY_A7_IV_GALLERY,
    summary:
      "Máy ảnh Full-Frame 33MP đa dụng hàng đầu cho đồ án nhiếp ảnh, quay MV sinh viên và sự kiện CLB với chuẩn quay 4K 60p 10-bit 4:2:2. Đi kèm vali chống sốc Pelican, 2 pin zin NP-FZ100, sạc nhanh đôi và thẻ nhớ SD 128GB V90 tốc độ cao.",
    includedInKit: [
      "Thân máy Sony Alpha A7 IV (Firmware v3.01)",
      "Ống kính Sony FE 24-70mm f/2.8 GM",
      "2× Pin sạc chính hãng Sony NP-FZ100",
      "Thẻ nhớ SanDisk Extreme Pro 128GB V90",
      "Đốc sạc nhanh 2 cổng USB-C",
      "Dây đeo thao tác nhanh Peak Design Slide",
      "Vali chống nước & chống va đập Pelican 1450",
    ],
    specifications: [
      { label: "Cảm biến", value: "33MP Full-Frame Exmor R CMOS" },
      { label: "Chuẩn quay video", value: "4K 60p 10-bit 4:2:2 S-Log3" },
      { label: "Dải ISO", value: "100 – 51,200 (Mở rộng 204,800)" },
      { label: "Ngàm ống kính", value: "Sony E-Mount" },
      { label: "Chống rung", value: "5 trục SteadyShot trong thân máy" },
      { label: "Trọng lượng thân máy", value: "658g (đã gồm pin & thẻ nhớ)" },
    ],
    keywords: ["Sony FX3", "Sony A7 IV", "Camera", "Máy ảnh", "Quay phim"],
  },
  {
    id: "macbook-pro-16-m3-max",
    dbId: 2,
    categoryId: 2,
    brand: "Apple",
    title: 'Apple MacBook Pro 16" M3 Max (64GB RAM / 2TB SSD)',
    category: "Electronics",
    categoryLabel: "LAPTOP & ĐỒ HỌA",
    condition: "Like New",
    conditionScore: "Như mới (Tình trạng 9.9/10)",
    rating: 5.0,
    reviews: 42,
    location: "Quận 10, TP.HCM",
    distance: "2.1 km",
    pickupArea: "Smart Locker #A04 - Khu Công Nghệ Bách Khoa",
    pricePerDay: 68,
    weeklyPrice: 405,
    securityDeposit: 250,
    insuredUpTo: 4000,
    status: "AVAILABLE",
    ownerId: ELENA.id,
    ownerName: ELENA.fullName,
    ownerEmail: ELENA.email,
    ownerAvatar: ELENA.avatar,
    ownerUniversity: ELENA.university,
    ownerRating: ELENA.rating,
    ownerReviews: ELENA.reviews,
    ownerResponseTime: ELENA.responseTime,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDShP6KcUfhQWJUdWdmdlXxbL_s3QfPJI8zDmDMbNum0sJzIWTa4IiKpKSga1Gex9DTPa4Pudj7ENU9jy5M2HsQTrt04z0IexJGx-2TELX0r3hVfYUXyeHdGg2D6B9es_1hZlgR2nEka0nSBrRBLBnCgmeoSMCIrNPmFSkmW1m3pTqU7t_hjgFprO730ZGsEIrSFDiKJYLkmDBhpzMzMXd3jOeUWaOGwZnSOEm9hQGpF27V2VeQ4ou5zw",
    alt: "Apple MacBook Pro 16 inch M3 Max màu Space Black trên bàn làm việc.",
    gallery: [
      {
        src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDShP6KcUfhQWJUdWdmdlXxbL_s3QfPJI8zDmDMbNum0sJzIWTa4IiKpKSga1Gex9DTPa4Pudj7ENU9jy5M2HsQTrt04z0IexJGx-2TELX0r3hVfYUXyeHdGg2D6B9es_1hZlgR2nEka0nSBrRBLBnCgmeoSMCIrNPmFSkmW1m3pTqU7t_hjgFprO730ZGsEIrSFDiKJYLkmDBhpzMzMXd3jOeUWaOGwZnSOEm9hQGpF27V2VeQ4ou5zw",
        alt: "Apple MacBook Pro 16 inch M3 Max màu Space Black chính hãng.",
      },
      {
        src: "https://lh3.googleusercontent.com/aida-public/AB6AXuD25Po2n_JnCXwtgfZMJclDlZ7pH5gPhtYbdrlJqZdoJxB_2_sBUhOat6o5qHtSUrwzD51BW1QRxaH_QNFzfg9gp7VachHv06df3z4LqTzxwm-HGv6QWm0XvNbHIH1HRRSJiCR91fetTg8LI6Mbt_6OEPFaa_RnyR_6KRzN5hAApVuQ24-PXxBSSB59unpwx6lU2KuhsJJDnIsb1yOa1dEfJRbmIYqFdBPS9ii1z68Ir_5jFbT44fDrfg",
        alt: "Màn hình Liquid Retina XDR 16.2 inch tần số quét 120Hz ProMotion chuẩn màu đồ họa.",
      },
      {
        src: "https://lh3.googleusercontent.com/aida-public/AB6AXuBRRqG-9tBSbzdegYbjV6zPg5zacLIpy9S4sLDWfgjSb6UXl7k_c2VjoGwYFfeVZ1d6t8HEh1AJukOfrhISqhiqi9nYMvTCe8EtxF-_QU8Gtnsm6M3wLTfO26PsvA6r3kWK_qYw3iBIOGTFHkVjQsPre-YH3VyeCXGatfY2BpeZVvGA6EcxdA4Qtit1urS3EJJICHDNt4U3j77wpHveG8uOMsmGn3FArPRZ_1KyITDd_VNtfbfAJtsi5Tg-ChhSlnm4m5swGLYzWdxb",
        alt: "Góc chụp nghiêng thân máy nhôm nguyên khối Space Black kèm cổng MagSafe 3 & Thunderbolt 4.",
      },
    ],
    summary:
      "Trạm làm việc di động mạnh mẽ nhất với chip Apple M3 Max (16 nhân CPU, 40 nhân GPU, 64GB Unified RAM). Cực kỳ lý tưởng để dựng phim 8K ProRes, render đồ án kiến trúc 3D Blender/Cinema4D và huấn luyện mô hình AI/Machine Learning trong kỳ đồ án.",
    includedInKit: [
      'Apple MacBook Pro 16" M3 Max (Space Black)',
      "Củ sạc nhanh Apple 140W USB-C GaN",
      "Cáp sạc dù USB-C to MagSafe 3 (2m)",
      "Cáp truyền dữ liệu Thunderbolt 4 Pro (1.8m)",
      "Túi chống sốc 360° Tomtoc",
      "Đầu đọc thẻ nhớ CalDigit SD 4.0 UHS-II",
    ],
    specifications: [
      { label: "Vi xử lý", value: "Apple M3 Max (16-core CPU)" },
      { label: "Đồ họa GPU", value: "40-core GPU hỗ trợ Ray Tracing" },
      { label: "Bộ nhớ RAM", value: "64GB Unified Memory (400GB/s)" },
      { label: "Ổ cứng lưu trữ", value: "2TB NVMe SSD tốc độ cao" },
      { label: "Màn hình", value: '16.2" Liquid Retina XDR (120Hz ProMotion)' },
      { label: "Trọng lượng", value: "2.16 kg" },
    ],
    keywords: ["MacBook Pro M3", "Laptop", "Apple", "Render", "Đồ họa"],
  },
  {
    id: "dewalt-20v-max",
    dbId: 3,
    categoryId: 4,
    brand: "DeWalt",
    title: "Bộ Máy Khoan & Bắt Vít Không Dây DeWalt 20V MAX XR",
    category: "Tools & Equipment",
    categoryLabel: "DỤNG CỤ & KỸ THUẬT",
    condition: "Good",
    conditionScore: "Tốt (Tình trạng 9.2/10)",
    rating: 4.8,
    reviews: 27,
    location: "Bình Thạnh, TP.HCM",
    distance: "3.0 km",
    pickupArea: "Xưởng Kỹ Thuật MakerSpace - Khu B",
    pricePerDay: 24,
    weeklyPrice: 140,
    securityDeposit: 80,
    insuredUpTo: 800,
    status: "AVAILABLE",
    ownerId: MINH_QUAN.id,
    ownerName: MINH_QUAN.fullName,
    ownerEmail: MINH_QUAN.email,
    ownerAvatar: MINH_QUAN.avatar,
    ownerUniversity: MINH_QUAN.university,
    ownerRating: MINH_QUAN.rating,
    ownerReviews: MINH_QUAN.reviews,
    ownerResponseTime: MINH_QUAN.responseTime,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA9DST6SHxcr9eaIO5QBzV0alHUWe0JyVRV3Fqz5nE4K_9qvi61dBXMV8xM8UKRjK63qnTr3EZAz3MZqGUlkc14hF1NLe2CCMui8V3vmZb0zInQULOYIWWKeJbHN-BAr2EPxSTFpYVxbMfCT7d8kV75pPWNe4d0Ftecfagzvz9gayn00Rsl4e_5hbLe39ESd_VciHUB-Q_MVO8AAf7NTcnBNzMcK9pcKDKailJpZSHPTQni38A02QA0NA",
    alt: "Bộ máy khoan và máy vặn vít dùng pin DeWalt 20V MAX trong hộp nhựa chuyên dụng.",
    gallery: [
      {
        src: "https://lh3.googleusercontent.com/aida-public/AB6AXuA9DST6SHxcr9eaIO5QBzV0alHUWe0JyVRV3Fqz5nE4K_9qvi61dBXMV8xM8UKRjK63qnTr3EZAz3MZqGUlkc14hF1NLe2CCMui8V3vmZb0zInQULOYIWWKeJbHN-BAr2EPxSTFpYVxbMfCT7d8kV75pPWNe4d0Ftecfagzvz9gayn00Rsl4e_5hbLe39ESd_VciHUB-Q_MVO8AAf7NTcnBNzMcK9pcKDKailJpZSHPTQni38A02QA0NA",
        alt: "Bộ máy khoan động lực và bắt vít không chổi than DeWalt 20V MAX XR chính hãng.",
      },
      {
        src: "https://lh3.googleusercontent.com/aida-public/AB6AXuB2hT-fpcgGxw44HNj36g8MG3mL9h0lJTJo6Czd-E-7NJXpHL9OIjXLTthXpZ4soBumwHG-BNJt3vKJxetMJDOUvUVHmTEr-2StvAE-jY_NuPtiuUbicWgkIIzzWjsCiNfJkLBDO74t3OcLC6iQ2gyLyzUCW7yuTmH0eqWZCANc4cUKrOnDhD9Ug2a1p-YCCHLT1q7HSDykYNCUW40ILHoUuZP0PV70MqVF97IvzSzcGb9H2s1lRX4uIA",
        alt: "Trọn bộ hộp kỹ thuật DeWalt kèm 2 pin Lithium-Ion 5.0Ah và bộ mũi khoan Titanium.",
      },
    ],
    summary:
      "Bộ đôi máy khoan động lực và máy bắt vít xung lực không chổi than DeWalt 20V MAX XR, kèm 2 viên pin 5.0Ah dung lượng lớn và bộ 45 mũi khoan/vít Titanium. Phù hợp thi công mô hình kiến trúc, lắp ráp phòng trọ và chế tạo robot.",
    includedInKit: [
      "Máy khoan động lực không chổi than DeWalt DCD791",
      "Máy vặn vít xung lực DeWalt DCF887 20V MAX XR",
      "2× Pin Lithium-Ion DeWalt 20V MAX 5.0Ah",
      "Đốc sạc nhanh DCB115",
      "Hộp 45 mũi khoan & đầu vít phủ Titanium",
      "Thùng đựng chống va đập DeWalt ToughSystem",
    ],
    specifications: [
      { label: "Điện áp hoạt động", value: "20V MAX XR Brushless" },
      { label: "Lực siết tối đa", value: "205 Nm (1,825 in-lbs)" },
      { label: "Đầu kẹp mũi khoan", value: "13mm (1/2 inch) kim loại" },
      { label: "Tốc độ không tải", value: "2 cấp (0-550 / 0-2,000 vòng/phút)" },
      { label: "Dung lượng pin", value: "2× 5.0Ah Lithium-Ion" },
      { label: "Tổng trọng lượng bộ", value: "4.8 kg (gồm thùng máy)" },
    ],
    keywords: ["DeWalt", "Khoan", "Dụng cụ", "Tools"],
  },
  {
    id: "dji-air-3",
    dbId: 4,
    categoryId: 1,
    brand: "DJI",
    title: "Flycam DJI Air 3 Fly More Combo (Kèm Điều Khiển RC 2)",
    category: "Electronics",
    categoryLabel: "FLYCAM & QUAY TRÊN KHÔNG",
    condition: "Like New",
    conditionScore: "Như mới (Tình trạng 9.8/10)",
    rating: 4.9,
    reviews: 51,
    location: "Quận 7, TP.HCM",
    distance: "1.9 km",
    pickupArea: "Smart Locker #C08 - Khu Đô Thị Nam Sài Gòn",
    pricePerDay: 52,
    weeklyPrice: 310,
    securityDeposit: 180,
    insuredUpTo: 2200,
    status: "AVAILABLE",
    ownerId: ELENA.id,
    ownerName: ELENA.fullName,
    ownerEmail: ELENA.email,
    ownerAvatar: ELENA.avatar,
    ownerUniversity: ELENA.university,
    ownerRating: ELENA.rating,
    ownerReviews: ELENA.reviews,
    ownerResponseTime: ELENA.responseTime,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBd5zfYSglIP26Ei380I-MRYnkB99ZXk0cCTrTMUF6GL1grkvJCSCB7BmkE3fdDe_6bLVPKogRlSyYIvcL7CefnMQVb-eKaYEfX4rumQDIg1oRlnJaRuSRCJ1z6OnE1XLl5dJmvHpTiix9w4P0qennAKQa1do9SEm3YAbimHoKMkM2PI49fe1zCWciKLjIETSfSBsVpcjoKq-ig3HiYVslIBwAQq_hoCCGNtW1pC5nXIjIIlRCk_fxlcA",
    alt: "Flycam DJI Air 3 cùng tay cầm điều khiển màn hình tích hợp DJI RC 2.",
    gallery: [
      {
        src: "https://lh3.googleusercontent.com/aida-public/AB6AXuBd5zfYSglIP26Ei380I-MRYnkB99ZXk0cCTrTMUF6GL1grkvJCSCB7BmkE3fdDe_6bLVPKogRlSyYIvcL7CefnMQVb-eKaYEfX4rumQDIg1oRlnJaRuSRCJ1z6OnE1XLl5dJmvHpTiix9w4P0qennAKQa1do9SEm3YAbimHoKMkM2PI49fe1zCWciKLjIETSfSBsVpcjoKq-ig3HiYVslIBwAQq_hoCCGNtW1pC5nXIjIIlRCk_fxlcA",
        alt: "Flycam DJI Air 3 hệ thống camera kép kèm điều khiển màn hình DJI RC 2.",
      },
      {
        src: "https://lh3.googleusercontent.com/aida-public/AB6AXuBeXy7y7Z0DF6g-7xhRu1ooDgsqkOUpc_5sa0yj-h8dwM9WL_wW3xFYyr94Vc9GBprxOyN7V5CZuKfzkrqRTdyhJeLe-qCDPVuCw0GVQzld60UW9Gl_UcRGPZts7ON8smmPhTvLpfDQXjeUasXceN6P6ZhGLfUf6AJC_0_qoQeYfeu5pT4L4Ylot8gHDEKMM7TQghrvidhBo6wPHjTlQc1X63CLJo_6evBY0MCSfdXrGht6FKVc0oXqig",
        alt: "Trọn bộ Fly More Combo: 3 pin bay thông minh 46 phút, hub sạc và túi đeo chống sốc DJI.",
      },
    ],
    summary:
      "Flycam hệ thống camera kép (ống kính góc rộng 24mm và tele 3x 70mm) hỗ trợ quay 4K/60fps HDR sắc nét, cảm biến tránh vật cản toàn hướng 360 độ và thời lượng bay lên tới 46 phút mỗi viên pin.",
    includedInKit: [
      "Máy bay Flycam DJI Air 3 Dual-Camera",
      "Tay cầm điều khiển DJI RC 2 (Tích hợp màn hình FHD siêu sáng)",
      "3× Pin bay thông minh (46 phút/viên)",
      "Hub sạc tuần tự 3 pin",
      "Bộ kính lọc điện ảnh Freewell ND8/16/32/64",
      "Thẻ nhớ SanDisk Extreme 256GB microSDXC",
      "Túi đeo vai chống sốc DJI & 3 cặp cánh dự phòng",
    ],
    specifications: [
      { label: "Hệ thống Camera", value: "Kép 48MP (24mm Wide + 70mm 3x Tele)" },
      { label: "Thời gian bay tối đa", value: "46 phút / viên pin" },
      { label: "Độ phân giải Video", value: "4K 100fps Slow-Mo / 4K 60fps HDR" },
      { label: "Cảm biến an toàn", value: "Tránh vật cản đa hướng 360°" },
      { label: "Truyền sóng hình ảnh", value: "DJI O4 20km 1080p/60fps" },
      { label: "Trọng lượng cất cánh", value: "720g" },
    ],
    keywords: ["DJI Mini 4 Pro", "DJI Air 3", "Drone", "Flycam"],
  },
  {
    id: "xgimi-horizon-pro-4k",
    dbId: 5,
    categoryId: 2,
    brand: "XGIMI",
    title: "Máy Chiếu Thông Minh XGIMI Horizon Pro 4K UHD",
    category: "Electronics",
    categoryLabel: "MÁY CHIẾU & TRÌNH CHIẾU",
    condition: "Like New",
    conditionScore: "Như mới (Tình trạng 9.7/10)",
    rating: 4.9,
    reviews: 19,
    location: "Quận 1, TP.HCM",
    distance: "1.5 km",
    pickupArea: "Smart Locker #D02 - Thư Viện Trung Tâm",
    pricePerDay: 35,
    weeklyPrice: 210,
    securityDeposit: 120,
    insuredUpTo: 1800,
    status: "AVAILABLE",
    ownerId: HOANG_NAM.id,
    ownerName: HOANG_NAM.fullName,
    ownerEmail: HOANG_NAM.email,
    ownerAvatar: HOANG_NAM.avatar,
    ownerUniversity: HOANG_NAM.university,
    ownerRating: HOANG_NAM.rating,
    ownerReviews: HOANG_NAM.reviews,
    ownerResponseTime: HOANG_NAM.responseTime,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAk3YxyUveFWRcLmW_xYQF0Pu3FfaSo9OzB6H09iK5D-xtasfNeuqE8MhUft8668gBTQ42J09oHNd__Ptoa9sN4ieUQd1kchsvG_T4WkZBmKQ_LViN5TnwFalZm0rjwnxBy50pw0akH1bqxO8NXApSkjoW9U7OuJ2RksiPGbcQBPbus8VuIdfUqQAwfm72rI3EotUG6I2xraMyeZjF3LsshzITLjycG93qsbuuE5XcQQOYzjRhvYK6cUw",
    alt: "Máy chiếu thông minh XGIMI Horizon Pro 4K thiết kế vỏ kim loại nguyên khối.",
    gallery: [
      {
        src: "https://lh3.googleusercontent.com/aida-public/AB6AXuAk3YxyUveFWRcLmW_xYQF0Pu3FfaSo9OzB6H09iK5D-xtasfNeuqE8MhUft8668gBTQ42J09oHNd__Ptoa9sN4ieUQd1kchsvG_T4WkZBmKQ_LViN5TnwFalZm0rjwnxBy50pw0akH1bqxO8NXApSkjoW9U7OuJ2RksiPGbcQBPbus8VuIdfUqQAwfm72rI3EotUG6I2xraMyeZjF3LsshzITLjycG93qsbuuE5XcQQOYzjRhvYK6cUw",
        alt: "Máy chiếu thông minh XGIMI Horizon Pro 4K UHD kèm hệ thống loa Harman Kardon.",
      },
      {
        src: "https://lh3.googleusercontent.com/aida-public/AB6AXuC-ElZWWC1As3eTch-qTDHlAqJyB-nffNmW7gku82jRJMCIEwwypkpW0_P2qsnNkYUAcSnQRjspwH4ujzbEItC2vjP4VZrtISOybwkLJijnH1jnfLT8pGGjNAhZUlG11ihVULYd-LFdNrcT-AUiswRI1_AUoPZuSYOX5IjgKGhEXbnLxmyInt_4O8AFmCsnE_LfNl9qbucIkm5WD0yzQOgUwDL556eQQr-ypceAPVD4gYtlq0yUXG6CvQ",
        alt: "Góc nhìn cận cảnh ống kính quang học độ sáng 1500 ISO Lumens và cảm biến Auto Keystone.",
      },
    ],
    summary:
      "Máy chiếu độ phân giải thực 4K UHD độ sáng cao 1500 ISO Lumens, tích hợp loa kép Harman Kardon 16W và tính năng tự động căn chỉnh vuông hình thông minh. Tuyệt vời cho buổi thuyết trình đồ án, triển lãm nghệ thuật và chiếu phim CLB.",
    includedInKit: [
      "Máy chiếu thông minh XGIMI Horizon Pro 4K",
      "Điều khiển giọng nói Bluetooth vỏ nhôm",
      "Chân đế xoay 360° XGIMI Desktop Stand",
      "Cáp HDMI 2.1 bọc dù tốc độ cao (3m)",
      "Bộ nguồn Adapter & Dây nối dài 5m",
      "Vali EVA chống sốc chuyên dụng",
    ],
    specifications: [
      { label: "Độ phân giải thực", value: "3840 × 2160 (True 4K UHD)" },
      { label: "Độ sáng", value: "1500 ISO Lumens" },
      { label: "Hệ thống âm thanh", value: "Loa kép 8W Harman Kardon + DTS-HD" },
      { label: "Kích thước khung chiếu", value: '40" – 200" (Auto Keystone)' },
      { label: "Kết nối", value: "HDMI 2.0, USB, Wi-Fi Dual-band, Chromecast" },
      { label: "Trọng lượng", value: "2.9 kg" },
    ],
    keywords: ["Máy chiếu 4K", "Projector", "XGIMI"],
  },
  {
    id: "dyson-v15-detect",
    dbId: 6,
    categoryId: 3,
    brand: "Dyson",
    title: "Máy Hút Bụi Không Dây Dyson V15 Detect Fluffy Optic",
    category: "Home Appliances",
    categoryLabel: "THIẾT BỊ GIA DỤNG",
    condition: "Like New",
    conditionScore: "Như mới (Tình trạng 9.6/10)",
    rating: 4.7,
    reviews: 33,
    location: "Thảo Điền, TP. Thủ Đức",
    distance: "2.8 km",
    pickupArea: "Smart Locker #E05 - Khu Căn Hộ Sinh Viên",
    pricePerDay: 22,
    weeklyPrice: 132,
    securityDeposit: 90,
    insuredUpTo: 900,
    status: "AVAILABLE",
    ownerId: LAN_ANH.id,
    ownerName: LAN_ANH.fullName,
    ownerEmail: LAN_ANH.email,
    ownerAvatar: LAN_ANH.avatar,
    ownerUniversity: LAN_ANH.university,
    ownerRating: LAN_ANH.rating,
    ownerReviews: LAN_ANH.reviews,
    ownerResponseTime: LAN_ANH.responseTime,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD2RyYwpimYSjHZDyDEHNTWUA7E2KQJTHFzpCQPkDglyl2pQU5jIj5ItkuZxiLJVFi9Dq2QEQKO3NP6O9I2DqBf_yQuRMkHlOpM0THX5CqPkemkBWhsIX3J0dr6FAhl1P6K9VOQo3PZfY0K1traSNMDnFUiKFIXOk-qTRSJp8J3oC9uQfOAu3drbhkoHdepgucVXlksnwCjUvpIFXQ27A3PIcIzrP6X0VoaTteCAVgfbGNswPG0BD3yOw",
    alt: "Máy hút bụi không dây Dyson V15 Detect kèm đầu hút chiếu tia sáng phát hiện bụi mịn.",
    gallery: [
      {
        src: "https://lh3.googleusercontent.com/aida-public/AB6AXuD2RyYwpimYSjHZDyDEHNTWUA7E2KQJTHFzpCQPkDglyl2pQU5jIj5ItkuZxiLJVFi9Dq2QEQKO3NP6O9I2DqBf_yQuRMkHlOpM0THX5CqPkemkBWhsIX3J0dr6FAhl1P6K9VOQo3PZfY0K1traSNMDnFUiKFIXOk-qTRSJp8J3oC9uQfOAu3drbhkoHdepgucVXlksnwCjUvpIFXQ27A3PIcIzrP6X0VoaTteCAVgfbGNswPG0BD3yOw",
        alt: "Máy hút bụi không dây Dyson V15 Detect Fluffy Optic chính hãng.",
      },
      {
        src: "https://lh3.googleusercontent.com/aida-public/AB6AXuCurtKTZjtj7Lumn3Zz3kRJPMQ9bU_wY4zxbR9DuQsawAfrv3yTMSUZzkzwE6lWDq1-GxTsrFWMDribBY60a4Idk9RJ5QP9ao5_tWiSYKSNyEIIhl4JgYNOAY94whnbW1zmEBl_OyiVIvAu-fmBccicGjqM9mfWWvanAGWFBJOr4w2VoqF6IdeClRLIYkeqixWT-aAbYv1okE4iVlGZfz7RVU2zrQUh5tOOK05NnzdlX9c2DL-2LhVXeA",
        alt: "Thân máy Dyson V15 Detect đặt trên đốc sạc kèm bộ đầu hút đa năng đã khử khuẩn.",
      },
    ],
    summary:
      "Máy hút bụi không dây lực hút siêu mạnh 240AW với đầu hút chiếu tia sáng xanh Fluffy Optic phát hiện bụi mịn vô hình và cảm biến tự điều chỉnh công suất. Rất tiện lợi khi tổng vệ sinh phòng trọ, căn hộ trước khi chuyển nhà hoặc trả phòng.",
    includedInKit: [
      "Thân máy Dyson V15 Detect + Lõi lọc HEPA đã khử khuẩn",
      "Đầu hút chiếu sáng Fluffy Optic (Sàn cứng)",
      "Đầu hút chống rối tóc Digital Motorbar (Thảm & Nệm)",
      "Đầu hút mini hút sofa & giường nệm",
      "Đầu hút khe hẹp & chổi quét đa năng",
      "Pin dung lượng cao tháo rời & Bộ sạc",
    ],
    specifications: [
      { label: "Công suất hút", value: "240 AW (Động cơ Hyperdymium)" },
      { label: "Thời lượng pin", value: "Lên đến 60 phút (Chế độ Eco)" },
      { label: "Hệ thống lọc", value: "HEPA toàn máy (Giữ 99.99% hạt 0.1µm)" },
      { label: "Dung tích hộp bụi", value: "0.77 Lít" },
      { label: "Màn hình hiển thị", value: "LCD thống kê mật độ bụi thời gian thực" },
      { label: "Trọng lượng", value: "3.08 kg" },
    ],
    keywords: ["Dyson V15", "Máy hút bụi", "Gia dụng"],
  },
  {
    id: "rimowa-original-cabin",
    dbId: 7,
    categoryId: 5,
    brand: "Rimowa",
    title: "Vali Nhôm Cao Cấp Rimowa Original Cabin Silver",
    category: "Travel & Outdoor",
    categoryLabel: "DU LỊCH & HÀNH LÝ",
    condition: "Good",
    conditionScore: "Tốt (Tình trạng 9.4/10)",
    rating: 4.9,
    reviews: 44,
    location: "Quận 3, TP.HCM",
    distance: "2.1 km",
    pickupArea: "Smart Locker #A12 - Ga Metro Trung Tâm",
    pricePerDay: 28,
    weeklyPrice: 165,
    securityDeposit: 150,
    insuredUpTo: 1600,
    status: "AVAILABLE",
    ownerId: ALEX.id,
    ownerName: ALEX.fullName,
    ownerEmail: ALEX.email,
    ownerAvatar: ALEX.avatar,
    ownerUniversity: ALEX.university,
    ownerRating: ALEX.rating,
    ownerReviews: ALEX.reviews,
    ownerResponseTime: ALEX.responseTime,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDb-XhpbUQUnrJTrpTYxcUjACSvnf7bNOyJyFzOKrmKerDqFk387VLyNSLvlHgGqQSLTf1PJpvSTR9-PR8gyEWVazS9RdyMBtr91sJ_8jVvQiUFVBzISIu69hbcxF0fHF8hHwdWM2U_CrZkVdy0zclt_9HLgidLg7rpHAP6Xxnm6roU8S_tgLA87RgW7PuX0zdOR2XhBpzd2Rl-3S_Pg2OEFIlTFwxikqfrg0l1O5QVg4R_IEGZqpYJWw",
    alt: "Vali nhôm nguyên khối Rimowa Original Cabin màu bạc sang trọng.",
    gallery: [
      {
        src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDb-XhpbUQUnrJTrpTYxcUjACSvnf7bNOyJyFzOKrmKerDqFk387VLyNSLvlHgGqQSLTf1PJpvSTR9-PR8gyEWVazS9RdyMBtr91sJ_8jVvQiUFVBzISIu69hbcxF0fHF8hHwdWM2U_CrZkVdy0zclt_9HLgidLg7rpHAP6Xxnm6roU8S_tgLA87RgW7PuX0zdOR2XhBpzd2Rl-3S_Pg2OEFIlTFwxikqfrg0l1O5QVg4R_IEGZqpYJWw",
        alt: "Vali nhôm nguyên khối Rimowa Original Cabin màu bạc chuẩn hành lý xách tay.",
      },
      {
        src: "https://lh3.googleusercontent.com/aida-public/AB6AXuD9T62oXmlFWHvlKFmsO1Y7UdACAsYRoSYniUeag3esHZ2AIQaVc0e6MG0yaiiE8XJ1MhpEd1oaVlBg9ZHzXhleB-vtg6ZJbWWx7SqHQfb_0kCeKHZfIdLvdW-VtGkGMEL-hV74f5WWIUgvgWTxuJkt579ktnb4nazKHqhaIumcU4mRb4i1uyyPJ_gl-ALFtIZI3g5AcMVI2J7Hv2vMkG-stiXBC-PanWa1jFcgAuzuHinYXBuyGjLBjA",
        alt: "Góc chụp chi tiết rãnh nhôm Anodized, khóa TSA đôi và bánh xe đa hướng Multiwheel.",
      },
      {
        src: "https://lh3.googleusercontent.com/aida-public/AB6AXuBHoUZftnrdDNLmj17AWYXJXF_MABejUg2w3d0nOOoLrzhLFVDiK-tEL7NyTqsV2FmL1vLpePH3Rb5sleP1_OM7z-niC1b8PKa_AAmgwsOMU9gAcDMxrqHtyOUNtFRb7j4mVRRCFahMLyoblDJTiI9_jpwfnjCrkJKiAheohbqsPWPy9Vgdbg90AFC4NTJiX7JWAKMA4N0ikPvKuZixkWyVDgv-IPUvlNSzpMcQbOGaeRI-bZ7-8aKrGavRM0Vn4dv9mHW_q5WgrBCW",
        alt: "Vali Rimowa Original Cabin kèm thẻ da chính hãng và túi bọc bảo vệ.",
      },
    ],
    summary:
      "Vali xách tay vỏ hợp kim nhôm Anodized chế tác tại Đức. Trang bị hệ thống bánh xe đa hướng Rimowa Multiwheel® siêu mượt, khóa số đôi chuẩn TSA và vách ngăn Flex Divider bảo vệ tuyệt đối thiết bị công nghệ khi đi thi đấu quốc tế hoặc công tác.",
    includedInKit: [
      "Vali Rimowa Original Cabin (Nhôm Bạc chuẩn xách tay)",
      "2× Vách ngăn điều chỉnh độ cao Flex Dividers",
      "Thẻ hành lý bằng da Rimowa chính hãng",
      "Túi vải bọc chống trầy xước khi di chuyển",
    ],
    specifications: [
      { label: "Kích thước", value: "55 × 40 × 23 cm (Chuẩn Cabin máy bay)" },
      { label: "Dung tích", value: "35 Lít" },
      { label: "Chất liệu vỏ", value: "Hợp kim nhôm Anodized cao cấp" },
      { label: "Hệ thống bánh xe", value: "Rimowa Multiwheel® xoay 360°" },
      { label: "Khóa bảo mật", value: "Khóa số đôi chuẩn an ninh TSA" },
      { label: "Trọng lượng", value: "4.3 kg" },
    ],
    keywords: ["Rimowa", "Vali", "Du lịch", "Travel"],
  },
  {
    id: "bose-s1-pro-plus",
    dbId: 8,
    categoryId: 8,
    brand: "Bose",
    title: "Loa Biểu Diễn Di Động Bose S1 Pro+ Kèm Mic Không Dây",
    category: "Events & Party",
    categoryLabel: "SỰ KIỆN & ÂM THANH",
    condition: "Like New",
    conditionScore: "Như mới (Tình trạng 9.9/10)",
    rating: 5.0,
    reviews: 29,
    location: "Quận 5, TP.HCM",
    distance: "2.5 km",
    pickupArea: "Smart Locker #F01 - Sảnh Hội Trường Sinh Viên",
    pricePerDay: 38,
    weeklyPrice: 225,
    securityDeposit: 130,
    insuredUpTo: 1200,
    status: "AVAILABLE",
    ownerId: TUAN_KIET.id,
    ownerName: TUAN_KIET.fullName,
    ownerEmail: TUAN_KIET.email,
    ownerAvatar: TUAN_KIET.avatar,
    ownerUniversity: TUAN_KIET.university,
    ownerRating: TUAN_KIET.rating,
    ownerReviews: TUAN_KIET.reviews,
    ownerResponseTime: TUAN_KIET.responseTime,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDrcswAAUQMBjuNfwjhgWG8KxtzUCv2i5kLWA0-z57JkS2NZQZVJKwfCfQgfs20GXxugnWxvL4_OeygSNpx3-ZuoxTiXrxsItAAhYtS4AVmjGIxwu3lBDhtzpJ_nr1RLCIFBR4uR68SyNDJxgzxoskElSztaiH_XXxrkc4XTdljm35I9q_t-mybM_eeO97Sfdnhgg6W-dCaB-tH5SW-y3h9iy71pREYsEuatvHSPbxp4THgFLn9YyJSNg",
    alt: "Loa di động chuyên nghiệp Bose S1 Pro+ kèm màn hình OLED hiển thị kênh mixer.",
    gallery: [
      {
        src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDrcswAAUQMBjuNfwjhgWG8KxtzUCv2i5kLWA0-z57JkS2NZQZVJKwfCfQgfs20GXxugnWxvL4_OeygSNpx3-ZuoxTiXrxsItAAhYtS4AVmjGIxwu3lBDhtzpJ_nr1RLCIFBR4uR68SyNDJxgzxoskElSztaiH_XXxrkc4XTdljm35I9q_t-mybM_eeO97Sfdnhgg6W-dCaB-tH5SW-y3h9iy71pREYsEuatvHSPbxp4THgFLn9YyJSNg",
        alt: "Loa biểu diễn di động Bose S1 Pro+ Wireless PA System chính hãng.",
      },
      {
        src: "https://lh3.googleusercontent.com/aida-public/AB6AXuB5L2saQDx-wQqEAP7Ztff4RfTs3RRhrJiWRJQ_0TXiQukhdXTODsG_uGI7Yva9C04ln8VNdsAf3BtmrdcA1gguHJa-Btthz3j25ur7iZtkTiksWBFA6OGuBVC4n2cvwI2NOd_UcPCsFuht6sCG5-AA4Uv0GkozwG7JHqtIUDCJDd_tL2pgktdHrpBLPVAwGqd3_2Jd2ZfZJ7T9hsCuJ5U4yQpLZg2o8NeNVIO0zmGIHALUuQ4BzuzuHQ",
        alt: "Bộ thu phát micro không dây đi kèm phục vụ biểu diễn Acoustic và sự kiện CLB.",
      },
    ],
    summary:
      "Hệ thống âm thanh biểu diễn di động dùng pin tích hợp bàn mixer kỹ thuật số 3 kênh, màn hình OLED, phát nhạc Bluetooth 5.0 và bộ thu micro/nhạc cụ không dây. Lựa chọn số 1 cho đêm nhạc Acoustic CLB, hội thảo và teambuilding.",
    includedInKit: [
      "Loa Bose S1 Pro+ Wireless PA System",
      "Micro hát chuyên nghiệp Shure SM58 + Cáp XLR",
      "Pin sạc Lithium-Ion Bose tích hợp (11 giờ)",
      "Chân đế loa hợp kim nhôm điều chỉnh độ cao",
      "Dây nguồn AC & Túi đeo bảo vệ chính hãng",
    ],
    specifications: [
      { label: "Bàn trộn âm thanh", value: "Mixer kỹ thuật số 3 kênh tích hợp" },
      { label: "Thời lượng pin", value: "Lên đến 11 giờ phát liên tục" },
      { label: "Kết nối không dây", value: "Bluetooth 5.0 + Thu phát RF tích hợp" },
      { label: "Cổng đầu vào", value: '2× Combo XLR-1/4", 1/4" Aux, 3.5mm' },
      { label: "Cảm biến vị trí", value: "Auto EQ tự động cân chỉnh 4 tư thế đặt" },
      { label: "Trọng lượng", value: "6.5 kg" },
    ],
    keywords: ["Bose S1 Pro+", "Loa", "Sự kiện", "Acoustic"],
  },
  {
    id: "dji-rs3-pro-gimbal",
    dbId: 9,
    categoryId: 1,
    brand: "DJI",
    title: "Gimbal Chống Rung Chuyên Nghiệp DJI RS 3 Pro Combo",
    category: "Electronics",
    categoryLabel: "GIMBAL & THIẾT BỊ QUAY",
    condition: "Like New",
    conditionScore: "Như mới (Tình trạng 9.8/10)",
    rating: 4.9,
    reviews: 31,
    location: "Khu ĐHQG, TP. Thủ Đức",
    distance: "1.4 km",
    pickupArea: "Smart Locker #B14 - Nhà Văn Hóa Sinh Viên",
    pricePerDay: 32,
    weeklyPrice: 190,
    securityDeposit: 120,
    insuredUpTo: 1500,
    status: "AVAILABLE",
    ownerId: ELENA.id,
    ownerName: ELENA.fullName,
    ownerEmail: ELENA.email,
    ownerAvatar: ELENA.avatar,
    ownerUniversity: ELENA.university,
    ownerRating: ELENA.rating,
    ownerReviews: ELENA.reviews,
    ownerResponseTime: ELENA.responseTime,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCZLPeyA08PN8tRtBH98U03CxwUI5GNhxmgMSS4zE4JEo8fgCcYWAZaNAOzfRoseGZEBR5OY0mZADH_o_jwRS39Ydoija7eTMVf_izueR4FKmwJ10p-j9Lct_gKr11oApcaJQNx6lj1DYzVJllU8JPrBPLjfxEPtIhGXI3nqO3_4EGiwDbbtWIVqTCEqAGDD1-hvfM1RjAMd4wmN6g4EJQTrVgpG760f_rnzecLj0AZB2JNBxJ_nKpb1w",
    alt: "Tay cầm chống rung sợi carbon DJI RS 3 Pro tải trọng lớn cho máy ảnh.",
    gallery: [
      {
        src: "https://lh3.googleusercontent.com/aida-public/AB6AXuCZLPeyA08PN8tRtBH98U03CxwUI5GNhxmgMSS4zE4JEo8fgCcYWAZaNAOzfRoseGZEBR5OY0mZADH_o_jwRS39Ydoija7eTMVf_izueR4FKmwJ10p-j9Lct_gKr11oApcaJQNx6lj1DYzVJllU8JPrBPLjfxEPtIhGXI3nqO3_4EGiwDbbtWIVqTCEqAGDD1-hvfM1RjAMd4wmN6g4EJQTrVgpG760f_rnzecLj0AZB2JNBxJ_nKpb1w",
        alt: "Gimbal chống rung sợi carbon DJI RS 3 Pro kèm màn hình cảm ứng OLED.",
      },
      {
        src: "https://lh3.googleusercontent.com/aida-public/AB6AXuBHQRsb3RZkL6XKkw0aEnCc9g8oU2SwpqkCJv2p5ViDPPQ1c0e2KWVZx-pzmnXqaK0S00pUfZXXRCOPWrhHhzgDcqb_HC5Y2vf3xi835sgRlRKnMHN2cPhAkYSjktYI8opWat6on8YKkhkr9XmKAOnNMeKttY4XKJV6lCcvjaDk0-jZZnYoYyX_tlzxnJwGFMBOxehOSZOKCN7qen8C-_8osHpBqOvF9qG_S0jZ7CZQH9-EZpCe7TanuQ",
        alt: "Trọn bộ phụ kiện DJI RS 3 Pro Combo kèm motor lấy nét và tay cầm Briefcase.",
      },
    ],
    summary:
      "Gimbal chống rung cánh tay sợi carbon siêu nhẹ chịu tải tới 4.5kg, tích hợp khóa trục tự động, màn hình cảm ứng OLED 1.8 inch và bộ truyền hình ảnh không dây Ronin RavenEye. Tương thích hoàn hảo với Sony A7 IV / FX3.",
    includedInKit: [
      "Thân Gimbal sợi carbon DJI RS 3 Pro",
      "Báng pin BG30 (Thời lượng 12 giờ, sạc nhanh PD)",
      "Motor lấy nét DJI Focus Motor (2022)",
      "Bộ truyền hình ảnh không dây Ronin Image Transmitter",
      "Tay cầm Briefcase Handle & Chân tripod kim loại",
      "Vali đựng chuyên dụng DJI RS 3 Pro Combo",
    ],
    specifications: [
      { label: "Tải trọng tối đa", value: "4.5 kg (10 lbs)" },
      { label: "Chất liệu khung", value: "Sợi Carbon nguyên tấm" },
      { label: "Màn hình điều khiển", value: '1.8" OLED cảm ứng màu' },
      { label: "Thời lượng pin", value: "12 giờ (Hỗ trợ sạc nhanh 24W)" },
      { label: "Khóa trục", value: "Tự động khóa/mở 3 trục (Automated Locks)" },
      { label: "Trọng lượng", value: "1.5 kg (bao gồm báng pin)" },
    ],
    keywords: ["Gimbal", "DJI RS3", "Chống rung", "Quay phim"],
  },
  {
    id: "sony-fe-70-200-gm-ii",
    dbId: 10,
    categoryId: 1,
    brand: "Sony",
    title: "Ống Kính Tele Sony FE 70-200mm f/2.8 GM OSS II",
    category: "Electronics",
    categoryLabel: "ỐNG KÍNH CHUYÊN NGHIỆP",
    condition: "Like New",
    conditionScore: "Như mới (Tình trạng 9.9/10)",
    rating: 5.0,
    reviews: 24,
    location: "Quận 1, TP.HCM",
    distance: "1.8 km",
    pickupArea: "Smart Locker #D02 - Thư Viện Trung Tâm",
    pricePerDay: 42,
    weeklyPrice: 250,
    securityDeposit: 160,
    insuredUpTo: 2800,
    status: "AVAILABLE",
    ownerId: ELENA.id,
    ownerName: ELENA.fullName,
    ownerEmail: ELENA.email,
    ownerAvatar: ELENA.avatar,
    ownerUniversity: ELENA.university,
    ownerRating: ELENA.rating,
    ownerReviews: ELENA.reviews,
    ownerResponseTime: ELENA.responseTime,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCKrdA8avKHz_tDXqLmxuV5afwOc2qlhskexYQ8BdwPuMmmNQes4hw-cl6hfDcZvdlKwH-hGz-Tear5KlcBVq7DhWe8BMctrxt3l2xPvED4I1nbFDuQ2Pui2uoZbFucgF7H-rMbY20wkSIN5verzTmQLQohLDiyO4Q3MOo26EPBktipyCVMP6lmQvOUFpS9uVfvbhFR0vTvf-foVqlZ0nuYEvOKRdctC3RbOX_jNzzOSSb-njMVSlHtbA",
    alt: "Ống kính tele khẩu độ lớn Sony FE 70-200mm f/2.8 GM OSS II.",
    gallery: [
      {
        src: "https://lh3.googleusercontent.com/aida-public/AB6AXuCKrdA8avKHz_tDXqLmxuV5afwOc2qlhskexYQ8BdwPuMmmNQes4hw-cl6hfDcZvdlKwH-hGz-Tear5KlcBVq7DhWe8BMctrxt3l2xPvED4I1nbFDuQ2Pui2uoZbFucgF7H-rMbY20wkSIN5verzTmQLQohLDiyO4Q3MOo26EPBktipyCVMP6lmQvOUFpS9uVfvbhFR0vTvf-foVqlZ0nuYEvOKRdctC3RbOX_jNzzOSSb-njMVSlHtbA",
        alt: "Ống kính tele Sony FE 70-200mm f/2.8 GM OSS II thế hệ thứ hai siêu nhẹ.",
      },
      {
        src: "https://lh3.googleusercontent.com/aida-public/AB6AXuBjYuj9A4ZTCS0PGqKKemj2bWfWk6JpRZt5FwtzFCD0vhvf1DddiIURusaDb2tM9nACJVNJ9j4pbWqKNjojIahvtFiY87jipSdTCrzleVqBI5WSJhIEa18s9GvhK7TcL1kz26Y9FLK2XbDwSaRZ_zGmrM1RginHHYTHkQi8L2s6J4ugHGczK-h1l_V_W_4MLqGk_r2L73-DN7_cKOdqq7MIiLNmjMCo_iBMBluEjRdLPIxaiwQQvCXFEw",
        alt: "Thấu kính phủ Nano AR Coating II kèm ngàm gắn chân máy xoay linh hoạt.",
      },
    ],
    summary:
      "Ống kính tele zoom G Master thế hệ thứ 2 nhẹ nhất thế giới (chỉ 1,045g), lấy nét siêu tốc với 4 motor XD Linear và độ nét tuyệt đối trên toàn dải tiêu cự. Lý tưởng để chụp ảnh kỷ yếu, thể thao sân vận động và sự kiện sân khấu.",
    includedInKit: [
      "Ống kính Sony FE 70-200mm f/2.8 GM OSS II",
      "Loa che nắng (Lens Hood) ALC-SH167 có cửa sổ chỉnh filter",
      "Đế gắn chân máy tháo rời (Tripod Collar)",
      "Kính lọc bảo vệ B+W Master UV MRC Nano 77mm",
      "Túi đựng chống sốc Sony chính hãng",
    ],
    specifications: [
      { label: "Tiêu cự & Khẩu độ", value: "70–200mm, khẩu độ f/2.8 toàn dải" },
      { label: "Động cơ lấy nét", value: "4× XD Linear Motors siêu êm" },
      { label: "Chống rung quang học", value: "Optical SteadyShot (3 chế độ Mode 1/2/3)" },
      { label: "Đường kính Filter", value: "77mm" },
      { label: "Khoảng cách lấy nét gần nhất", value: "0.4m (tại 70mm)" },
      { label: "Trọng lượng", value: "1,045g" },
    ],
    keywords: ["Lens", "Ống kính", "Sony 70-200", "Chụp kỷ yếu"],
  },
  {
    id: "ipad-pro-m4-13",
    dbId: 11,
    categoryId: 2,
    brand: "Apple",
    title: 'Bộ iPad Pro M4 13" OLED 512GB & Apple Pencil Pro',
    category: "Electronics",
    categoryLabel: "MÁY TÍNH BẢNG & THIẾT KẾ",
    condition: "Like New",
    conditionScore: "Như mới (Tình trạng 9.9/10)",
    rating: 5.0,
    reviews: 36,
    location: "Quận 7, TP.HCM",
    distance: "2.0 km",
    pickupArea: "Smart Locker #C08 - Khu Đô Thị Nam Sài Gòn",
    pricePerDay: 36,
    weeklyPrice: 215,
    securityDeposit: 140,
    insuredUpTo: 1900,
    status: "AVAILABLE",
    ownerId: MINH_ANH.id,
    ownerName: MINH_ANH.fullName,
    ownerEmail: MINH_ANH.email,
    ownerAvatar: MINH_ANH.avatar,
    ownerUniversity: MINH_ANH.university,
    ownerRating: MINH_ANH.rating,
    ownerReviews: MINH_ANH.reviews,
    ownerResponseTime: MINH_ANH.responseTime,
    image:
      "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=1200&q=85",
    alt: "Máy tính bảng iPad Pro M4 13 inch kèm bút cảm ứng Apple Pencil Pro và bàn phím Magic Keyboard.",
    gallery: [
      {
        src: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=1200&q=85",
        alt: "Máy tính bảng iPad Pro M4 13 inch OLED kèm bút cảm ứng Apple Pencil Pro.",
      },
      {
        src: "https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?auto=format&fit=crop&w=1200&q=85",
        alt: "Màn hình Ultra Retina XDR Tandem OLED 120Hz chuẩn màu cho thiết kế & minh họa.",
      },
    ],
    summary:
      "iPad Pro 13 inch trang bị màn hình Ultra Retina XDR Tandem OLED chuẩn màu tuyệt đối, chip Apple M4 siêu mỏng nhẹ, kèm bút Apple Pencil Pro (hỗ trợ cảm biến bóp & phản hồi xúc giác) và bàn phím Magic Keyboard nhôm.",
    includedInKit: [
      'Apple iPad Pro 13" M4 (512GB Wi-Fi, Space Black)',
      "Bút cảm ứng Apple Pencil Pro",
      "Bàn phím Apple Magic Keyboard vỏ nhôm",
      "Cài sẵn Procreate, Nomad Sculpt & GoodNotes 6",
      "Củ sạc nhanh 35W Dual USB-C & Cáp bọc dù",
      "Túi chống sốc da cao cấp",
    ],
    specifications: [
      { label: "Màn hình", value: '13" Ultra Retina XDR Tandem OLED 120Hz' },
      { label: "Vi xử lý", value: "Apple M4 (10-core CPU / 10-core GPU)" },
      { label: "Dung lượng", value: "512GB SSD / 8GB RAM" },
      { label: "Phụ kiện vẽ", value: "Apple Pencil Pro (Haptic & Barrel Roll)" },
      { label: "Độ mỏng thân máy", value: "5.1 mm" },
      { label: "Trọng lượng", value: "579g (chưa gồm bàn phím)" },
    ],
    keywords: ["iPad Pro M4", "Apple Pencil", "Vẽ kỹ thuật số", "Procreate"],
  },
  {
    id: "ecoflow-delta-2",
    dbId: 12,
    categoryId: 5,
    brand: "EcoFlow",
    title: "Trạm Điện Di Động EcoFlow DELTA 2 (1024Wh - Sạc Nhanh)",
    category: "Travel & Outdoor",
    categoryLabel: "DÃ NGOẠI & NĂNG LƯỢNG",
    condition: "Good",
    conditionScore: "Tốt (Tình trạng 9.5/10)",
    rating: 4.8,
    reviews: 22,
    location: "TP. Thủ Đức, TP.HCM",
    distance: "2.6 km",
    pickupArea: "Smart Locker #B14 - Nhà Văn Hóa Sinh Viên",
    pricePerDay: 29,
    weeklyPrice: 170,
    securityDeposit: 110,
    insuredUpTo: 1100,
    status: "AVAILABLE",
    ownerId: MINH_QUAN.id,
    ownerName: MINH_QUAN.fullName,
    ownerEmail: MINH_QUAN.email,
    ownerAvatar: MINH_QUAN.avatar,
    ownerUniversity: MINH_QUAN.university,
    ownerRating: MINH_QUAN.rating,
    ownerReviews: MINH_QUAN.reviews,
    ownerResponseTime: MINH_QUAN.responseTime,
    image:
      "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=1200&q=85",
    alt: "Trạm phát điện dự phòng di động EcoFlow DELTA 2 phục vụ cắm trại và quay phim ngoài trời.",
    gallery: [
      {
        src: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=1200&q=85",
        alt: "Trạm nguồn dự phòng di động dung lượng lớn hỗ trợ sạc nhanh PD 100W & AC 1800W.",
      },
      {
        src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDYtWyYPAOm9sAbfT4DIOcC5FgB3edzZTKlnvUvJg5xNbQTk2UMqZ1crN3GsnPy0uqMrhf3BKzz6wgr7WV98qK-KqruO1mcb-1-MKv5BaKIILBkVt2QttqzrQ1wZDafuBIKywItVOPY_MZ5fWzMxb18mo-UhibO24690oHTV58m7uzHsQo9-sRXZdGB2xr8EKUWll4RtfeDYizbqw_BWLaqjegRfIXVlv13nR9ujObTIo_ThBAE4AeRQw",
        alt: "Sử dụng thực tế trong chuyến dã ngoại và quay ngoại cảnh của sinh viên.",
      },
    ],
    summary:
      "Trạm điện di động pin LiFePO4 dung lượng 1,024Wh, công suất đầu ra AC 1,800W (X-Boost 2,400W). Cấp nguồn liên tục cho đèn quay phim studio ngoài trời, sạc laptop, flycam hoặc đi cắm trại dã ngoại cuối tuần.",
    includedInKit: [
      "Trạm điện EcoFlow DELTA 2 (1,024Wh LiFePO4)",
      "Dây sạc AC siêu nhanh X-Stream (Sạc 0-80% trong 50 phút)",
      "Cáp sạc tẩu ô tô 12V",
      "Ổ cắm nối dài đa năng chống quá tải 5m",
      "Túi bảo vệ chống mưa bụi EcoFlow",
    ],
    specifications: [
      { label: "Dung lượng lưu trữ", value: "1,024Wh (Pin LFP bền bỉ)" },
      { label: "Công suất AC đầu ra", value: "1,800W thuần sin (Đỉnh 2,700W)" },
      { label: "Cổng sạc nhanh USB", value: "2× USB-C 100W PD, 4× USB-A" },
      { label: "Thời gian sạc đầy", value: "50 phút (80%) / 80 phút (100%)" },
      { label: "Điều khiển thông minh", value: "Kết nối App qua Wi-Fi & Bluetooth" },
      { label: "Trọng lượng", value: "12 kg" },
    ],
    keywords: ["EcoFlow", "Trạm điện", "Cắm trại", "Dã ngoại", "Outdoor"],
  },
  {
    id: "breville-barista-express",
    dbId: 13,
    categoryId: 3,
    brand: "Breville",
    title: "Máy Pha Cà Phê Espresso Breville Barista Express 870XL",
    category: "Home Appliances",
    categoryLabel: "THIẾT BỊ PHA CHẾ & SỰ KIỆN",
    condition: "Like New",
    conditionScore: "Như mới (Tình trạng 9.6/10)",
    rating: 4.9,
    reviews: 18,
    location: "Quận 3, TP.HCM",
    distance: "1.7 km",
    pickupArea: "Smart Locker #A12 - Ga Metro Trung Tâm",
    pricePerDay: 26,
    weeklyPrice: 155,
    securityDeposit: 100,
    insuredUpTo: 950,
    status: "AVAILABLE",
    ownerId: LAN_ANH.id,
    ownerName: LAN_ANH.fullName,
    ownerEmail: LAN_ANH.email,
    ownerAvatar: LAN_ANH.avatar,
    ownerUniversity: LAN_ANH.university,
    ownerRating: LAN_ANH.rating,
    ownerReviews: LAN_ANH.reviews,
    ownerResponseTime: LAN_ANH.responseTime,
    image:
      "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=1200&q=85",
    alt: "Máy pha cà phê chuyên nghiệp vỏ thép không gỉ Breville Barista Express.",
    gallery: [
      {
        src: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=1200&q=85",
        alt: "Máy pha cà phê Espresso Breville Barista Express tích hợp cối xay hạt.",
      },
      {
        src: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=85",
        alt: "Pha chế Espresso và Latte Art chuyên nghiệp cho sự kiện & gian hàng CLB.",
      },
    ],
    summary:
      "Máy pha cà phê Espresso tích hợp cối xay hạt hình nón bằng thép không gỉ, kiểm soát nhiệt độ điện tử PID và vòi đánh sữa tạo bọt mịn chuẩn Latte Art. Rất được ưa chuộng cho gian hàng gây quỹ CLB, workshop và tiệc trà.",
    includedInKit: [
      "Máy pha cà phê Breville Barista Express BES870XL",
      "Tay pha Portafilter 54mm bằng thép không gỉ + 4 rổ lọc",
      "Ca đánh sữa inox 480ml có vạch chia nhiệt độ",
      "Tamper nén cà phê nam châm & Dao gạt Razor",
      "Hộp đập bã cà phê Knock Box Mini",
    ],
    specifications: [
      { label: "Áp suất bơm", value: "15 Bar (Bơm Ý + Pre-infusion áp suất thấp)" },
      { label: "Cối xay tích hợp", value: "18 mức độ mịn (Conical Burr Grinder)" },
      { label: "Kiểm soát nhiệt độ", value: "Mạch PID kỹ thuật số chính xác ±1°C" },
      { label: "Bình chứa nước", value: "2.0 Lít có lõi lọc than hoạt tính" },
      { label: "Chất liệu vỏ", value: "Thép không gỉ xước mờ (Brushed Stainless)" },
      { label: "Trọng lượng", value: "10.4 kg" },
    ],
    keywords: ["Máy pha cà phê", "Breville", "Espresso", "Gian hàng CLB"],
  },
  {
    id: "herman-miller-aeron",
    dbId: 14,
    categoryId: 7,
    brand: "Herman Miller",
    title: "Ghế Công Thái Học Herman Miller Aeron Remastered (Size B)",
    category: "Furniture",
    categoryLabel: "NỘI THẤT & GÓC HỌC TẬP",
    condition: "Like New",
    conditionScore: "Như mới (Tình trạng 9.7/10)",
    rating: 4.9,
    reviews: 21,
    location: "Quận 10, TP.HCM",
    distance: "2.2 km",
    pickupArea: "Điểm Giao Nhận Nội Thất - Khu KTX Khu A",
    pricePerDay: 18,
    weeklyPrice: 105,
    securityDeposit: 120,
    insuredUpTo: 1400,
    status: "AVAILABLE",
    ownerId: HOANG_NAM.id,
    ownerName: HOANG_NAM.fullName,
    ownerEmail: HOANG_NAM.email,
    ownerAvatar: HOANG_NAM.avatar,
    ownerUniversity: HOANG_NAM.university,
    ownerRating: HOANG_NAM.rating,
    ownerReviews: HOANG_NAM.reviews,
    ownerResponseTime: HOANG_NAM.responseTime,
    image:
      "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?auto=format&fit=crop&w=1200&q=85",
    alt: "Ghế công thái học lưới thoáng khí Herman Miller Aeron Remastered.",
    gallery: [
      {
        src: "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?auto=format&fit=crop&w=1200&q=85",
        alt: "Ghế công thái học Herman Miller Aeron Remastered Size B màu Graphite.",
      },
      {
        src: "https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&w=1200&q=85",
        alt: "Thiết kế lưới 8Z Pellicle thoáng khí và bộ đỡ lưng kép PostureFit SL.",
      },
    ],
    summary:
      "Biểu tượng ghế công thái học thế giới với lưới 8Z Pellicle phân bổ áp lực 8 vùng và bộ đỡ cột sống PostureFit SL kép. Giải pháp tuyệt vời để thuê theo tuần/tháng trong mùa chạy deadline khóa luận tốt nghiệp, ôn thi hoặc Hackathon.",
    includedInKit: [
      "Ghế Herman Miller Aeron Remastered (Size B - Graphite)",
      "Bộ đỡ thắt lưng kép PostureFit SL điều chỉnh độc lập",
      "Tựa đầu công thái học Atlas Headrest đồng màu",
      "Bánh xe bọc nhựa PU êm ái không gây xước sàn gỗ",
    ],
    specifications: [
      { label: "Kích cỡ khung", value: "Size B (Phù hợp 1m58 – 1m85)" },
      { label: "Chất liệu mặt lưới", value: "8Z Pellicle đàn hồi 8 vùng nhiệt" },
      { label: "Hỗ trợ cột sống", value: "PostureFit SL (Đỡ xương cùng & thắt lưng)" },
      { label: "Kê tay", value: "Bọc da mềm điều chỉnh 4 chiều (4D Arms)" },
      { label: "Cơ chế ngả lưng", value: "Harmonic 2 Tilt + Nghiêng về phía trước 5°" },
      { label: "Tải trọng tối đa", value: "159 kg" },
    ],
    keywords: ["Ghế công thái học", "Herman Miller", "Nội thất", "Furniture"],
  },
  {
    id: "garmin-fenix-7x-trek-kit",
    dbId: 15,
    categoryId: 6,
    brand: "Garmin & Trek",
    title: "Bộ Đồng Hồ GPS Garmin Fenix 7X Solar & Phụ Kiện Chạy Trail",
    category: "Sports & Fitness",
    categoryLabel: "THỂ THAO & CHẠY TRAIL",
    condition: "Like New",
    conditionScore: "Như mới (Tình trạng 9.8/10)",
    rating: 4.9,
    reviews: 26,
    location: "Quận 2, TP. Thủ Đức",
    distance: "2.3 km",
    pickupArea: "Smart Locker #E05 - Khu Thể Thao Đa Năng",
    pricePerDay: 19,
    weeklyPrice: 110,
    securityDeposit: 95,
    insuredUpTo: 1000,
    status: "AVAILABLE",
    ownerId: TUAN_KIET.id,
    ownerName: TUAN_KIET.fullName,
    ownerEmail: TUAN_KIET.email,
    ownerAvatar: TUAN_KIET.avatar,
    ownerUniversity: TUAN_KIET.university,
    ownerRating: TUAN_KIET.rating,
    ownerReviews: TUAN_KIET.reviews,
    ownerResponseTime: TUAN_KIET.responseTime,
    image:
      "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=1200&q=85",
    alt: "Đồng hồ thể thao đa môn GPS Garmin Fenix 7X Sapphire Solar.",
    gallery: [
      {
        src: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=1200&q=85",
        alt: "Đồng hồ thể thao GPS đa băng tần Garmin Fenix 7X Sapphire Solar viền Titanium.",
      },
      {
        src: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=1200&q=85",
        alt: "Mặt kính Power Sapphire chống trầy tích hợp sạc năng lượng mặt trời và bản đồ TopoActive.",
      },
    ],
    summary:
      "Đồng hồ thể thao GPS đa băng tần Garmin Fenix 7X Sapphire Solar tích hợp bản đồ địa hình TopoActive Việt Nam, đèn pin LED siêu sáng và thời lượng pin lên đến 28 ngày. Đi kèm vest nước chạy địa hình Salomon 5L và gậy leo núi Carbon.",
    includedInKit: [
      "Đồng hồ Garmin Fenix 7X Sapphire Solar (51mm Titanium)",
      "Dây đeo vải UltraFit Nylon thoáng khí + Dây Silicone dự phòng",
      "Vest chạy bộ địa hình Salomon Adv Skin 5L (Đã giặt hấp khử trùng)",
      "Cặp gậy leo núi / chạy Trail gấp gọn sợi Carbon",
      "Cáp sạc Garmin chính hãng",
    ],
    specifications: [
      { label: "Mặt kính & Viền", value: "Power Sapphire sạc năng lượng mặt trời + Titanium" },
      { label: "Định vị vệ tinh", value: "Multi-band GNSS (GPS, GLONASS, Galileo)" },
      { label: "Thời lượng pin", value: "28 ngày Smartwatch / 89 giờ GPS liên tục" },
      { label: "Bản đồ tích hợp", value: "Bản đồ địa hình TopoActive điều hướng từng ngã rẽ" },
      { label: "Chống nước", value: "10 ATM (100 mét)" },
      { label: "Trọng lượng đồng hồ", value: "89g" },
    ],
    keywords: ["Garmin", "Thể thao", "Chạy bộ", "Trail", "Trekking"],
  },
  {
    id: "wacom-one-13-touch",
    dbId: 16,
    categoryId: 8,
    brand: "Wacom",
    title: "Bảng Vẽ Màn Hình Wacom One 13 Touch & Bút Cảm Ứng 4K",
    category: "Other Items",
    categoryLabel: "VẬT PHẨM & PHỤ KIỆN KHÁC",
    condition: "Like New",
    conditionScore: "Như mới (Tình trạng 9.8/10)",
    rating: 4.9,
    reviews: 17,
    location: "Bình Thạnh, TP.HCM",
    distance: "1.6 km",
    pickupArea: "Smart Locker #C08 - Khu Đồ Họa ĐH Kiến Trúc",
    pricePerDay: 16,
    weeklyPrice: 95,
    securityDeposit: 80,
    insuredUpTo: 700,
    status: "AVAILABLE",
    ownerId: MINH_ANH.id,
    ownerName: MINH_ANH.fullName,
    ownerEmail: MINH_ANH.email,
    ownerAvatar: MINH_ANH.avatar,
    ownerUniversity: MINH_ANH.university,
    ownerRating: MINH_ANH.rating,
    ownerReviews: MINH_ANH.reviews,
    ownerResponseTime: MINH_ANH.responseTime,
    image:
      "https://images.unsplash.com/photo-1710855253027-8da61120b719?auto=format&fit=crop&w=1200&q=85",
    alt: "Bảng vẽ màn hình hiển thị trực tiếp Wacom One 13 inch kèm bút cảm ứng lực.",
    gallery: [
      {
        src: "https://images.unsplash.com/photo-1710855253027-8da61120b719?auto=format&fit=crop&w=1200&q=85",
        alt: "Bảng vẽ màn hình cảm ứng Wacom One 13 Touch kèm bút Wacom One Pen 4096 mức lực nhấn.",
      },
      {
        src: "https://images.unsplash.com/photo-1611241893603-3c359704e0ee?auto=format&fit=crop&w=1200&q=85",
        alt: "Màn hình chống chói 99% sRGB cho sinh viên thiết kế đồ họa và minh họa kỹ thuật số.",
      },
    ],
    summary:
      "Bảng vẽ màn hình cảm ứng 13.3 inch Full HD tương thích Windows, macOS và Android. Hỗ trợ 4,096 mức lực nhấn, cảm ứng nghiêng mượt mà. Tuyệt vời cho sinh viên đồ họa vẽ minh họa, storyboard, làm animation và ghi chú bài giảng chuyên sâu.",
    includedInKit: [
      "Bảng vẽ màn hình Wacom One 13 Touch",
      "Bút cảm ứng Wacom One Pen (Không cần sạc hay dùng pin)",
      "3× Ngòi bút thay thế & Dụng cụ tháo ngòi",
      "Cáp kết nối USB-C all-in-one & Củ sạc",
      "Chân đế gập công thái học",
      "Găng tay họa sĩ chuyên dụng chống chạm nhầm",
    ],
    specifications: [
      { label: "Kích thước màn hình", value: '13.3" IPS Full HD (1920 × 1080)' },
      { label: "Mức lực nhấn bút", value: "4,096 mức cảm ứng lực" },
      { label: "Không gian màu", value: "99% sRGB sống động" },
      { label: "Độ nghiêng nhận diện", value: "±60 độ" },
      { label: "Khả năng tương thích", value: "Windows, macOS, ChromeOS, Android" },
      { label: "Trọng lượng", value: "900g" },
    ],
    keywords: ["Wacom", "Bảng vẽ", "Vẽ kỹ thuật số", "Illustration", "Design", "Vật phẩm khác"],
  },
];

export type RelatedAccessoryItem = {
  id: string;
  badge: string;
  rating: number;
  reviews: number;
  title: string;
  location: string;
  pricePerDay: number;
  image: string;
  alt: string;
  linkedItemId: string;
};

export const FREQUENTLY_RENTED_TOGETHER: RelatedAccessoryItem[] = [
  {
    id: "dji-rs3-pro-gimbal",
    badge: "Gimbal",
    rating: 4.9,
    reviews: 31,
    title: "Gimbal Chống Rung DJI RS 3 Pro",
    location: "Khu ĐHQG • Cách 1.4 km",
    pricePerDay: 32,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCZLPeyA08PN8tRtBH98U03CxwUI5GNhxmgMSS4zE4JEo8fgCcYWAZaNAOzfRoseGZEBR5OY0mZADH_o_jwRS39Ydoija7eTMVf_izueR4FKmwJ10p-j9Lct_gKr11oApcaJQNx6lj1DYzVJllU8JPrBPLjfxEPtIhGXI3nqO3_4EGiwDbbtWIVqTCEqAGDD1-hvfM1RjAMd4wmN6g4EJQTrVgpG760f_rnzecLj0AZB2JNBxJ_nKpb1w",
    alt: "Tay cầm chống rung DJI RS 3 Pro sợi carbon.",
    linkedItemId: "dji-rs3-pro-gimbal",
  },
  {
    id: "sony-fe-70-200-gm-ii",
    badge: "Ống kính Tele",
    rating: 5.0,
    reviews: 24,
    title: "Ống Kính Sony FE 70-200mm GM II",
    location: "Quận 1 • Cách 1.8 km",
    pricePerDay: 42,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCKrdA8avKHz_tDXqLmxuV5afwOc2qlhskexYQ8BdwPuMmmNQes4hw-cl6hfDcZvdlKwH-hGz-Tear5KlcBVq7DhWe8BMctrxt3l2xPvED4I1nbFDuQ2Pui2uoZbFucgF7H-rMbY20wkSIN5verzTmQLQohLDiyO4Q3MOo26EPBktipyCVMP6lmQvOUFpS9uVfvbhFR0vTvf-foVqlZ0nuYEvOKRdctC3RbOX_jNzzOSSb-njMVSlHtbA",
    alt: "Ống kính tele Sony FE 70-200mm f/2.8 GM OSS II.",
    linkedItemId: "sony-fe-70-200-gm-ii",
  },
  {
    id: "sennheiser-wireless-mic",
    badge: "Âm thanh",
    rating: 5.0,
    reviews: 29,
    title: "Bộ Loa & Mic Không Dây Bose S1 Pro+",
    location: "Quận 5 • Cách 2.5 km",
    pricePerDay: 38,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDrcswAAUQMBjuNfwjhgWG8KxtzUCv2i5kLWA0-z57JkS2NZQZVJKwfCfQgfs20GXxugnWxvL4_OeygSNpx3-ZuoxTiXrxsItAAhYtS4AVmjGIxwu3lBDhtzpJ_nr1RLCIFBR4uR68SyNDJxgzxoskElSztaiH_XXxrkc4XTdljm35I9q_t-mybM_eeO97Sfdnhgg6W-dCaB-tH5SW-y3h9iy71pREYsEuatvHSPbxp4THgFLn9YyJSNg",
    alt: "Loa biểu diễn di động Bose S1 Pro+ kèm micro không dây.",
    linkedItemId: "bose-s1-pro-plus",
  },
  {
    id: "rimowa-protective-case",
    badge: "Hành lý",
    rating: 4.9,
    reviews: 44,
    title: "Vali Nhôm Bảo Vệ Rimowa Cabin",
    location: "Quận 3 • Cách 2.1 km",
    pricePerDay: 28,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDb-XhpbUQUnrJTrpTYxcUjACSvnf7bNOyJyFzOKrmKerDqFk387VLyNSLvlHgGqQSLTf1PJpvSTR9-PR8gyEWVazS9RdyMBtr91sJ_8jVvQiUFVBzISIu69hbcxF0fHF8hHwdWM2U_CrZkVdy0zclt_9HLgidLg7rpHAP6Xxnm6roU8S_tgLA87RgW7PuX0zdOR2XhBpzd2Rl-3S_Pg2OEFIlTFwxikqfrg0l1O5QVg4R_IEGZqpYJWw",
    alt: "Vali nhôm bảo vệ thiết bị Rimowa.",
    linkedItemId: "rimowa-original-cabin",
  },
];

const CUSTOM_LISTINGS_STORAGE_KEY = "unilend_custom_listings_v1";
const CUSTOM_LOANS_STORAGE_KEY = "unilend_custom_loan_requests_v1";

const CATEGORY_ID_TO_TAB: Record<number, Exclude<CategoryTab, "All Items">> = {
  1: "Electronics",
  2: "Electronics",
  3: "Home Appliances",
  4: "Tools & Equipment",
  5: "Travel & Outdoor",
  6: "Sports & Fitness",
  7: "Furniture",
  8: "Events & Party",
  9: "Other Items",
};

/**
 * Kiểm tra URL ảnh hợp lệ và không phải chuỗi giả lập lỗi trong bản seed cũ.
 */
export function isReliableImageUrl(url?: string | null): boolean {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  if (!trimmed) return false;
  // Loại bỏ các chuỗi fake sequential trong bản seed cũ
  const brokenPatterns = [
    "1x2y3z4w5v",
    "4P1mR8j_5yN0",
    "qA1zX4cV7bN0m",
    "1a2B3c4D5e6F7g",
    "9z8Y7x6W5v4U",
    "aB1cD2eF3gH4iJ",
    "pO9iU8yT7rE6wQ",
    "zX1cV2bN3mK4lJ",
    "mN1bV2cX3zL4kJ",
    "AB6AXuD_f893kL2",
    "AB6AXuC89kL4m1N",
    "AB6AXuB77xP9qW3",
  ];
  return !brokenPatterns.some((pat) => trimmed.includes(pat));
}

export function getCustomListings(): RentalListingItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CUSTOM_LISTINGS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item: RentalListingItem) => {
      const resolvedOwner = getSystemUser({
        id: item.ownerId,
        fullName: item.ownerName,
        email: item.ownerEmail,
      });
      return {
        ...item,
        ownerId: item.ownerId ?? resolvedOwner.id,
        ownerName: item.ownerName || resolvedOwner.fullName,
        ownerEmail: item.ownerEmail || resolvedOwner.email,
        ownerAvatar: isReliableImageUrl(item.ownerAvatar)
          ? item.ownerAvatar
          : resolvedOwner.avatar,
        ownerUniversity: item.ownerUniversity || resolvedOwner.university,
      };
    });
  } catch {
    return [];
  }
}

export const DELETED_LISTINGS_STORAGE_KEY = "unilend_deleted_listing_ids_v1";

export function getDeletedListingIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(DELETED_LISTINGS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCustomListing(item: RentalListingItem): void {
  if (typeof window === "undefined") return;
  try {
    const deleted = getDeletedListingIds().filter(
      (d) => d !== item.id && (item.dbId === undefined || d !== String(item.dbId))
    );
    window.localStorage.setItem(
      DELETED_LISTINGS_STORAGE_KEY,
      JSON.stringify(deleted)
    );

    const existing = getCustomListings().filter(
      (i) => i.id !== item.id && (item.dbId === undefined || i.dbId !== item.dbId)
    );
    window.localStorage.setItem(
      CUSTOM_LISTINGS_STORAGE_KEY,
      JSON.stringify([item, ...existing])
    );
  } catch {
    // ignore storage errors
  }
}

export function deleteCustomListing(id: string, dbId?: number): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getCustomListings().filter(
      (i) =>
        i.id !== id &&
        (dbId === undefined || i.dbId !== dbId) &&
        String(i.dbId) !== id
    );
    window.localStorage.setItem(
      CUSTOM_LISTINGS_STORAGE_KEY,
      JSON.stringify(existing)
    );

    const deleted = new Set(getDeletedListingIds());
    deleted.add(id);
    if (dbId !== undefined) {
      deleted.add(String(dbId));
    }
    const numId = Number(id);
    if (!Number.isNaN(numId) && numId > 0) {
      deleted.add(String(numId));
    }
    window.localStorage.setItem(
      DELETED_LISTINGS_STORAGE_KEY,
      JSON.stringify(Array.from(deleted))
    );
  } catch {
    // ignore storage errors
  }
}

export type CustomLoanRecord = {
  id: string;
  itemId: string;
  dbItemId?: number;
  itemTitle: string;
  category: string;
  itemImage: string;
  ownerId: number;
  ownerName: string;
  ownerEmail: string;
  ownerAvatar: string;
  ownerUniversity: string;
  ownerRating: number;
  borrowerId: number;
  borrowerName: string;
  borrowerEmail: string;
  borrowerAvatar: string;
  borrowerUniversity: string;
  borrowerRating: number;
  status: "Pending" | "Confirmed" | "Active" | "Return Pending" | "Completed" | "Cancelled";
  borrowFrom: string;
  dueDate: string;
  datesLabel: string;
  rentalDays: number;
  totalCost: number;
  depositAmount: number;
  pickupLocation: string;
  note?: string;
  createdAt: string;
};

export function getCustomLoanRecords(): CustomLoanRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CUSTOM_LOANS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCustomLoanRecord(record: CustomLoanRecord): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getCustomLoanRecords().filter((r) => r.id !== record.id);
    window.localStorage.setItem(
      CUSTOM_LOANS_STORAGE_KEY,
      JSON.stringify([record, ...existing])
    );
  } catch {
    // ignore storage errors
  }
}

export function updateCustomLoanStatus(
  id: string,
  status: CustomLoanRecord["status"]
): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getCustomLoanRecords();
    const updated = existing.map((r) => (r.id === id ? { ...r, status } : r));
    window.localStorage.setItem(CUSTOM_LOANS_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore storage errors
  }
}

/**
 * Hợp nhất dữ liệu thiết bị trả về từ Backend MySQL (`GET /api/items`)
 * với thông tin chi tiết trên Frontend để mọi tài khoản chủ đồ và hình ảnh luôn chính chủ, đồng nhất.
 */
export function mergeBackendItemsWithCatalog(backendItems?: Item[] | null): RentalListingItem[] {
  const deletedIds = new Set(getDeletedListingIds());
  const isDeleted = (item: { id: string; dbId?: number }) => {
    return (
      deletedIds.has(item.id) ||
      (item.dbId !== undefined && deletedIds.has(String(item.dbId)))
    );
  };

  const customListings = getCustomListings().filter((i) => !isDeleted(i));
  const baseCatalog = [
    ...customListings,
    ...RENTAL_ITEMS.filter((i) => !isDeleted(i)),
  ];

  if (!backendItems || backendItems.length === 0) {
    return baseCatalog;
  }

  const activeBackendItems = backendItems.filter(
    (dbItem) => !deletedIds.has(String(dbItem.id))
  );

  const matchedCatalogIds = new Set<string>();
  const syncedFromDb: RentalListingItem[] = activeBackendItems.map((dbItem) => {
    const existingMatch = baseCatalog.find(
      (catItem) =>
        catItem.dbId === dbItem.id ||
        catItem.id === String(dbItem.id) ||
        catItem.title.toLowerCase() === dbItem.title.toLowerCase()
    );

    const resolvedOwner = getSystemUser({
      id: dbItem.owner?.id ?? existingMatch?.ownerId,
      fullName: dbItem.owner?.fullName ?? existingMatch?.ownerName,
      email: dbItem.owner?.email ?? existingMatch?.ownerEmail,
    });

    const dbImageCandidate = dbItem.images?.[0]?.imageUrl ?? dbItem.imageUrls?.[0];
    const validDbImage = isReliableImageUrl(dbImageCandidate) ? dbImageCandidate : undefined;

    if (existingMatch) {
      matchedCatalogIds.add(existingMatch.id);
      return {
        ...existingMatch,
        dbId: dbItem.id,
        title: dbItem.title || existingMatch.title,
        summary: dbItem.description || existingMatch.summary,
        status: dbItem.status,
        ownerId: dbItem.owner?.id ?? existingMatch.ownerId ?? resolvedOwner.id,
        ownerName: dbItem.owner?.fullName || existingMatch.ownerName || resolvedOwner.fullName,
        ownerEmail: dbItem.owner?.email || existingMatch.ownerEmail || resolvedOwner.email,
        ownerAvatar:
          (isReliableImageUrl(dbItem.owner?.avatarUrl) ? dbItem.owner?.avatarUrl : null) ||
          existingMatch.ownerAvatar ||
          resolvedOwner.avatar,
        ownerUniversity:
          dbItem.owner?.university || existingMatch.ownerUniversity || resolvedOwner.university,
        image: existingMatch.image || validDbImage || RENTAL_ITEMS[0].image,
      };
    }

    const mappedCategory =
      (dbItem.category?.id ? CATEGORY_ID_TO_TAB[dbItem.category.id] : undefined) ??
      "Electronics";

    const primaryImg =
      validDbImage ||
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBWffoVML51oMjL45kqmOohGZMZtoCInlOxgIVhi9OuRTxSxf-uRQJ3PB2FHG_G_qMjh8JROfD50OmtTG0vWfjWj9U5niYu5IFaQn_W-tsquX6IC3coC3B1oz--sBIa374Am4ScZIo0vpMwpxU2NCsIcdmE6eMqKwKdAiXRNdBDgZR9zGtisQPNZ1WR7gld4mL-6V-nrLAiNyZ1AFO7n7Ug8ong7xaxJ08worsG6lif";

    return {
      id: String(dbItem.id),
      dbId: dbItem.id,
      categoryId: dbItem.category?.id ?? 1,
      brand: "UniLend Verified",
      title: dbItem.title,
      category: mappedCategory,
      categoryLabel: dbItem.category?.name?.toUpperCase() || "THIẾT BỊ XÁC THỰC",
      condition: "Like New",
      conditionScore: "Như mới (Đã kiểm định)",
      rating: resolvedOwner.rating,
      reviews: 12,
      location: "Khu ĐHQG, TP. Thủ Đức",
      distance: "1.5 km",
      pickupArea: "Smart Locker #B14 - Campus Hub",
      pricePerDay: 35,
      weeklyPrice: 210,
      securityDeposit: 120,
      insuredUpTo: 2500,
      status: dbItem.status,
      ownerId: dbItem.owner?.id ?? resolvedOwner.id,
      ownerName: dbItem.owner?.fullName || resolvedOwner.fullName,
      ownerEmail: dbItem.owner?.email || resolvedOwner.email,
      ownerAvatar:
        (isReliableImageUrl(dbItem.owner?.avatarUrl) ? dbItem.owner?.avatarUrl : null) ||
        resolvedOwner.avatar,
      ownerUniversity: dbItem.owner?.university || resolvedOwner.university,
      ownerRating: resolvedOwner.rating,
      ownerReviews: resolvedOwner.reviews,
      ownerResponseTime: resolvedOwner.responseTime,
      image: primaryImg,
      alt: dbItem.title,
      gallery: [{ src: primaryImg, alt: dbItem.title }],
      summary:
        dbItem.description ||
        "Thiết bị chính hãng đã qua kiểm định chất lượng tại trạm UniLend Campus Hub.",
      includedInKit: [
        dbItem.title,
        "Bộ phụ kiện & cáp sạc tiêu chuẩn đi kèm",
        "Túi/hộp bảo vệ chống sốc chuyên dụng",
      ],
      specifications: [
        { label: "Mã thiết bị DB", value: `#UL-ITEM-${dbItem.id}` },
        { label: "Danh mục", value: dbItem.category?.name || "Thiết bị công nghệ" },
        {
          label: "Trạng thái kho",
          value: dbItem.status === "AVAILABLE" ? "Sẵn sàng cho thuê" : "Đang cho mượn",
        },
        { label: "Chủ sở hữu", value: dbItem.owner?.fullName || resolvedOwner.fullName },
      ],
      keywords: [dbItem.title, dbItem.category?.name || "UniLend"],
    };
  });

  const remainingCatalog = baseCatalog.filter(
    (item) => !matchedCatalogIds.has(item.id) && !isDeleted(item)
  );
  return [...syncedFromDb, ...remainingCatalog].filter((item) => !isDeleted(item));
}

export function getRentalItemById(id?: string | null): RentalListingItem {
  const deletedIds = new Set(getDeletedListingIds());
  const isDeleted = (item: { id: string; dbId?: number }) => {
    return (
      deletedIds.has(item.id) ||
      (item.dbId !== undefined && deletedIds.has(String(item.dbId)))
    );
  };

  const allItems = [
    ...getCustomListings().filter((i) => !isDeleted(i)),
    ...RENTAL_ITEMS.filter((i) => !isDeleted(i)),
  ];
  if (!id) return allItems[0] || RENTAL_ITEMS[0];

  const cleanId = decodeURIComponent(id).trim();
  const numId = Number(cleanId);

  const found = allItems.find(
    (item) =>
      item.id === cleanId ||
      (!Number.isNaN(numId) && numId > 0 && item.dbId === numId)
  );

  return found ?? allItems[0];
}
