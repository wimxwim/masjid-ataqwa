/** Query key factory untuk TanStack Query.
 *  Setiap entity punya: all, lists, list(filters), details, detail(id)
 *  Gunakan factory ini di useQuery & useMutation supaya cache key konsisten. */
export const queryKeys = {
  mustahik: {
    all: ["mustahik"] as const,
    lists: () => [...queryKeys.mustahik.all, "list"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.mustahik.lists(), filters] as const,
    details: () => [...queryKeys.mustahik.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.mustahik.details(), id] as const,
  },
  transactions: {
    all: ["transactions"] as const,
    lists: () => [...queryKeys.transactions.all, "list"] as const,
    list: (type?: string) =>
      [...queryKeys.transactions.lists(), type].filter(Boolean) as readonly unknown[],
    details: () => [...queryKeys.transactions.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.transactions.details(), id] as const,
  },
  donatur: {
    all: ["donatur_tetap"] as const,
    lists: () => [...queryKeys.donatur.all, "list"] as const,
    list: () => [...queryKeys.donatur.lists()] as const,
    details: () => [...queryKeys.donatur.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.donatur.details(), id] as const,
  },
  jadwal: {
    all: ["jadwal_imam"] as const,
    lists: () => [...queryKeys.jadwal.all, "list"] as const,
    list: () => [...queryKeys.jadwal.lists()] as const,
    details: () => [...queryKeys.jadwal.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.jadwal.details(), id] as const,
  },
  inventaris: {
    all: ["inventaris"] as const,
    lists: () => [...queryKeys.inventaris.all, "list"] as const,
    list: () => [...queryKeys.inventaris.lists()] as const,
    details: () => [...queryKeys.inventaris.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.inventaris.details(), id] as const,
  },
  testimonials: {
    all: ["testimonials"] as const,
    lists: () => [...queryKeys.testimonials.all, "list"] as const,
    list: (activeOnly?: boolean) =>
      [...queryKeys.testimonials.lists(), activeOnly].filter(Boolean) as readonly unknown[],
    details: () => [...queryKeys.testimonials.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.testimonials.details(), id] as const,
  },
  jamaah: {
    all: ["jamaah"] as const,
    lists: () => [...queryKeys.jamaah.all, "list"] as const,
    list: () => [...queryKeys.jamaah.lists()] as const,
    details: () => [...queryKeys.jamaah.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.jamaah.details(), id] as const,
  },
  activity: {
    all: ["activity_feed"] as const,
    lists: () => [...queryKeys.activity.all, "list"] as const,
    list: (type?: string) =>
      [...queryKeys.activity.lists(), type].filter(Boolean) as readonly unknown[],
  },
  santri: {
    all: ["santri"] as const,
    lists: () => [...queryKeys.santri.all, "list"] as const,
    list: (mosqueId?: string) =>
      [...queryKeys.santri.lists(), mosqueId].filter(Boolean) as readonly unknown[],
    details: () => [...queryKeys.santri.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.santri.details(), id] as const,
  },

  // Public / landing page
  mosque: {
    default: ["mosque", "default"] as const,
  },
  public: {
    transactions: (mosqueId: string) => ["public", "transactions", mosqueId] as const,
    transactionSummary: (mosqueId: string) => ["public", "transaction-summary", mosqueId] as const,
    monthlyTrends: (mosqueId: string) => ["public", "monthly-trends", mosqueId] as const,
    activityFeed: (mosqueId: string) => ["public", "activity-feed", mosqueId] as const,
    testimonials: (mosqueId: string) => ["public", "testimonials", mosqueId] as const,
    dashboardStats: (mosqueId: string) => ["public", "dashboard-stats", mosqueId] as const,
    fundTypeBreakdown: (mosqueId: string) => ["public", "fund-type-breakdown", mosqueId] as const,
  },
  programs: {
    all: ["programs"] as const,
    featured: (mosqueId: string) => [...queryKeys.programs.all, "featured", mosqueId] as const,
  },
  bumm: {
    products: (mosqueId: string) => ["bumm", "products", mosqueId] as const,
  },

  // Admin dashboard
  admin: {
    all: ["admin"] as const,
    overview: (mosqueId: string) => [...queryKeys.admin.all, "overview", mosqueId] as const,
    transactions: (mosqueId: string, type?: string) =>
      [...queryKeys.admin.all, "transactions", mosqueId, type].filter(Boolean) as readonly unknown[],
    mustahik: (mosqueId: string) => [...queryKeys.admin.all, "mustahik", mosqueId] as const,
    jamaah: (mosqueId: string) => [...queryKeys.admin.all, "jamaah", mosqueId] as const,
    inventaris: (mosqueId: string) => [...queryKeys.admin.all, "inventaris", mosqueId] as const,
    donatur: (mosqueId: string) => [...queryKeys.admin.all, "donatur", mosqueId] as const,
    programs: (mosqueId: string) => [...queryKeys.admin.all, "programs", mosqueId] as const,
    mushafir: (mosqueId: string) => [...queryKeys.admin.all, "mushafir", mosqueId] as const,
    employees: (mosqueId: string) => [...queryKeys.admin.all, "employees", mosqueId] as const,
    activity: (mosqueId: string) => [...queryKeys.admin.all, "activity", mosqueId] as const,
    santri: (mosqueId: string) => [...queryKeys.admin.all, "santri", mosqueId] as const,
  },
};
