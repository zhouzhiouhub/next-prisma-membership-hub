import { NextResponse } from "next/server";
import { registerInputSchema } from "@/lib/utils/authValidators";
import { registerUser, authenticateUser } from "@/lib/services/authService";
import { signAuthToken } from "@/lib/utils/jwt";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = registerInputSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { code: "VALIDATION_ERROR", errors: parsed.error.flatten() },
        { status: 400 },
      );
    }

    // 直接创建用户并自动登录（暂时不用邮箱验证）
    await registerUser(parsed.data);

    const authedUser = await authenticateUser({
      email: parsed.data.email,
      password: parsed.data.password,
    });

    const token = signAuthToken({
      email: authedUser.email,
      role: authedUser.role,
    });

    const cookieStore = await cookies();
    cookieStore.set("auth_token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return NextResponse.json(
      {
        code: "OK",
        message: "注册成功，已自动登录",
        data: {
          email: authedUser.email,
          name: authedUser.name,
          role: authedUser.role,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof Error && error.message === "USER_ALREADY_EXISTS") {
      return NextResponse.json(
        { code: "USER_ALREADY_EXISTS", message: "该邮箱已注册" },
        { status: 409 },
      );
    }

    console.error("Register user error:", error);
    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: "注册失败，请稍后重试" },
      { status: 500 },
    );
  }
}

