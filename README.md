# AI Chat App

基于 Vue 3 + Ant Design Vue 4 的 AI 聊天应用。

## 技术栈

- Vue 3 (Composition API)
- Vue Router 4
- Ant Design Vue 4
- Axios
- Vite

## 功能特点

- 🤖 AI 智能对话
- 💬 多会话管理
- 📝 聊天历史记录
- 🎨 美观的 UI 界面
- ⌨️ 支持 Enter 快捷发送

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

## API 接口配置

在 `src/api/chat.js` 中修改 `BASE_URL` 为你的实际 API 地址：

```javascript
const BASE_URL = '/api'  // 修改为你的 API 地址
```

### 接口格式

**发送消息接口：** `POST /api/chat`

请求参数：
```json
{
  "message": "用户消息",
  "history": [
    { "role": "user", "content": "历史消息1" },
    { "role": "assistant", "content": "历史回复1" }
  ]
}
```

响应格式：
```json
{
  "content": "AI 回复内容"
}
```

## 项目结构

```
ai-chat-app/
├── src/
│   ├── api/
│   │   └── chat.js          # API 接口封装
│   ├── components/
│   │   └── ChatMessage.vue  # 聊天消息组件
│   ├── views/
│   │   ├── Home.vue         # 首页
│   │   └── Chat.vue         # 聊天页面
│   ├── router/
│   │   └── index.js         # 路由配置
│   ├── App.vue              # 根组件
│   └── main.js              # 入口文件
├── index.html
├── package.json
└── vite.config.js
```

## License

MIT

