# TravelFlow

基于 Next.js 14 App Router 的智能旅行伴侣（MVP）初始化项目。

## 已完成初始化内容

- ✅ Next.js + TypeScript + App Router 项目结构
- ✅ Tailwind CSS 配置（含全局字体与暗色模式基础）
- ✅ Supabase SDK 接入与环境变量模板
- ✅ Lucide 图标库接入
- ✅ 按 PRD/SDD 预置核心路由：`/`、`/new`、`/trip/[id]`、`/trip/[id]/share`
- ✅ 提供与文档数据库结构对齐的 Supabase 类型定义文件

## 目录结构

```bash
.
├── app/
│   ├── new/page.tsx
│   ├── trip/[id]/page.tsx
│   ├── trip/[id]/share/page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   └── site-header.tsx
├── lib/
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

3. 启动开发环境

```bash
npm run dev
```

访问：<http://localhost:3000>

## Supabase 类型定义说明

- 文件：`types/supabase.ts`
- 已覆盖表：`profiles`、`trips`、`days`、`events`、`memories`
- 包含 `Row / Insert / Update / Relationships` 类型，可直接用于查询与写入约束。

## 下一步建议

- 接入 Server Actions：`generateItineraryAction(prompt: string)`
- 将 Dify API 输出落库到 `trips/days/events`
- 添加 Timeline 组件与地图组件（高德 API）
- 增加 Auth + RLS 验证流程
