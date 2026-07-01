"use server";

import { db } from "@/db/client";
import { employees, audit_logs } from "@/db/schema";
import { requireAuth, requireRole } from "@/lib/auth/server";
import { resolveMosqueId } from "./_helpers";
import { eq, and, desc, isNull, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type InsertEmployee = {
  name: string;
  phone?: string | null;
  position: string;
  salary?: number | null;
  salary_period?: string;
  subject?: string | null;
  schedule?: string | null;
  join_date?: string | null;
  status?: string;
  notes?: string | null;
};

export async function getEmployees(mosqueId?: string) {
  const mid = await resolveMosqueId(mosqueId);
  await requireRole(mid, "superadmin", "admin_dkm", "people_culture");
  return db
    .select()
    .from(employees)
    .where(and(eq(employees.mosque_id, mid), isNull(employees.deleted_at)))
    .orderBy(desc(employees.created_at));
}

export async function getEmployee(id: string) {
  const [row] = await db.select().from(employees).where(eq(employees.id, id)).limit(1);
  return row ?? null;
}

export async function createEmployee(data: InsertEmployee) {
  const profile = await requireAuth();
  const mid = await resolveMosqueId();
  const [row] = await db
    .insert(employees)
    .values({
      mosque_id: mid,
      name: data.name,
      phone: data.phone ?? null,
      position: data.position,
      salary: data.salary ?? 0,
      salary_period: data.salary_period ?? "Bulanan",
      subject: data.subject ?? null,
      schedule: data.schedule ?? null,
      join_date: data.join_date ?? null,
      status: data.status ?? "Aktif",
      notes: data.notes ?? null,
      created_by: profile.id,
    })
    .returning();
  if (!row) throw new Error("Operation failed");

  await db.insert(audit_logs).values({
    mosque_id: mid,
    action: "insert",
    entity_type: "employees",
    entity_id: row.id,
    actor_id: profile.id,
    changes: data,
  });

  revalidatePath(`/admin/employees`);
  return row;
}

export async function updateEmployee(id: string, data: Partial<InsertEmployee>) {
  const profile = await requireAuth();
  const old = await getEmployee(id);
  if (!old) throw new Error("Pegawai tidak ditemukan");
  await requireRole(old.mosque_id, "superadmin", "admin_dkm", "people_culture");

  const [row] = await db
    .update(employees)
    .set({ ...data, updated_at: sql`NOW()` })
    .where(eq(employees.id, id))
    .returning();
  if (!row) throw new Error("Operation failed");

  await db.insert(audit_logs).values({
    mosque_id: old.mosque_id,
    action: "update",
    entity_type: "employees",
    entity_id: id,
    actor_id: profile.id,
    changes: { old, new: data },
  });

  revalidatePath(`/admin/employees`);
  return row;
}

export async function deleteEmployee(id: string) {
  const profile = await requireAuth();
  const old = await getEmployee(id);
  if (!old) throw new Error("Pegawai tidak ditemukan");
  await requireRole(old.mosque_id, "superadmin", "admin_dkm", "people_culture");

  await db
    .update(employees)
    .set({ deleted_at: sql`NOW()` })
    .where(eq(employees.id, id));

  await db.insert(audit_logs).values({
    mosque_id: old.mosque_id,
    action: "delete",
    entity_type: "employees",
    entity_id: id,
    actor_id: profile.id,
    changes: old,
  });

  revalidatePath(`/admin/employees`);
}
