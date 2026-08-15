![](/public/og-image.png)

English | [简体中文](README.zh-CN.md) | [日本語](README.ja-JP.md)

> [!NOTE]
> This is a demo version currently supporting Chinese only. A full-featured version with better customization and English content support will be released later.

## Hướng dẫn chạy bản giao diện tiếng Việt

Phần giao diện tiếng Việt đã được triển khai trong các component React, metadata danh mục, thông báo hệ thống, định dạng thời gian và metadata HTML. Các tiêu đề bài viết vẫn do từng nguồn tin cung cấp, vì vậy ngôn ngữ nội dung có thể khác nhau tùy nguồn.

### Yêu cầu môi trường

Dự án yêu cầu **Node.js 20 trở lên** và **pnpm 10**. Có thể bật Corepack để pnpm được quản lý theo dự án:

```sh
corepack enable
corepack prepare pnpm@10.14.0 --activate
```

### Cài đặt và chạy development

```sh
git clone https://github.com/Duongcmd/newsnow.git
cd newsnow
pnpm install --frozen-lockfile
cp example.env.server .env.server
pnpm dev
```

Sau khi Vite khởi động, mở URL được in trong terminal, thường là `http://localhost:5173`. Lệnh `pnpm dev` tự động chạy bước `presource` trước để tạo lại các tệp nguồn sinh như `shared/sources.json` và `shared/pinyin.json`.

Nếu chỉ chạy bản đọc tin không cần đăng nhập GitHub, có thể giữ các giá trị xác thực trống trong `.env.server`. Khi cần đồng bộ tài khoản, hãy cấu hình `G_CLIENT_SECRET` và `JWT_SECRET` theo thiết lập GitHub OAuth của môi trường triển khai. `INIT_TABLE=true` chỉ nên dùng trong lần khởi tạo cơ sở dữ liệu đầu tiên; sau đó có thể chuyển thành `false`.

### Build và chạy production local

```sh
pnpm build
pnpm start
```

Bản build frontend được tạo ở `dist/output/public`; server production được tạo ở `dist/output/server/index.mjs`. Có thể dùng `pnpm preview` để chạy mô phỏng Cloudflare Pages, nhưng lệnh này cần Wrangler và cấu hình Pages phù hợp.

### Kiểm tra chất lượng mã nguồn

```sh
pnpm lint
pnpm typecheck
pnpm test
```

