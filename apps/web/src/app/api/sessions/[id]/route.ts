import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@packages/model/db/client";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const gameSession = await prisma.session.findUnique({
      where: { id },
    });

    if (!gameSession || gameSession.userId !== session.user.id) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: gameSession.id,
      prompt: gameSession.prompt,
      status: gameSession.status,
      createdAt: gameSession.createdAt.toISOString(),
      clarification: gameSession.clarification,
      plan: gameSession.plan,
      code: gameSession.code,
      error: gameSession.error,
    });
  } catch (error) {
    console.error("[/api/sessions/[id]] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
