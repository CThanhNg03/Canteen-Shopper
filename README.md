# Bếp Việt

Ứng dụng MVP lập kế hoạch suất ăn cho nhiều căng tin: nhập quân số và thực đơn riêng từng nơi, sau đó chọn các căng tin để gộp nguyên liệu theo nhà cung cấp, trừ lượng hiện có và chốt danh sách mua.

## Công nghệ và kiến trúc

- Next.js App Router, React, TypeScript và Tailwind CSS.
- PostgreSQL với Drizzle ORM; dữ liệu nghiệp vụ không phụ thuộc hệ thống tệp của máy chủ.
- Zod dùng để xác thực dữ liệu tại biên server action/route handler.
- Các khối quân số, thực đơn, máy tính và mua hàng là component tách biệt để dễ thay giao diện bằng shadcn/v0.
- Trạng thái món mới là `DRAFT`; việc thiếu định mức không ngăn người dùng lưu kế hoạch.
- Hai vai trò dự kiến trong lớp xác thực mỏng là `KITCHEN` và `ADMIN`; bản demo chưa đặt màn hình đăng nhập trước luồng bếp.

## Chạy tại máy

Yêu cầu Node.js 20.9 trở lên và một PostgreSQL đang hoạt động.

```bash
cp .env.example .env.local
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

Mở `http://localhost:3000`. Sửa `DATABASE_URL` để trỏ đến cơ sở dữ liệu của bạn.

## Kiểm tra

```bash
npm run typecheck
npm run lint
npm run build
```

## Triển khai Vercel

1. Tạo PostgreSQL trên Neon, Supabase, Vercel Postgres hoặc nhà cung cấp tương thích.
2. Thêm `DATABASE_URL` trong **Project Settings → Environment Variables** trên Vercel.
3. Chạy migration từ môi trường phát hành (`npm run db:migrate`) trước khi phục vụ dữ liệu.
4. Import kho mã vào Vercel. Build command mặc định là `npm run build`.

Không lưu dữ liệu lâu dài trên filesystem của Vercel. Manifest và biểu tượng PWA đã có; có thể bổ sung service worker/offline sync trong giai đoạn sau.

## Mô hình dữ liệu

`Canteen` là từng căng tin được quản lý. `DailyPlan` là kế hoạch của một căng tin trong một ngày. `HeadcountEntry` giữ quân số theo đơn vị + bữa + loại suất. `Menu`/`MenuItem` tham chiếu món. `DishVariant` và `DishIngredientNorm` giữ định mức riêng theo loại suất. Mỗi nguyên liệu có thể gắn nhà cung cấp để danh sách mua cộng chung nhu cầu của các căng tin đã chọn.
