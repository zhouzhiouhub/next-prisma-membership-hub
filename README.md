## Membership App（Next.js + Prisma 会员订阅系统）

一个基于 **Next.js App Router** 与 **Prisma ORM** 构建的会员订阅与订单管理系统，包含：

- **用户端**：注册登录、邮箱验证、会员套餐展示、下单购买、订阅状态与订单查询等
- **管理端（Admin）**：用户管理、套餐管理、订单管理等基础运营能力

默认使用 **SQLite 本地数据库（`dev.db`）** 进行开发调试，可根据需要切换为 MySQL / MariaDB。

---

## 功能特性概览

- **用户端功能**
  - **账号注册与登录**：邮箱 + 密码注册登录，密码以哈希形式存储
  - **邮箱验证**：注册后发送验证码邮件，验证通过后方可正常使用
  - **忘记密码 / 重置密码**：通过邮箱验证码重置密码
  - **会员套餐展示**：在 `pricing` 页面查看系统配置的所有可售套餐
  - **下单购买**：选择套餐后创建订单，后续可对接支付渠道
  - **订阅管理**：查看当前订阅套餐、到期时间、自动续费状态等
  - **订单列表**：查看历史订单

- **管理端功能**
  - **管理员登录**：进入 `/admin` 后台进行运营管理
  - **用户管理**：查看用户基础信息与订阅状态
  - **套餐管理**：管理 `MembershipPlan`（增删改查）
  - **订单管理**：查看订单列表、筛选订单、查看订单详情

- **后端能力**
  - 所有业务通过 **Next.js Route Handlers（`app/api/**`）** 暴露 API
  - 使用 **Prisma** 进行数据库访问与迁移
  - 使用 **Zod** 进行参数与业务输入校验
  - 使用 **jsonwebtoken (JWT)** 实现轻量级认证令牌逻辑
  - 使用 **Nodemailer** 发送邮箱验证码（开发环境可仅打印日志）

---

## 技术栈

- **框架**
  - Next.js `^15`
  - React（最新稳定版本）
  - TypeScript

- **数据库 & ORM**
  - SQLite（本地开发默认）
  - Prisma ORM
  - 支持向 MariaDB / MySQL 迁移（已包含 `@prisma/adapter-mariadb` 与 `mariadb` 依赖）

- **核心依赖**
  - `@prisma/client` / `prisma`
  - `@prisma/adapter-better-sqlite3` + `better-sqlite3`
  - `bcryptjs`：密码哈希
  - `jsonwebtoken`：JWT 生成与校验
  - `nodemailer`：发送邮件验证码
  - `zod`：参数与表单数据校验

---

## 项目结构

项目主要目录结构（截取关键部分）：

```text
app/
  (public)/
    layout.tsx
    page.tsx
    pricing/page.tsx
    checkout/page.tsx
    login/page.tsx
    register/page.tsx
    forgot-password/page.tsx
    account/
      layout.tsx
      page.tsx
      profile/page.tsx
      orders/page.tsx
      subscription/page.tsx
  admin/
    layout.tsx
    login/page.tsx
    dashboard/page.tsx
    users/page.tsx
    orders/page.tsx
    plans/page.tsx
  api/
    auth/
      register/route.ts
      login/route.ts
      logout/route.ts
      verify-email/route.ts
      forgot-password/route.ts
      reset-password/route.ts
    account/
      me/route.ts
      profile/route.ts
      password/route.ts
      email/request-change/route.ts
      email/confirm-change/route.ts
      orders/route.ts
      subscriptions/route.ts
    membership/
      plans/route.ts
    order/
      create/route.ts
    admin/
      admins/route.ts
      auth/forgot-password/route.ts
      auth/reset-password/route.ts
      membership/plans/[id]/route.ts
      membership/plans/route.ts
      users/[id]/route.ts
      users/route.ts
      orders/route.ts
    health/route.ts

lib/
  config.ts              # 应用基本配置（应用名等）
  db.ts                  # Prisma Client 初始化（Better SQLite 适配器）
  services/              # 业务服务层（高内聚，低耦合）
    authService.ts
    accountService.ts
    membershipService.ts
    subscriptionService.ts
    orderService.ts
    emailService.ts
  utils/                 # 工具函数与通用逻辑
    jwt.ts
    captcha.ts
    idGenerator.ts
    codeGenerator.ts
    logger.ts
    validators.ts
    authValidators.ts
    accountValidators.ts
    membershipValidators.ts

prisma/
  schema.prisma          # 数据库模型定义
  migrations/            # Prisma 迁移记录

dev.db                   # 默认 SQLite 数据库文件（开发环境）
docs/Development.md      # 更详细的开发文档
package.json
tsconfig.json
next.config.mjs
```

