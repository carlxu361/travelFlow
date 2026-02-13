# TravelFlow

基于 Next.js 14 App Router 的智能旅行伴侣（MVP）初始化项目。

## 已完成初始化内容

- ✅ Next.js + TypeScript + App Router 项目结构
- ✅ Tailwind CSS 配置（含全局字体与暗色模式基础）
- ✅ Supabase SDK 接入与环境变量模板
- ✅ Lucide 图标库接入
- ✅ 按 PRD/SDD 预置核心路由：`/`、`/new`、`/trip/[id]`、`/trip/[id]/share`
- ✅ 提供与文档数据库结构对齐的 Supabase 类型定义文件
- ✅ 提供 Server Actions 占位实现：`createTrip`、`getTripDetails`、`deleteTrip`、`generateItineraryAction`
- ✅ 新增 `db/schema.sql`，可直接复制到 Supabase SQL Editor 执行

## 目录结构

```bash
.
├── app/
│   ├── actions/
│   │   ├── ai-actions.ts
│   │   └── trip-actions.ts
│   ├── new/page.tsx
│   ├── trip/[id]/page.tsx
│   ├── trip/[id]/share/page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── site-header.tsx
│   └── trip/
│       ├── next-action-card.tsx
│       └── timeline-card.tsx
├── db/
│   └── schema.sql
├── lib/
│   ├── dify/schema.ts
│   ├── domain/trip.ts
│   ├── mock/trip.ts
│   └── supabase/client.ts
├── types/
│   └── supabase.ts
├── document/
│   ├── 软件需求规格说明书 (PRD).md
│   └── 系统架构与详细设计文档 (SDD).md
├── .env.example
├── tailwind.config.ts
├── next.config.mjs
└── package.json
```

## 快速开始

1. 安装依赖

```bash
npm install
```

2. 配置环境变量

```bash
cp .env.example .env.local
```

并填入你的 Supabase 项目配置：

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `OPENAI_BASE_URL`
- `OPENAI_API_KEY`
- `OPENAI_MODEL`

3. 启动开发环境

```bash
npm run dev
```

访问：<http://localhost:3000>

## Supabase 类型定义说明

- 文件：`types/supabase.ts`
- 已覆盖表：`profiles`、`trips`、`days`、`events`、`memories`
- 包含 `Row / Insert / Update / Relationships` 类型，可直接用于查询与写入约束。

## 当前实现说明

- `/trip/[id]` 已实现 Next Action + TimelineCard 的时间线展示逻辑（使用 mock 数据）。
- `app/actions/ai-actions.ts` 提供了 `generateItineraryAction` 占位实现，并通过 `lib/dify/schema.ts` 做 JSON 解析约束。
- `db/schema.sql` 与 SDD 表结构保持一致，可作为第一版建表脚本。

## 下一步建议

- 将 `app/actions/trip-actions.ts` 从 mock 切换为 Supabase 真实读写。
- 接入 Dify API（Blocking Mode），替换 `mockDifyResponse`。
- 在 `/trip/[id]` 中接入地图（高德 API）实现 Timeline 与地图联动。
- 增加 Auth + RLS + 分享页 token 校验流程。


## 测试与排障

在当前受限网络环境（npm registry 可能返回 403）下，先运行离线校验：

```bash
npm test
```

该命令不会拉取依赖，可验证脚手架关键文件、依赖声明和 Supabase 类型定义是否完整。

如果要运行 `lint / build / typecheck`，请先确保你的网络策略允许访问 npm registry，或配置企业私有镜像后再执行：

```bash
npm install
npm run lint
npm run typecheck
npm run build
```


## OpenAI 兼容 API 接入说明

`/new` 页面已接入 `POST /api/ai/generate`，支持“首次生成 + 基于既有行程二次完善”，并使用 OpenAI Chat Completions 兼容协议：

- Endpoint: `${OPENAI_BASE_URL}/chat/completions`
- Header: `Authorization: Bearer ${OPENAI_API_KEY}`
- Body: `model + messages`

返回内容会被解析为结构化行程并在页面展示。

新增能力：
- AI 对话/创建行程支持流式输出（前端实时显示增量内容）
- API 异常采用统一错误捕获与前台友好提示（隐藏上游敏感报错细节）
- 二次完善改为“行程画布（JSON）编辑 + 基于画布二次完善”
- 支持“不满意重新生成”
- 支持本地行程管理（保存/加载/删除）

> 注意：模型输出必须是纯 JSON（不要 markdown 代码块）；项目已内置代码块包裹内容的清洗逻辑。
