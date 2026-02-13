# 系统架构与详细设计文档 (SDD)



## 1. 技术栈选型 (Tech Stack)

* **前端框架:** Next.js 14+ (App Router) - *利用 SSR 提升首屏速度，Server Actions 处理后端逻辑。*
* **开发语言:** TypeScript - *强类型约束，减少 AI 生成代码的 Bug。*
* **样式方案:** Tailwind CSS + ShadcnUI + Framer Motion (动画)。
* **数据库:** Supabase (PostgreSQL) - *自带 Auth, Realtime, Vector (未来扩展)。*
* **AI 编排:** Dify (API Mode) - *负责处理 Prompt Engineering 和 搜索增强。*
* **地图服务:** AMAP (高德地图 JS API 2.0) - *国内数据最准。*
* **部署:** Vercel (前端/API) + Supabase (数据库)。

## 2. 系统架构图 (Architecture)
<img width="2048" height="1453" alt="image" src="https://github.com/user-attachments/assets/f20f431e-fa58-4250-933e-553bd6d50c86" />

```mermaid
graph TD
    Client[User Client (Mobile/PC)] -->|HTTPS| NextJS[Next.js App Server (Vercel)]
    
    subgraph "Backend Services"
        NextJS -->|Server Actions| SupabaseDB[(Supabase PostgreSQL)]
        NextJS -->|Auth| SupabaseAuth[Supabase Auth]
        NextJS -->|API Call| DifyAPI[Dify AI Workflow]
    end
    
    subgraph "External Services"
        DifyAPI -->|Search| GoogleSearch[Google/Serper]
        DifyAPI -->|LLM| GPT4[GPT-4o / DeepSeek]
        Client -->|Map Rendering| AmapAPI[高德地图 SDK]
    end

```

## 3. 数据库设计 (Database Schema)

*注意：请 AI 严格按照此 Schema 生成 SQL。*

### 3.1 ER 图逻辑

`Profiles` (1) ---- (N) `Trips` (1) ---- (N) `Days` (1) ---- (N) `Events`

### 3.2 详细表结构定义 (SQL)

```sql
-- 1. 用户档案表 (扩展 Supabase Auth)
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  display_name text,
  avatar_url text,
  created_at timestamptz default now()
);

-- 2. 行程总表
create table public.trips (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  title text not null, -- e.g., "长沙亲子游"
  destination text not null,
  start_date date,
  end_date date,
  status text check (status in ('planning', 'active', 'completed')) default 'planning',
  created_at timestamptz default now()
);

-- 3. 每日安排表 (作为 Events 的容器)
create table public.days (
  id uuid default gen_random_uuid() primary key,
  trip_id uuid references public.trips(id) on delete cascade not null,
  day_index int not null, -- 第几天, e.g., 1, 2, 3
  date date, -- 具体日期
  summary text -- AI 生成的当日概述
);

-- 4. 事件详情表 (核心表)
create table public.events (
  id uuid default gen_random_uuid() primary key,
  day_id uuid references public.days(id) on delete cascade not null,
  trip_id uuid references public.trips(id) not null, -- 冗余字段方便查询
  
  -- 时间管理
  start_time time, -- e.g., '09:00'
  end_time time,
  is_time_flexible boolean default false, -- 是否是浮动时间
  
  -- 事件内容
  title text not null, -- 地点名称或活动名
  description text, -- AI 推荐理由或备注
  category text check (category in ('spot', 'food', 'hotel', 'transport', 'custom')),
  
  -- 地理位置 (关键)
  location_name text, -- 高德地图搜索关键词
  address text,
  geo_point geography(POINT), -- PostGIS 格式: POINT(lng lat)
  
  -- 外部链接
  external_link text, -- 大众点评/美团链接
  
  -- 状态
  is_completed boolean default false,
  
  created_at timestamptz default now()
);

-- 5. 媒体记录表 (用于行中记录)
create table public.memories (
  id uuid default gen_random_uuid() primary key,
  event_id uuid references public.events(id),
  trip_id uuid references public.trips(id),
  type text check (type in ('image', 'text', 'voice')),
  content_url text, -- 图片/语音 URL
  text_content text, -- 文字记录
  created_at timestamptz default now()
);

```

## 4. API 接口设计 (Server Actions)

由于使用 Next.js，我们将采用 Server Actions 而非 REST API，以便前后端类型安全。

### 4.1 Trip Actions

* `createTrip(data: TripInput): Promise<Trip>`
* `getTripDetails(id: string): Promise<TripWithDaysAndEvents>`
* `deleteTrip(id: string): Promise<void>`

### 4.2 AI Actions (Core)

* **Function:** `generateItineraryAction(prompt: string)`
* **Logic:**
1. 接收用户 Prompt。
2. 构造 Dify 请求 Payload。
3. 调用 Dify API (Blocking Mode)。
4. 接收 JSON Response。
5. 解析 JSON 并通过事务 (Transaction) 写入 `trips`, `days`, `events` 表。
6. 返回 `trip_id` 重定向前端。



## 5. AI 集成规范 (Prompt Engineering)

为了让 Dify 稳定输出，必须定义严格的 JSON Schema。

**System Prompt (For Dify/LLM):**

```text
你是一个专业的旅行规划助手。
请根据用户的输入（包含目的地、天数、人数、偏好），生成一份详细的 JSON 格式行程。

# 约束条件
1. 必须返回纯 JSON 格式，不要包含 Markdown 代码块标记。
2. 必须包含具体的经纬度（如果不确定，请根据地名预估一个）。
3. 时间安排要合理，考虑交通耗时。

# JSON 输出结构示例
{
  "trip_title": "长沙3日亲子深度游",
  "days": [
    {
      "day_index": 1,
      "date_offset": 0,
      "summary": "抵达长沙，打卡地标",
      "events": [
        {
          "time": "10:00",
          "title": "橘子洲头",
          "category": "spot",
          "description": "乘坐小火车游览，适合孩子...",
          "location": "橘子洲景区",
          "geo": {"lat": 28.18, "lng": 112.95}
        }
      ]
    }
  ]
}

```

## 6. 前端界面设计 (UI Design Guidelines)

### 6.1 核心页面路由

* `/` (Home): 展示 Dashboard（当前行程卡片 + 历史列表）。
* `/new`: 创建行程向导（输入框 -> Loading -> 结果页）。
* `/trip/[id]`: 行程详情页（包含“列表视图”和“地图视图”切换）。
* `/trip/[id]/share`: 公开分享页（去除编辑功能的详情页）。

### 6.2 关键组件逻辑

* **TimelineCard (组件):**
* Props: `event`
* State: `active` (当前时间在 start/end 之间), `past`, `future`.
* Visual: `Active` 状态下，卡片放大，边框变绿，显示“导航”大按钮。


* **MapContainer (组件):**
* 使用 `react-amap` 或原生 JS API。
* 监听 `Events` 列表，渲染 Marker。
* 点击 TimelineCard 时，地图自动 `setCenter` 到对应坐标。



---

# 第三部分：实施路线图 (Implementation Roadmap)

1. **Phase 1 (Day 1-2): 基础设施搭建**
* 初始化 Next.js + Tailwind + Supabase。
* 在 Supabase 执行 SQL 建表。
* 配置 Dify 并测试 JSON 输出稳定性。


2. **Phase 2 (Day 3-5): 核心业务开发**
* 实现 `generateItineraryAction`，打通 AI 到数据库的链路。
* 开发前端 `Timeline` 视图，确保数据渲染正确。
