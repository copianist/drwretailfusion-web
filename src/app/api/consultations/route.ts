import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const schema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().toLowerCase().email(),
  preferredDate: z.string().trim().min(1).max(100),
  notes: z.string().trim().max(2000).optional(),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Please fill in your name, email and a preferred date." }, { status: 400 });
  const user = await getCurrentUser();
  await prisma.consultation.create({ data: { ...parsed.data, userId: user?.id ?? null } });
  return NextResponse.json({ ok: true });
}
