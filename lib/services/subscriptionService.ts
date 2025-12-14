import { prisma } from "@/lib/db";

/**
 * 查询指定用户的订阅列表（含关联套餐信息），按开始时间倒序（按邮箱过滤）
 */
export async function listSubscriptionsForUser(userEmail: string) {
  return prisma.userSubscription.findMany({
    where: { userEmail },
    include: {
      plan: true,
    },
    orderBy: {
      startAt: "desc",
    },
  });
}


