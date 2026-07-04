import { describe, it, expect, vi, beforeEach } from "vitest";

const mockUser = { id: "user-1" };
const mockProfile = { id: "user-1", nama: "Test User" };

let mockGetUserResult = { data: { user: mockUser }, error: null };
let mockProfileResult: typeof mockProfile | null = mockProfile;
let mockMembershipResult: Record<string, unknown> | null = null;

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabase: vi.fn().mockResolvedValue({
    auth: {
      getUser: vi.fn().mockImplementation(() => Promise.resolve(mockGetUserResult)),
    },
  }),
}));

vi.mock("@/db/client", () => ({
  db: {
    query: {
      profiles: {
        findFirst: vi.fn().mockImplementation(() => Promise.resolve(mockProfileResult)),
      },
      memberships: {
        findFirst: vi.fn().mockImplementation(() => Promise.resolve(mockMembershipResult)),
      },
    },
  },
}));

describe("requireRole", () => {
  beforeEach(() => {
    mockGetUserResult = { data: { user: mockUser }, error: null };
    mockProfileResult = mockProfile;
    mockMembershipResult = null;
    vi.clearAllMocks();
  });

  it("throws Forbidden when user has no membership", async () => {
    const { requireRole } = await import("@/lib/auth/server");
    await expect(requireRole("mosque-1", "admin_dkm")).rejects.toThrow(
      "Forbidden: no active membership at this mosque",
    );
  });

  it("throws Forbidden when role is not in allowed list", async () => {
    mockMembershipResult = {
      profile_id: "user-1",
      mosque_id: "mosque-1",
      role: "warga",
      is_active: true,
    };
    const { requireRole } = await import("@/lib/auth/server");
    await expect(requireRole("mosque-1", "superadmin", "admin_dkm")).rejects.toThrow(
      "Forbidden: requires one of roles superadmin, admin_dkm",
    );
  });

  it("succeeds when role matches allowed list", async () => {
    mockMembershipResult = {
      profile_id: "user-1",
      mosque_id: "mosque-1",
      role: "admin_dkm",
      is_active: true,
    };
    const { requireRole } = await import("@/lib/auth/server");
    const result = await requireRole("mosque-1", "superadmin", "admin_dkm");
    expect(result).toBeDefined();
    expect(result.membership.role).toBe("admin_dkm");
  });

  it("throws Unauthorized when not logged in", async () => {
    mockGetUserResult = { data: { user: null }, error: new Error("No session") };
    const { requireRole } = await import("@/lib/auth/server");
    await expect(requireRole("mosque-1", "superadmin")).rejects.toThrow("Unauthorized");
  });
});
