import { randomBytes } from "crypto";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { adminPrisma } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { Result, ok, err } from "@/lib/result";

export type SignUpInput = {
  businessName: string;
  name: string;
  email: string;
  password: string;
};

const schema = z.object({
  businessName: z.string().trim().min(1, "Business name is required"),
  name: z.string().trim().min(1, "Your name is required"),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

function slugify(s: string): string {
  return (
    s
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "store"
  );
}

/**
 * Register a brand-new business and its first Owner. Runs through the admin
 * DB role because there is no tenant context yet (a business does not exist
 * to scope to). RLS then isolates everything this owner does afterwards.
 */
export async function signUp(input: SignUpInput): Promise<Result<{ businessId: string; email: string }>> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? "Invalid details");
  const { businessName, name, email, password } = parsed.data;

  try {
    const passwordHash = await hashPassword(password);
    const slug = `${slugify(businessName)}-${randomBytes(4).toString("hex")}`;
    const { businessId } = await adminPrisma.$transaction(async (tx) => {
      const business = await tx.business.create({ data: { name: businessName, slug } });
      await tx.user.create({
        data: { businessId: business.id, name, email, passwordHash, role: "OWNER" },
      });
      return { businessId: business.id };
    });
    return ok({ businessId, email });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      const target = String(e.meta?.target ?? "");
      if (target.includes("email")) return err("That email is already registered. Try signing in instead.");
    }
    console.error("signUp failed:", e);
    return err("Could not create your store. Please try again.");
  }
}