设计上遵循 **SOLID / DRY / SRP** 原则：UI 页面主要负责展示与交互，核心业务逻辑集中在 `lib/services` 与 `app/api/**` 中，做到 UI 与核心逻辑解耦。

---

## 本地开发环境

### 1. 环境准备

- Node.js：建议 **≥ 18**
- 包管理工具：推荐使用 `npm`（也可使用 `pnpm` / `yarn`，需自行调整命令）

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

在项目根目录创建 `.env` 文件（或 `.env.local`），并至少配置数据库、JWT 与邮件相关变量，示例：

```bash
# 数据库（SQLite）
DATABASE_URL="file:./dev.db"

# JWT 密钥（务必使用随机且足够复杂的字符串）
AUTH_SECRET="your-strong-jwt-secret"

# 邮件配置（如使用 SMTP）
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USER="your-smtp-username"
SMTP_PASS="your-smtp-password"

# 邮件发件人（示例，不要使用真实个人邮箱）
EMAIL_FROM="Membership App <noreply@example.com>"
```

> 说明：上方所有示例邮箱和域名均为占位示例，请根据实际情况替换，但请避免在公开仓库中提交真实个人邮箱。

### 4. 初始化数据库（Prisma）

首次运行前建议执行迁移命令，确保数据库结构与 `schema.prisma` 同步：

```bash
npx prisma migrate dev --name init
```

如果只是基于已有的 `dev.db` 快速启动，也可以先跳过该步骤；如对模型进行了修改，则需重新执行 Prisma 迁移。

### 5. 启动开发服务器

```bash
npm run dev
```

默认在 `http://localhost:3000` 启动：

- `/`：用户端首页
- `/pricing`：套餐列表
- `/login` / `/register`：登录 / 注册
- `/account`：用户个人中心（需要登录）
- `/admin`：后台管理（需要管理员权限）

---

## 环境变量说明

系统通过 `.env` / `.env.local` 统一管理配置，主要变量包括：

- **数据库**
  - `DATABASE_URL`：Prisma 数据源连接串
    - 本地 SQLite 示例：`file:./dev.db`
    - 若改用 MySQL / MariaDB，可使用：`mysql://user:password@host:port/dbname`

- **认证 / 安全**
  - `AUTH_SECRET`：JWT 签名密钥，`lib/utils/jwt.ts` 用于生成与校验认证 Token

- **邮件（Nodemailer）**
  - `SMTP_HOST`：SMTP 主机地址
  - `SMTP_PORT`：端口（默认 587，465 通常为 SSL）
  - `SMTP_USER`：SMTP 用户名
  - `SMTP_PASS`：SMTP 密码
  - `SMTP_SECURE`：是否启用安全连接（`"true"` / `"false"`）
  - `EMAIL_FROM`：发件人显示信息，例如：`"Membership App <noreply@example.com>"`

在开发环境下，如果未配置 SMTP 相关变量，`emailService` 会自动降级为 **控制台打印邮件内容**，方便调试，不会真正发送邮件。

---