`pnpm typecheck` chạy riêng hai cấu hình `tsconfig.node.json` cho server/shared/generated types và `tsconfig.app.json` cho frontend. Ở trạng thái hiện tại, build production đã thành công; typecheck còn một lỗi server trong `server/sources/nowcoder.ts` và một lỗi frontend độc lập trong `src/components/common/toast.tsx`. Chi tiết nguyên nhân và cách sửa được ghi ở mục [TypeScript diagnostics](#typescript-diagnostics).

### Commit và push thay đổi lên GitHub

Trước khi commit, kiểm tra đúng các tệp thay đổi:

```sh
git status
git diff --check
git diff --stat
git diff
```

Tạo commit cho bản Việt hóa:

```sh
git add index.html shared/metadata.ts shared/utils.ts src/components
git add src/hooks/usePWA.ts src/hooks/useRefetch.ts src/hooks/useSync.ts README.md
git commit -m "feat: localize NewsNow UI to Vietnamese"
```

Nếu nhánh local đang theo dõi `origin/main`, push bằng:

```sh
git push origin main
```

Khuyến nghị an toàn hơn là tạo nhánh riêng và mở Pull Request:

```sh
git switch -c feat/vietnamese-ui
git push -u origin feat/vietnamese-ui
```

Không dùng `git push --force` trên `main` trừ khi đã xác nhận rõ với người quản lý repository. Nếu GitHub yêu cầu xác thực, hãy dùng SSH remote hoặc GitHub CLI (`gh auth login`) trước khi push.

## TypeScript diagnostics

### Lỗi server: `server/sources/nowcoder.ts:12`

`defineSource` yêu cầu callback trả về `Promise<NewsItem[]>`. Trong callback hiện tại, `let url, id` khiến TypeScript suy luận cả hai biến có thể là `undefined`; vì vậy object trả về có kiểu `id: string | undefined` và `url: string | undefined`, không đáp ứng `NewsItem`, trong đó `id` và `url` đều bắt buộc.

Lỗi này xuất hiện ở nhánh `tsconfig.node.json`, không nằm trong các tệp Việt hóa và không phải lỗi do thiếu declaration của Nitro. Có thể sửa bằng cách lọc các loại không được hỗ trợ hoặc khởi tạo kết quả với kiểu rõ ràng. Ví dụ an toàn hơn:

```ts
return res.data.result.flatMap((item) => {
  if (item.type === 74) {
    return [{
      id: item.uuid,
      title: item.title,
      url: `https://www.nowcoder.com/feed/main/detail/${item.uuid}`,
    }]
  }
  if (item.type === 0) {
    return [{
      id: item.id,
      title: item.title,
      url: `https://www.nowcoder.com/discuss/${item.id}`,
    }]
  }
  return []
})
```

Cách này loại bỏ các phần tử không có URL/ID thay vì phát sinh `undefined`, đồng thời giữ đúng hợp đồng `NewsItem[]`.

### Lỗi frontend: `src/components/common/toast.tsx:48`

`useRef<Timer>()` bị TypeScript báo `TS2554: Expected 1 arguments, but got 0` do phiên bản React type hiện tại yêu cầu đối số khởi tạo cho overload này. Đây là lỗi frontend độc lập, không thuộc server/generated types. Sửa tối thiểu:

```ts
const timer = useRef<Timer | undefined>(undefined)
```

### Vai trò của generated types

`tsconfig.node.json` bao gồm `dist/.nitro/types`, vì vậy các declaration được Nitro sinh sau bước build được nạp vào quá trình kiểm tra server. Build hiện tạo được các global như `defineSource`, `myFetch` và `delay`; do đó lỗi `nowcoder.ts` là lỗi tương thích dữ liệu trả về với `NewsItem`, không phải lỗi generated types bị thiếu. Khi chẩn đoán, chạy riêng từng cấu hình để tránh lỗi ở bước đầu che khuất lỗi ở bước sau:

```sh
pnpm exec tsc --noEmit -p tsconfig.node.json
pnpm exec tsc --noEmit -p tsconfig.app.json
```

### Trạng thái xác nhận

`pnpm build` đã hoàn tất thành công. `git diff --check` không phát hiện whitespace error. `pnpm typecheck` chưa đạt hoàn toàn cho đến khi xử lý hai lỗi nêu trên; bản Việt hóa không làm thay đổi `server/sources/nowcoder.ts`.

**_Elegant reading of real-time and hottest news_**

## Features

- Clean and elegant UI design for optimal reading experience
- Real-time updates on trending news
- GitHub OAuth login with data synchronization
- 30-minute default cache duration (logged-in users can force refresh)
- Adaptive scraping interval (minimum 2 minutes) based on source update frequency to optimize resource usage and prevent IP bans
- support MCP server

```json
{
  "mcpServers": {
    "newsnow": {
      "command": "npx",
      "args": [
        "-y",
        "newsnow-mcp-server"
      ],
      "env": {
        "BASE_URL": "https://newsnow.busiyi.world"
      }
    }
  }
}
```
You can change the `BASE_URL` to your own domain.

## Deployment

### Basic Deployment

For deployments without login and caching:

1. Fork this repository
2. Import to platforms like Cloudflare Page or Vercel

### Cloudflare Page Configuration

- Build command: `pnpm run build`
- Output directory: `dist/output/public`

### GitHub OAuth Setup

1. [Create a GitHub App](https://github.com/settings/applications/new)
2. No special permissions required
3. Set callback URL to: `https://your-domain.com/api/oauth/github` (replace `your-domain` with your actual domain)
4. Obtain Client ID and Client Secret

### Environment Variables

Refer to `example.env.server`. For local development, rename it to `.env.server` and configure:

```env
# Github Client ID
G_CLIENT_ID=
# Github Client Secret
G_CLIENT_SECRET=
# JWT Secret, usually the same as Client Secret
JWT_SECRET=
# Initialize database, must be set to true on first run, can be turned off afterward
INIT_TABLE=true
# Whether to enable cache
ENABLE_CACHE=true
```

### Database Support

Supported database connectors: https://db0.unjs.io/connectors
**Cloudflare D1 Database** is recommended.

