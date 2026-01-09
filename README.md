![](/public/og-image.png)

English | [简体中文](README.zh-CN.md) | [日本語](README.ja-JP.md)

> [!NOTE]
> This is a demo version currently supporting Chinese only. A full-featured version with better customization and English content support will be released later.

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