## 核心模块说明（简要）

- **认证与账号（Auth & Account）**
  - `app/api/auth/*` 提供注册、登录、登出、邮箱验证、忘记密码、重置密码等接口
  - `lib/services/authService.ts` 封装登录注册等业务逻辑
  - `lib/utils/jwt.ts` 提供 `signAuthToken` / `verifyAuthToken`，通过 `AUTH_SECRET` 生成 / 校验 Token

- **会员套餐与订阅**
  - Prisma 模型 `MembershipPlan` 与 `UserSubscription`
  - `app/api/membership/plans/route.ts`：获取可用套餐列表
  - `lib/services/membershipService.ts` 与 `subscriptionService.ts`：处理订阅的创建、续费、状态计算等逻辑

- **订单系统**
  - Prisma 模型 `Order`
  - `app/api/order/create/route.ts`：创建订单
  - `app/api/account/orders/route.ts`：用户端订单查询
  - `app/api/admin/orders/route.ts`：管理端订单管理
  - 后续可对接支付渠道回调接口以更新订单与订阅状态

- **管理后台（Admin）**
  - 页面位于 `app/admin/**`
  - API 位于 `app/api/admin/**`
  - 通过用户角色（如 `UserRole.ADMIN`）进行权限控制

---

## Prisma 数据模型概览

根据 `prisma/schema.prisma`，系统包含以下主要模型与枚举（仅概念说明）：

- **User**
  - 字段：`id`, `email`, `passwordHash`, `name`, `role`, `isEmailVerified`, `emailVerifiedAt`, 等
  - 关系：`subscriptions`（用户订阅列表）、`orders`（订单列表）

- **MembershipPlan**
  - 字段：`id`, `name`, `description`, `price`, `currency`, `billingCycle`, `features`, `isActive`, 等
  - 关系：`subscriptions`, `orders`

- **UserSubscription**
  - 字段：`id`, `userId`, `planId`, `status`, `startAt`, `endAt`, `autoRenew`, 等

- **Order**
  - 字段：`id`, `orderNo`, `userId`, `planId`, `amount`, `currency`, `status`, `paymentChannel`, `paymentId`, 等

- **枚举**
  - `UserRole`：`USER` / `ADMIN`
  - `BillingCycle`：`MONTHLY` / `YEARLY`
  - `SubscriptionStatus`：`ACTIVE` / `CANCELED` / `EXPIRED`
  - `OrderStatus`：`PENDING` / `PAID` / `CANCELED` / `REFUNDED`
  - `PaymentChannel`：`ALIPAY` / `WECHAT` / `STRIPE` / `PAYPAL`

更多详细字段与关系可直接查看 `prisma/schema.prisma` 文件。

---

## 构建与部署

### 构建

```bash
npm run build
```

### 生产环境启动

```bash
npm start
```

部署时的建议：

- 确保配置正确的 `DATABASE_URL`、`AUTH_SECRET` 以及邮件相关环境变量
- 若使用 SQLite，在单实例小规模场景下通常足够；如需高并发或多实例部署，建议切换到 MySQL / MariaDB
- 前置反向代理（如 Nginx）或使用 Vercel 等平台托管均可

---

## 代码规范与最佳实践

- **TypeScript 全面启用**：提升类型安全性与可维护性
- **SOLID / DRY / SRP**：模块职责单一、逻辑复用、避免重复代码
- **高内聚低耦合**：
  - UI 层（`app/**` 页面与组件）只负责展示与交互
  - 业务逻辑集中在 `lib/services/**` 与 `app/api/**` 中
- **输入校验必备**：通过 `zod` 对请求体、查询参数等进行校验
- **统一错误处理与日志记录**：通过 `lib/utils/logger.ts` 等工具集中处理

如需更深入的开发说明（包括 API 设计、错误处理、测试策略、性能优化、安全措施等），请参考 `docs/Development.md`。