1. Create D1 database in Cloudflare Worker dashboard
2. Configure database_id and database_name in wrangler.toml
3. If wrangler.toml doesn't exist, rename example.wrangler.toml and modify configurations
4. Changes will take effect on next deployment

### Docker Deployment

In project root directory:

```sh
docker compose up
```

You can also set Environment Variables in `docker-compose.yml`.

## Development

> [!Note]
> Requires Node.js >= 20

```sh
corepack enable
pnpm i
pnpm dev
```

### Adding Data Sources

Refer to `shared/sources` and `server/sources` directories. The project provides complete type definitions and a clean architecture.

For detailed instructions on how to add new sources, see [CONTRIBUTING.md](CONTRIBUTING.md).

## Roadmap

- Add **multi-language support** (English, Chinese, more to come).
- Improve **personalization options** (category-based news, saved preferences).
- Expand **data sources** to cover global news in multiple languages.

**_release when ready_**
![](https://testmnbbs.oss-cn-zhangjiakou.aliyuncs.com/pic/20250328172146_rec_.gif?x-oss-process=base_webp)

## Contributing

Contributions are welcome! Feel free to submit pull requests or create issues for feature requests and bug reports.

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines on how to contribute, especially for adding new data sources.
# 🎯 Hướng Dẫn Cập Nhật Nguồn Tin và Chuyên Mục trong NewsNow
https://newsnow-ixevfvfys-duongcmds-projects.vercel.app

## 📁 **File Cấu Hình Chính**

Nguồn tin và chuyên mục được cấu hình trong file: **`shared/sources.json`**

**Link trực tiếp**: https://github.com/Duongcmd/newsnow/blob/main/shared/sources.json

***

## 🔧 **Cấu Trúc File sources.json**

Mỗi nguồn tin được định nghĩa bằng một object JSON với cấu trúc như sau:

```json
{
  "nguon-tin-key": {
    "name": "Tên Hiển Thị",        // Tên hiển thị trên UI
    "type": "hottest|realtime",   // Loại: hottest (bản tin hot) hoặc realtime (thời gian thực)
    "column": "tech|finance|china|world", // Chuyên mục (column)
    "home": "https://...",        // URL trang chủ nguồn tin
    "color": "red|blue|green|...", // Màu sắc hiển thị
    "interval": 600000,           // Thời gian cập nhật (ms)
    "title": "Tên nhóm",          // Tên nhóm hiển thị (optional)
    "desc": "Mô tả",              // Mô tả nguồn (optional)
    "redirect": "key-khác",       // Chuyển hướng tới nguồn khác (optional)
    "disable": "cf"               // Vô hiệu hóa trên nền tảng (optional)
  }
}
```

***

## 📝 **Các Thuộc Tính Chi Tiết**

| Thuộc Tính | Mô Tả | Ví Dụ |
|---|---|---|
| `name` | Tên hiển thị của nguồn | "V2EX", "知乎" |
| `type` | "hottest" = top trending, "realtime" = tin mới nhất | "hottest" |
| `column` | Chuyên mục phân loại | "tech", "finance", "china", "world" |
| `home` | URL trang chủ | "https://v2ex.com/" |
| `color` | Màu badge: red, blue, green, slate, orange, gray, teal, emerald, indigo | "blue" |
| `interval` | Khoảng thời gian cập nhật (ms): 120000=2 phút, 600000=10 phút | 600000 |
| `title` | Tên nhóm tin (hiển thị khi có nhiều nguồn từ cùng platform) | "最新分享" |
| `redirect` | Chuyển hướng tới key khác (dùng cho alias) | "v2ex-share" |
| `desc` | Mô tả thêm về nguồn | "Từ trang thứ ba" |
| `disable` | Vô hiệu hóa trên nền tảng: "cf" = Cloudflare | "cf" |

***

## 🎨 **Các Chuyên Mục (Columns) Có Sẵn**

- **tech** - Công nghệ
- **finance** - Tài chính/Chứng khoán
- **china** - Tin trong nước
- **world** - Tin quốc tế

***

## 📊 **Các Màu Sắc Có Sẵn**

`red` | `blue` | `green` | `slate` | `orange` | `gray` | `teal` | `emerald` | `indigo`

***

## ➕ **Cách Thêm Nguồn Tin Mới**

### **Bước 1: Chỉnh Sửa File**
1. Vào GitHub: https://github.com/Duongcmd/newsnow/blob/main/shared/sources.json
2. Click nút **"Edit this file"** (hoặc biểu tượng bút chì)

### **Bước 2: Thêm Mã Nguồn**

Thêm entry mới vào object chính trước dấu `}` cuối cùng:

```json
{
  "technewsgateway": {
    "name": "Tech News Gateway",
    "type": "realtime",
    "column": "tech",
    "home": "https://technewsgateway.com/",
    "color": "blue",
    "interval": 600000,
    "title": "Latest"
  }
}
```

### **Bước 3: Lưu Thay Đổi**
1. Scroll xuống dưới
2. Nhập commit message: "Add new news source: Tech News Gateway"
3. Chọn "Commit changes"

### **Bước 4: Deploy Tự Động**
- Vercel sẽ tự động phát hiện thay đổi
- Deployment diễn ra trong vài phút
- Ứng dụng cập nhật ngay lập tức

***

## 🔄 **Cách Chỉnh Sửa Nguồn Tin Hiện Có**

### **Ví dụ: Thay Đổi Khoảng Cập Nhật V2EX**

Từ:
```json
"interval": 600000  // 10 phút
```

Thành:
```json
"interval": 300000  // 5 phút
```

***

## 🏷️ **Cách Tạo Alias (Múi Tên) Cho Cùng Một Nguồn**

```json
{
  "36kr": {
    "redirect": "36kr-quick",  // Chỉ định alias chính
    "name": "36氪",
    "type": "realtime",
    "column": "tech",
    "home": "https://36kr.com",
    "color": "blue",
    "interval": 600000,
    "title": "快讯"
  },
  "36kr-quick": {
    "name": "36氪",  // Cùng content nhưng tên khác
    "type": "realtime",
    "column": "tech",
    "home": "https://36kr.com",
    "color": "blue",
    "interval": 600000,
    "title": "快讯"
  },
  "36kr-renqi": {
    "name": "36氪",  // Alias thứ 3
    "type": "hottest",
    "column": "tech",
    "home": "https://36kr.com",
    "color": "blue",
    "interval": 600000,
    "title": "人气榜"
  }
}
```

***

## 🔍 **Các Nguồn Tin Hiện Có (Ví dụ)**

| Nguồn | Key | Chuyên Mục | Loại |
|---|---|---|---|
| V2EX | v2ex | Tech | Latest |
| Weibo | weibo | China | Hottest |
| Zhihu | zhihu | China | Hottest |
| GitHub Trending | github | Tech | Hottest |
| Hacker News | hackernews | Tech | Hottest |
| Product Hunt | producthunt | Tech | Hottest |
| 36氪 | 36kr | Tech | Realtime |
| 腾讯新闻 | tencent | China | Hottest |
| 财联社 | cls | Finance | Realtime |
| 华尔街见闻 | wallstreetcn | Finance | Realtime |
| Bilibili | bilibili | China | Hottest |
| Steam | steam | World | Hottest |

*...và hơn 80 nguồn khác!*

***

## 💡 **Lưu Ý Quan Trọng**

1. **Format JSON**: Đảm bảo định dạng JSON hợp lệ (dấu phẩy, ngoặc)
2. **Key duy nhất**: Mỗi `key` phải là duy nhất trong file
3. **Thời gian cập nhật**: Dưới 120000ms có thể gây quá tải
4. **Column hợp lệ**: Chỉ sử dụng: `tech`, `finance`, `china`, `world`
5. **Màu hợp lệ**: Sử dụng các màu được danh sách

***

## 🚀 **Quy Trình Cập Nhật Hoàn Chỉnh**

```
1. Sửa sources.json trên GitHub
   ↓
2. Commit + Push
   ↓
3. Vercel detect thay đổi
   ↓
4. Build tự động (2-3 phút)
   ↓
5. Deploy lên production
   ↓
6. Ứng dụng cập nhật ngay lập tức
```

***

## 📚 **Các File Liên Quan Khác**

- **shared/sources.ts**: Logic xử lý các nguồn tin
- **shared/consts.ts**: Các hằng số và cấu hình chung
- **shared/metadata.ts**: Metadata của các nguồn tin

Các file này tự động tương tác với `sources.json`, bạn chỉ cần sửa JSON là được!

## License

[MIT](./LICENSE) © ourongxing
