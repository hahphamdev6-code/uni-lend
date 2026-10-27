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

export type ItemCondition = "Like New" | "Good" | "Fair";

export type SortOption =
  | "Recommended"
  | "Recently Added"
  | "Price: Low to High"
  | "Price: High to Low"
  | "Highest Rated";

export type ProductSpecification = {
  label: string;
  value: string;
};

export type RentalListingItem = {
  id: string;
  brand: string;
  title: string;
  category: Exclude<CategoryTab, "All Items">;
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
  image: string;
  alt: string;
  gallery?: { src: string; alt: string }[];
  summary?: string;
  includedInKit?: string[];
  specifications?: ProductSpecification[];
  keywords?: string[];
};

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

export const POPULAR_TAGS = ["Sony FX3", "MacBook Pro M3", "DJI Mini 4 Pro", "Dyson V15"];

export const SONY_A7_IV_GALLERY = [
  {
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuAI4VIukCfCxINDFprJs9KDEZTeJ09Gtg6n1UjotZlqyrFm2n2eiUH92gzpzIsJm-JSYEKlx7X03PW4rbVR-p1esESMMOXeUNBL2byuS71VsIfcAytadbvs4J8t4bnipIewPYlz5UC_uP3DbNH4Fh8AvV3WcAC6LrSGLW1w_dM5YoywbH2TyCqVbciO8DK3fPu0hZL4HO8RMEv0L_zF6w6ca2CfL7Xsw3pqLdSMoZYFA9CPuUGQi0KykQ",
    alt: "A pristine Sony Alpha A7 IV mirrorless digital camera mounted with a premium 24-70mm G Master lens resting cleanly on a minimalist brushed aluminum display surface.",
  },
  {
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuCwH7zYBmf-zBNeIYwgzKZG2q0mnR-ZRQ8eNULKLGNaedMPVROs4ALeU7_Tb_o_5YjmkdtmjpOl0Vb0AnW2zsHtEH9GmJU9t1qBiUCJEYJU0WU9ba_guV4i1--lFeyxWGvtBeNaFjXD_mH3uShJ6Wp8Fnl615mXAdy_qUykHRm4fH6bj5AEqJyNqsjVL_tDpFOd3kyhBTHyVtNb9CjzJL56gBVcXGruVAkMzKyr1vnOo2XlbpnFpZ7kTQ",
    alt: "Front view photograph of the Sony Alpha A7 IV camera body with lens cap off exposing clean glass optics, set against a soft gallery white background.",
  },
  {
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDYIXfi4MVM2EN1Cv_NSDEpkfHJMvs-MQNrSOXBJn2i038hpdvsn9KuJ0qH-Eg0IJ7ZFzwqRAVqoHQEqVsFunpJJGsnIxoC_bbuFBtQwfSiKmxkzHe-6M02eM9qDmpl4a8nknGmnRRy0ui6zzucfPR_FfiomiLdChWO1d05zj1X_Mqqryy-uua4UX_nYJpuVsxWzWVnNWJ78JAQ0F__5waE1hyOPrCGOcYTvqwhpcCwoCdyrDlYn4Rcdw",
    alt: "Close-up macro detail of the 33-megapixel full-frame Exmor R CMOS camera sensor and precision gold lens mount pins inside an open camera chassis.",
  },
  {
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuAo_Hums8iPEhu3Jlc_rR6Wj92Mq9mHRdwUMEjWEo6dPFora1lmQR-Wxr-sFtSpSPTEqiQRjSkte_P-DSYkFIDRkXfkU2NXY7hSex3nDZlHh_ozvPukTctLGXzladCpTEyy9WC9mwaPEIPOlJbezb5TXPfPnHcsOJ88NgPDSj5_QW_0hauyIMBicVrRPXy2sD3bdwONcsV1Qtw_B4IIpzQ-hFRMjArjIu46Gy8nbAH172IEbvO9NCwYQA",
    alt: "Crisp rear view of the Sony A7 IV camera showing the articulate 3.0-inch LCD touchscreen with active menu display and tactile control dials.",
  },
  {
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuBWxeFDoVRlJ__8Pk67TcXJpqgpxKZa7nJl9RojmKORP1_taaNXL1SgAQAIh1vl5pAEaeLxg3pXdMwtLzH76Jnrz8iTssii8hM9YQUodcwehE06H0ISYxWn7n92CnzbMGMXgdkeB0D190AVzoDq1Ma1rIMF5rAr_nfLbqwhc2j-EdiLy6c2ht3Q9GIh-e00ANC5iPN-aQ_jfjeJc6ZjMAjWs54pdLStVEv4Eobm3U1XH1jZMz8llI1NDg",
    alt: "Flat lay arrangement of the complete camera kit including two rechargeable Sony batteries, dual USB-C battery charging dock, fast SD memory card, and protective pouch.",
  },
];

