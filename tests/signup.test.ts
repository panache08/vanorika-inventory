import { describe, it, expect, beforeEach } from "vitest";
import { adminPrisma } from "@/lib/db";
import { forTenant } from "@/lib/tenant";
import { resetDb, makeBusiness } from "./helpers/db";
import { signUp } from "@/server/signup";
import { verifyPassword } from "@/lib/password";

describe("self-serve signup", () => {
  beforeEach(resetDb);

  it("creates a business and an owner with a hashed password", async () => {
    const res = await signUp({ businessName: "Panashe Hardware", name: "Don", email: "don@shop.co", password: "supersecret" });
    expect(res.ok).toBe(true);
    const user = await adminPrisma.user.findFirst({ where: { email: "don@shop.co" }, include: { business: true } });
    expect(user).toBeTruthy();
    expect(user!.role).toBe("OWNER");
    expect(user!.business.name).toBe("Panashe Hardware");
    expect(await verifyPassword("supersecret", user!.passwordHash)).toBe(true);
  });

  it("rejects a duplicate email", async () => {
    await signUp({ businessName: "A", name: "A", email: "dup@shop.co", password: "password8x" });
    const res = await signUp({ businessName: "B", name: "B", email: "dup@shop.co", password: "password8x" });
    expect(res.ok).toBe(false);
  });

  it("gives two shops with the same name different slugs", async () => {
    await signUp({ businessName: "Corner Shop", name: "A", email: "a@shop.co", password: "password8x" });
    await signUp({ businessName: "Corner Shop", name: "B", email: "b@shop.co", password: "password8x" });
    const bs = await adminPrisma.business.findMany({ where: { name: "Corner Shop" } });
    expect(bs).toHaveLength(2);
    expect(bs[0].slug).not.toBe(bs[1].slug);
  });

  it("rejects a short password and a bad email", async () => {
    expect((await signUp({ businessName: "X", name: "X", email: "x@shop.co", password: "short" })).ok).toBe(false);
    expect((await signUp({ businessName: "X", name: "X", email: "notanemail", password: "password8x" })).ok).toBe(false);
  });

  it("isolates a new owner — cannot see another business's products", async () => {
    const other = await makeBusiness("Other Store");
    await adminPrisma.product.create({ data: { businessId: other.id, name: "Secret", sku: "SEC", costPrice: 1, sellPrice: 1 } });

    const res = await signUp({ businessName: "Fresh", name: "F", email: "f@shop.co", password: "password8x" });
    if (!res.ok) throw new Error("signup failed");
    const seen = await forTenant(res.data.businessId, (tx) => tx.product.findMany());
    expect(seen).toEqual([]); // RLS hides the other tenant's product
  });
});
