# AI Tattoo Font Generator - MVP

## 项目愿景与定位

**目标：** 开发一个极简的 AI 纹身文字生成工具，跑通"流量 -> 生成 -> 支付 -> 交付"的全闭环。

**核心功能：** 用户输入名字/文字 → 选择艺术风格 → AI 生成纹身预览 → PayPal 支付 → 获取高清/透明底线稿。

## 系统架构与数据流

为确保"零成本存储"和"快速部署"，采用以下架构：

1. **用户输入层：** 用户在 Web 端输入 Text 并选择 Style。
2. **API 中转层 (Next.js API Route)：**
   - 后端接收请求，注入 FAL_AI_KEY
   - 将用户输入套入预设好的 Tattoo Prompt 模板
3. **AI 生成层 (Fal.ai / Flux.1 [dev])：**
   - 外部 API 接收 Prompt，生成图片
   - 返回一个临时 CDN URL（有效期通常为 1 小时）
4. **展示层：** 前端直接使用该 URL 显示预览图（服务器不存储图片文件）
5. **支付与交付闭环：**
   - 用户通过 PayPal 支付
   - 支付成功回调后，后端抓取该 URL 图片并调用 Remove.bg API 抠图
   - 将生成的透明 PNG 以 Blob/Base64 格式直接推送到浏览器触发下载

## 技术栈清单

- **前端框架：** Next.js 14+ (App Router)
- **样式库：** Tailwind CSS (推荐暗黑/纹身店风格)
- **生图接口：** Fal.ai (模型：fal-ai/flux/dev)
- **部署平台：** Vercel (Hobby Plan)
- **支付集成：** PayPal JavaScript SDK
- **抠图辅助：** Remove.bg API (可选，增加付费价值)

## 关键代码逻辑

### A. 黄金提示词 (Prompt Engineering)

```typescript
const tattooPrompt = `A high-contrast professional tattoo design of the word "${userInput}", 
${selectedStyle} typography, bold black ink on a pure white background, 
clean vector lines, no shading, minimal aesthetic, 8k resolution.`;
```

### B. 无存储 API 转发示例

```typescript
// 后端 /api/generate 逻辑核心
const response = await fetch("https://queue.fal.run/fal-ai/flux/dev", {
  method: "POST",
  headers: { 
    "Authorization": `Key ${process.env.FAL_KEY}`, 
    "Content-Type": "application/json" 
  },
  body: JSON.stringify({ prompt: tattooPrompt })
});
const data = await response.json();
return Response.json({ imageUrl: data.images[0].url }); // 仅返回 URL
```

## 环境变量配置

在 Vercel 部署时必须填写的 Key：

- `FAL_KEY`: 从 fal.ai 获取
- `NEXT_PUBLIC_PAYPAL_CLIENT_ID`: 从 PayPal Developer 获取
- `REMOVE_BG_KEY`: 从 remove.bg 获取

## MVP 验证路径

1. **代码生成：** 将此文档发给 Claude，生成 layout.tsx, page.tsx 和 api/generate/route.ts
2. **GitHub 托管：** 创建私有仓库，手动上传 Claude 写的代码
3. **Vercel 部署：** 关联仓库，配置环境变量，点击 Deploy
4. **支付测试：** 使用 PayPal Sandbox 账号进行一笔 $4.9 的模拟支付
5. **上线：** 确认图片能出来、钱能付通，即算 MVP 大功告成