export const RENTAL_ITEMS: RentalListingItem[] = [
  {
    id: "sony-a7-iv",
    brand: "Sony",
    title: "Sony Alpha A7 IV Mirrorless Camera Kit",
    category: "Electronics",
    categoryLabel: "ELECTRONICS & CAMERAS",
    condition: "Like New",
    conditionScore: "Like New (Condition 9.8/10)",
    rating: 4.9,
    reviews: 38,
    location: "San Francisco, CA",
    distance: "2.4 mi",
    pickupArea: "Mission District, SF",
    pricePerDay: 45,
    weeklyPrice: 270,
    securityDeposit: 150,
    insuredUpTo: 3000,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD7q3WyHGwQczGxonMteIjyfBaTvXGwDJ_ur1L9QlcuVqfQMusOSmMoMh6XCFl-eIktAvTmqL1dyo8poZ5-A7l0Lk3JPQDWtYtHEfEYPBMLYEn6oClvM8jXwWDzlwxm3ia91lkfK1Khvslbs26LNUy6x9ZNLoI9QiKpX_Zrs-IiprBPs9fCC7PBsZ7UgSIAM9DfzayhJMV3gDlKZ33XixI_cDXpPSYJu7PCqMAW3i_yNiiPOv4IqNbx1A",
    alt: "A professional Sony Alpha A7 IV mirrorless digital camera with a 24-70mm GM lens, set atop a clean brushed-aluminum desk inside an architectural high-key studio with soft morning ambient light.",
    gallery: SONY_A7_IV_GALLERY,
    summary:
      "Full-frame 33MP hybrid camera ideal for high-end photography and 4K 60p cinematic video. Comes in a protective Pelican case with 2x Sony NP-FZ100 batteries, dual charger, and 128GB high-speed SD card.",
    includedInKit: [
      "Sony Alpha A7 IV Body (Firmware v3.01)",
      "Sony FE 24-70mm f/2.8 GM Lens",
      "2× Sony NP-FZ100 Rechargeable Batteries",
      "SanDisk Extreme Pro 128GB v90 SD Card",
      "Dual-slot USB-C Rapid Charger",
      "Peak Design Slide Camera Strap",
      "Pelican 1450 Waterproof Hard Case",
    ],
    specifications: [
      { label: "Sensor", value: "33MP Full-Frame Exmor R" },
      { label: "Video Capture", value: "4K 60p 10-bit 4:2:2" },
      { label: "ISO Sensitivity", value: "100 – 51,200 (Exp. 204,800)" },
      { label: "Lens Mount", value: "Sony E-Mount" },
      { label: "Stabilization", value: "5-Axis SteadyShot In-Body" },
      { label: "Weight (Body only)", value: "658g (with battery & card)" },
    ],
    keywords: ["Sony FX3", "Sony A7IV", "Camera"],
  },
  {
    id: "macbook-pro-16-m3-max",
    brand: "Apple",
    title: 'Apple MacBook Pro 16" M3 Max',
    category: "Electronics",
    categoryLabel: "COMPUTERS & WORKSTATIONS",
    condition: "Like New",
    conditionScore: "Like New (Condition 9.9/10)",
    rating: 5.0,
    reviews: 42,
    location: "San Jose, CA",
    distance: "3.1 mi",
    pickupArea: "Downtown San Jose, CA",
    pricePerDay: 68,
    weeklyPrice: 405,
    securityDeposit: 250,
    insuredUpTo: 4000,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDShP6KcUfhQWJUdWdmdlXxbL_s3QfPJI8zDmDMbNum0sJzIWTa4IiKpKSga1Gex9DTPa4Pudj7ENU9jy5M2HsQTrt04z0IexJGx-2TELX0r3hVfYUXyeHdGg2D6B9es_1hZlgR2nEka0nSBrRBLBnCgmeoSMCIrNPmFSkmW1m3pTqU7t_hjgFprO730ZGsEIrSFDiKJYLkmDBhpzMzMXd3jOeUWaOGwZnSOEm9hQGpF27V2VeQ4ou5zw",
    alt: "An Apple Space Black MacBook Pro 16 inch open display displaying subtle analytical charts on a minimal white marble counter with soft morning daylight.",
    summary:
      " flagship 16-inch MacBook Pro with M3 Max chip (16-core CPU, 40-core GPU, 64GB Unified Memory). Built for 8K ProRes editing, 3D rendering, and ML workloads on the go.",
    includedInKit: [
      'Apple MacBook Pro 16" M3 Max (Space Black)',
      "140W USB-C GaN Power Adapter",
      "USB-C to MagSafe 3 Braided Cable (2m)",
      "Thunderbolt 4 Pro Cable (1.8m)",
      "Tomtoc 360° Protective Laptop Sleeve",
      "CalDigit SD 4.0 UHS-II Card Reader",
    ],
    specifications: [
      { label: "Processor", value: "Apple M3 Max (16-core CPU)" },
      { label: "Graphics", value: "40-core GPU with Ray Tracing" },
      { label: "Memory", value: "64GB Unified RAM" },
      { label: "Storage", value: "2TB NVMe SSD" },
      { label: "Display", value: '16.2" Liquid Retina XDR (120Hz)' },
      { label: "Weight", value: "2.16 kg (4.7 lbs)" },
    ],
    keywords: ["MacBook Pro M3", "Laptop", "Apple"],
  },
  {
    id: "dewalt-20v-max",
    brand: "DeWalt",
    title: "DeWalt 20V MAX Cordless Power Tool Combo Kit",
    category: "Tools & Equipment",
    categoryLabel: "TOOLS & EQUIPMENT",
    condition: "Good",
    conditionScore: "Good (Condition 9.2/10)",
    rating: 4.8,
    reviews: 27,
    location: "Oakland, CA",
    distance: "4.0 mi",
    pickupArea: "Rockridge, Oakland",
    pricePerDay: 24,
    weeklyPrice: 140,
    securityDeposit: 80,
    insuredUpTo: 800,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA9DST6SHxcr9eaIO5QBzV0alHUWe0JyVRV3Fqz5nE4K_9qvi61dBXMV8xM8UKRjK63qnTr3EZAz3MZqGUlkc14hF1NLe2CCMui8V3vmZb0zInQULOYIWWKeJbHN-BAr2EPxSTFpYVxbMfCT7d8kV75pPWNe4d0Ftecfagzvz9gayn00Rsl4e_5hbLe39ESd_VciHUB-Q_MVO8AAf7NTcnBNzMcK9pcKDKailJpZSHPTQni38A02QA0NA",
    alt: "A clean industrial DeWalt yellow and black cordless drill and impact driver combo set neatly placed inside a heavy duty black molded case.",
    summary:
      "Complete brushless 20V MAX XR cordless drill/driver and impact driver kit with two 5.0Ah batteries and a 45-piece titanium drill & driver bit set in a rugged ToughSystem case.",
    includedInKit: [
      "DeWalt DCD791 20V MAX XR 1/2-in Brushless Drill",
      "DeWalt DCF887 20V MAX XR 1/4-in Impact Driver",
      "2× DeWalt 20V MAX 5.0Ah Lithium-Ion Batteries",
      "DCB115 Rapid Battery Charger",
      "45-Piece Titanium Drill & Screw Bit Set",
      "DeWalt Molded Heavy-Duty Contractor Case",
    ],
    specifications: [
      { label: "Voltage", value: "20V MAX XR Brushless" },
      { label: "Max Torque", value: "1,825 in-lbs (Impact)" },
      { label: "Chuck Size", value: "1/2-inch Ratcheting Nitro-Carbide" },
      { label: "Speed Settings", value: "2-Speed (0-550 / 0-2,000 RPM)" },
      { label: "Battery Capacity", value: "2× 5.0Ah Lithium-Ion" },
      { label: "Total Kit Weight", value: "4.8 kg (with hard case)" },
    ],
    keywords: ["DeWalt", "Drill", "Tools"],
  },
  {
    id: "dji-air-3",
    brand: "DJI",
    title: "DJI Air 3 Fly More Combo Drone",
    category: "Electronics",
    categoryLabel: "DRONES & AERIAL CINEMA",
    condition: "Like New",
    conditionScore: "Like New (Condition 9.8/10)",
    rating: 4.9,
    reviews: 51,
    location: "Berkeley, CA",
    distance: "1.9 mi",
    pickupArea: "North Berkeley, CA",
    pricePerDay: 52,
    weeklyPrice: 310,
    securityDeposit: 180,
    insuredUpTo: 2200,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBd5zfYSglIP26Ei380I-MRYnkB99ZXk0cCTrTMUF6GL1grkvJCSCB7BmkE3fdDe_6bLVPKogRlSyYIvcL7CefnMQVb-eKaYEfX4rumQDIg1oRlnJaRuSRCJ1z6OnE1XLl5dJmvHpTiix9w4P0qennAKQa1do9SEm3YAbimHoKMkM2PI49fe1zCWciKLjIETSfSBsVpcjoKq-ig3HiYVslIBwAQq_hoCCGNtW1pC5nXIjIIlRCk_fxlcA",
    alt: "A sleek DJI Air 3 quadcopter drone with dual camera lenses positioned beside its RC 2 controller with bright screen on a white frosted glass surface.",
    summary:
      "Dual-primary camera drone featuring both a 24mm wide-angle and 70mm 3x medium telephoto lens capable of 4K/60fps HDR video and up to 46 minutes of flight time per battery.",
    includedInKit: [
      "DJI Air 3 Dual-Camera Aircraft",
      "DJI RC 2 Smart Controller (Built-in FHD Screen)",
      "3× Intelligent Flight Batteries (46-min each)",
      "3-Battery Sequential Charging Hub",
      "Freewell ND8/16/32/64 Cinema Filter Set",
      "SanDisk Extreme 256GB microSDXC Card",
      "DJI Padded Shoulder Bag & Spare Propellers",
    ],
    specifications: [
      { label: "Camera System", value: "Dual 48MP (24mm Wide + 70mm 3x Tele)" },
      { label: "Max Flight Time", value: "46 Minutes per Battery" },
      { label: "Video Resolution", value: "4K 100fps / 4K 60fps HDR" },
      { label: "Obstacle Sensing", value: "Omnidirectional Binocular Vision" },
      { label: "Transmission", value: "O4 20km 1080p/60fps Live Feed" },
      { label: "Takeoff Weight", value: "720g" },
    ],
    keywords: ["DJI Mini 4 Pro", "Drone", "DJI"],
  },
  {
    id: "xgimi-horizon-pro-4k",
    brand: "XGIMI",
    title: "XGIMI Horizon Pro 4K Smart Projector",
    category: "Electronics",
    categoryLabel: "HOME CINEMA & PROJECTION",
    condition: "Like New",
    conditionScore: "Like New (Condition 9.7/10)",
    rating: 4.9,
    reviews: 19,
    location: "San Francisco, CA",
    distance: "1.5 mi",
    pickupArea: "Hayes Valley, SF",
    pricePerDay: 35,
    weeklyPrice: 210,
    securityDeposit: 120,
    insuredUpTo: 1800,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAk3YxyUveFWRcLmW_xYQF0Pu3FfaSo9OzB6H09iK5D-xtasfNeuqE8MhUft8668gBTQ42J09oHNd__Ptoa9sN4ieUQd1kchsvG_T4WkZBmKQ_LViN5TnwFalZm0rjwnxBy50pw0akH1bqxO8NXApSkjoW9U7OuJ2RksiPGbcQBPbus8VuIdfUqQAwfm72rI3EotUG6I2xraMyeZjF3LsshzITLjycG93qsbuuE5XcQQOYzjRhvYK6cUw",
    alt: "An XGIMI Horizon Pro 4K smart cinema projector with metallic mesh casing on a low minimalist oak plinth in a contemporary loft.",
    summary:
      "True 4K UHD smart projector with 1500 ISO Lumens, built-in Harman Kardon dual 8W speakers, and automatic keystone correction. Ideal for backyard movie nights, presentations, and art installations.",
    includedInKit: [
      "XGIMI Horizon Pro 4K Projector",
      "Bluetooth Aluminum Voice Remote",
      "XGIMI Desktop Gimbal Stand",
      "High-Speed HDMI 2.1 Braided Cable (3m)",
      "Power Brick & AC Extension Cord",
      "Hardshell EVA Travel Case",
    ],
    specifications: [
      { label: "Native Resolution", value: "3840 × 2160 (4K UHD)" },
      { label: "Brightness", value: "1500 ISO Lumens" },
      { label: "Audio", value: "Dual 8W Harman Kardon + DTS-HD" },
      { label: "Image Size", value: '40" – 200" Auto-Keystone' },
      { label: "Connectivity", value: "HDMI 2.0, USB, Wi-Fi, Chromecast" },
      { label: "Weight", value: "2.9 kg (6.39 lbs)" },
    ],
    keywords: ["Projector", "XGIMI", "4K"],
  },
  {
    id: "dyson-v15-detect",
    brand: "Dyson",
    title: "Dyson V15 Detect Cordless Vacuum",
    category: "Home Appliances",
    categoryLabel: "HOME APPLIANCES",
    condition: "Like New",
    conditionScore: "Like New (Condition 9.6/10)",
    rating: 4.7,
    reviews: 33,
    location: "Palo Alto, CA",
    distance: "2.8 mi",
    pickupArea: "University Ave, Palo Alto",
    pricePerDay: 22,
    weeklyPrice: 132,
    securityDeposit: 90,
    insuredUpTo: 900,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD2RyYwpimYSjHZDyDEHNTWUA7E2KQJTHFzpCQPkDglyl2pQU5jIj5ItkuZxiLJVFi9Dq2QEQKO3NP6O9I2DqBf_yQuRMkHlOpM0THX5CqPkemkBWhsIX3J0dr6FAhl1P6K9VOQo3PZfY0K1traSNMDnFUiKFIXOk-qTRSJp8J3oC9uQfOAu3drbhkoHdepgucVXlksnwCjUvpIFXQ27A3PIcIzrP6X0VoaTteCAVgfbGNswPG0BD3yOw",
    alt: "A modern Dyson V15 Detect cordless vacuum cleaner with laser illuminated fluffy head resting gracefully on an architectural stand against a clean off-white gallery wall.",
    summary:
      "High-suction cordless vacuum with Fluffy Optic illumination head and piezo sensor that automatically adapts power to floor type. Deeply sanitized with a fresh HEPA filter before every rental.",
    includedInKit: [
      "Dyson V15 Detect Main Body + Fresh HEPA Filter",
      "Fluffy Optic Cleaner Head (Hard Floors)",
      "Digital Motorbar Anti-Tangle Head (Carpets)",
      "Hair Screw Motorized Detail Tool",
      "Combination & Crevice Precision Attachments",
      "Click-in High-Capacity Battery & Charger",
    ],
    specifications: [
      { label: "Suction Power", value: "240 AW (Hyperdymium Motor)" },
      { label: "Run Time", value: "Up to 60 Minutes (Eco Mode)" },
      { label: "Filtration", value: "Whole-Machine HEPA (99.99% at 0.1µm)" },
      { label: "Bin Volume", value: "0.77 Liters" },
      { label: "Display", value: "Real-Time LCD Particle Readout" },
      { label: "Weight", value: "3.08 kg (6.8 lbs)" },
    ],
    keywords: ["Dyson V15", "Vacuum", "Dyson"],
  },
  {
    id: "rimowa-original-cabin",
    brand: "Rimowa",
    title: "Rimowa Original Cabin Luggage Silver",
    category: "Travel & Outdoor",
    categoryLabel: "TRAVEL & LUGGAGE",
    condition: "Good",
    conditionScore: "Good (Condition 9.4/10)",
    rating: 4.9,
    reviews: 44,
    location: "San Francisco, CA",
    distance: "2.1 mi",
    pickupArea: "Pacific Heights, SF",
    pricePerDay: 28,
    weeklyPrice: 165,
    securityDeposit: 150,
    insuredUpTo: 1600,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDb-XhpbUQUnrJTrpTYxcUjACSvnf7bNOyJyFzOKrmKerDqFk387VLyNSLvlHgGqQSLTf1PJpvSTR9-PR8gyEWVazS9RdyMBtr91sJ_8jVvQiUFVBzISIu69hbcxF0fHF8hHwdWM2U_CrZkVdy0zclt_9HLgidLg7rpHAP6Xxnm6roU8S_tgLA87RgW7PuX0zdOR2XhBpzd2Rl-3S_Pg2OEFIlTFwxikqfrg0l1O5QVg4R_IEGZqpYJWw",
    alt: "A Rimowa Original Cabin Silver aluminum grooved suitcase standing upright on polished light terrazzo floor in an airport lounge setting.",
    summary:
      "Iconic anodized aluminum carry-on suitcase engineered in Germany. Features Rimowa Multiwheel® system, dual TSA-approved locks, and height-adjustable Flex Dividers for effortless business or weekend travel.",
    includedInKit: [
      "Rimowa Original Cabin Carry-On (Silver Aluminum)",
      "2× Dual-Interior Height-Adjustable Flex Dividers",
      "Rimowa Leather Luggage Tag",
      "Protective Cotton Drawstring Dust Cover",
    ],
    specifications: [
      { label: "Dimensions", value: "55 × 40 × 23 cm (Carry-On Approved)" },
      { label: "Capacity", value: "35 Liters" },
      { label: "Shell Material", value: "High-End Anodized Aluminum" },
      { label: "Wheel System", value: "Rimowa Ball-Bearing Multiwheel®" },
      { label: "Locks", value: "Dual TSA-Approved Combination Locks" },
      { label: "Weight", value: "4.3 kg (9.5 lbs)" },
    ],
    keywords: ["Rimowa", "Luggage", "Travel"],
  },
  {
    id: "bose-s1-pro-plus",
    brand: "Bose",
    title: "Bose S1 Pro+ Portable PA Speaker System",
    category: "Events & Party",
    categoryLabel: "EVENTS & PRO AUDIO",
    condition: "Like New",
    conditionScore: "Like New (Condition 9.9/10)",
    rating: 5.0,
    reviews: 29,
    location: "San Mateo, CA",
    distance: "3.4 mi",
    pickupArea: "Central San Mateo, CA",
    pricePerDay: 38,
    weeklyPrice: 225,
    securityDeposit: 130,
    insuredUpTo: 1200,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDrcswAAUQMBjuNfwjhgWG8KxtzUCv2i5kLWA0-z57JkS2NZQZVJKwfCfQgfs20GXxugnWxvL4_OeygSNpx3-ZuoxTiXrxsItAAhYtS4AVmjGIxwu3lBDhtzpJ_nr1RLCIFBR4uR68SyNDJxgzxoskElSztaiH_XXxrkc4XTdljm35I9q_t-mybM_eeO97Sfdnhgg6W-dCaB-tH5SW-y3h9iy71pREYsEuatvHSPbxp4THgFLn9YyJSNg",
    alt: "A Bose S1 Pro Plus portable wireless PA speaker system angled on a clean studio podium with an OLED channel display glowing subtly.",
    summary:
      "All-in-one battery-powered portable PA system with integrated 3-channel mixer, OLED displays, Bluetooth 5.0 streaming, and wireless microphone/instrument RF receivers built right in.",
    includedInKit: [
      "Bose S1 Pro+ Wireless PA System",
      "Shure SM58 Dynamic Vocal Microphone + XLR Cable",
      "Bose Rechargeable Lithium-Ion Battery (Installed)",
      "Adjustable Aluminum Speaker Tripod Stand",
      "AC Power Cord & Padded Slip Cover",
    ],
    specifications: [
      { label: "Mixer Channels", value: "3-Channel Integrated Digital Mixer" },
      { label: "Battery Life", value: "Up to 11 Hours Continuous Play" },
      { label: "Wireless Range", value: "Bluetooth 5.0 (Up to 30 ft)" },
      { label: "Inputs", value: "2× Combo XLR-1/4\", 1/4\" Aux, 3.5mm" },
      { label: "Positioning", value: "4-Position Auto EQ Orientation" },
      { label: "Weight", value: "6.5 kg (14.4 lbs)" },
    ],
    keywords: ["Bose", "Speaker", "Audio"],
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
    id: "dji-ronin-rs3-gimbal",
    badge: "Gimbal",
    rating: 4.95,
    reviews: 24,
    title: "DJI Ronin RS3 Gimbal",
    location: "San Francisco • 1.8 mi away",
    pricePerDay: 32,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCZLPeyA08PN8tRtBH98U03CxwUI5GNhxmgMSS4zE4JEo8fgCcYWAZaNAOzfRoseGZEBR5OY0mZADH_o_jwRS39Ydoija7eTMVf_izueR4FKmwJ10p-j9Lct_gKr11oApcaJQNx6lj1DYzVJllU8JPrBPLjfxEPtIhGXI3nqO3_4EGiwDbbtWIVqTCEqAGDD1-hvfM1RjAMd4wmN6g4EJQTrVgpG760f_rnzecLj0AZB2JNBxJ_nKpb1w",
    alt: "A sleek DJI RS 3 Pro handheld gimbal stabilizer standing upright on a minimalist white table surface with diffused studio illumination and crisp subtle shadows.",
    linkedItemId: "dji-air-3",
  },
  {
    id: "sony-fe-70-200-gm-ii",
    badge: "Telephoto",
    rating: 5.0,
    reviews: 19,
    title: "Sony FE 70-200mm GM II",
    location: "SOMA, SF • 3.1 mi away",
    pricePerDay: 42,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCKrdA8avKHz_tDXqLmxuV5afwOc2qlhskexYQ8BdwPuMmmNQes4hw-cl6hfDcZvdlKwH-hGz-Tear5KlcBVq7DhWe8BMctrxt3l2xPvED4I1nbFDuQ2Pui2uoZbFucgF7H-rMbY20wkSIN5verzTmQLQohLDiyO4Q3MOo26EPBktipyCVMP6lmQvOUFpS9uVfvbhFR0vTvf-foVqlZ0nuYEvOKRdctC3RbOX_jNzzOSSb-njMVSlHtbA",
    alt: "A Sony FE 70-200mm f/2.8 GM OSS II telephoto zoom lens shown in pristine condition against a soft off-white gallery background with subtle studio lighting.",
    linkedItemId: "sony-a7-iv",
  },
  {
    id: "sennheiser-wireless-mic",
    badge: "Audio",
    rating: 4.88,
    reviews: 41,
    title: "Sennheiser Wireless Mic Kit",
    location: "Mission District • 0.8 mi away",
    pricePerDay: 25,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB5L2saQDx-wQqEAP7Ztff4RfTs3RRhrJiWRJQ_0TXiQukhdXTODsG_uGI7Yva9C04ln8VNdsAf3BtmrdcA1gguHJa-Btthz3j25ur7iZtkTiksWBFA6OGuBVC4n2cvwI2NOd_UcPCsFuht6sCG5-AA4Uv0GkozwG7JHqtIUDCJDd_tL2pgktdHrpBLPVAwGqd3_2Jd2ZfZJ7T9hsCuJ5U4yQpLZg2o8NeNVIO0zmGIHALUuQ4BzuzuHQ",
    alt: "A Sennheiser AVX digital wireless lavalier microphone kit displayed neatly with transmitter, compact receiver, and cables on a calm light-mode editorial surface.",
    linkedItemId: "bose-s1-pro-plus",
  },
  {
    id: "rimowa-protective-case",
    badge: "Luggage",
    rating: 4.92,
    reviews: 12,
    title: "Rimowa Protective Travel Case",
    location: "Potrero Hill, SF • 2.9 mi away",
    pricePerDay: 20,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD9T62oXmlFWHvlKFmsO1Y7UdACAsYRoSYniUeag3esHZ2AIQaVc0e6MG0yaiiE8XJ1MhpEd1oaVlBg9ZHzXhleB-vtg6ZJbWWx7SqHQfb_0kCeKHZfIdLvdW-VtGkGMEL-hV74f5WWIUgvgWTxuJkt579ktnb4nazKHqhaIumcU4mRb4i1uyyPJ_gl-ALFtIZI3g5AcMVI2J7Hv2vMkG-stiXBC-PanWa1jFcgAuzuHinYXBuyGjLBjA",
    alt: "An aluminum Rimowa protective equipment travel case with custom pre-cut padded foam interior, open to show neat compartments in a bright contemporary architectural gallery.",
    linkedItemId: "rimowa-original-cabin",
  },
];

export function getRentalItemById(id?: string | null): RentalListingItem {
  if (!id) return RENTAL_ITEMS[0];
  return RENTAL_ITEMS.find((item) => item.id === id) ?? RENTAL_ITEMS[0];
}
