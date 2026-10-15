# Ago Personal OS

个人工作台：今日行动、任务、目标路线、日程、项目与复盘。默认深色界面；路线采用一个阶段一项任务目标，可直接编辑状态、进度和起止日期。

本仓库导入自现有 ChatGPT Sites 项目，不是重新创建的应用。导入来源提交：`2c30d86a8f1ad680736c741417a098bfdc8354c0`。

## 技术栈

- 前端：原生 HTML、CSS、JavaScript ES Modules。
- 服务端：Cloudflare Worker，提供浏览器资源与 `/api/workspace`。
- 数据：生产环境使用 D1；本地使用 Node.js 内置 SQLite。
- 数据库定义与迁移：Drizzle ORM / Drizzle Kit。
- 构建与测试：Node.js 脚本、`node:test`；依赖锁文件为 `pnpm-lock.yaml`。

## 本地运行

需要 Node.js 24 和 pnpm 9 或更新版本。项目依赖 Node.js 内置的 `node:sqlite`。

```sh
git clone https://github.com/AGO111111111/Ago-vibe-coding.git
cd Ago-vibe-coding
pnpm install --frozen-lockfile
pnpm run build
pnpm run dev
```

打开 <http://localhost:4174>。本地服务只监听 `127.0.0.1`，为开发请求注入固定本地用户身份，并在 `.local/dev.sqlite` 保存本地数据。启动时自动应用 `drizzle/` 下尚未应用的 SQL 迁移。首次启动的 SQLite 实验性功能提示属于 Node.js 的提示。

修改 `web/` 或 `server/` 后，需要重新运行 `pnpm run build` 并重启开发服务；当前没有自动热更新。

```sh
pnpm test
pnpm run db:generate
```

`db:generate` 用于修改数据库定义后生成迁移，普通启动不需要执行。

## 目录

| 目录或文件 | 用途 |
| --- | --- |
| `web/index.html` | 应用窗口、导航与页面容器 |
| `web/app.js` | 页面渲染、交互、执行记录、云端读写 |
| `web/model.js` | 数据模型、阶段进度、任务安排、专注计时 |
| `web/migrate.js` | 旧记录转换和历史默认内容迁移 |
| `web/legacy-seed.js` | 历史 Java 示例，保留供迁移使用；当前学习主线为 Python |
| `web/style.css`、`web/apple.css` | 基础样式与当前深色界面 |
| `server/worker.js` | Worker API、账户数据隔离、静态资源响应 |
| `scripts/` | 构建、本地开发服务、SQLite 适配 |
| `db/schema.ts`、`drizzle/` | 数据库定义和 SQL 迁移 |
| `tests/` | 数据、迁移、页面与交互测试 |
| `.openai/hosting.json` | 原 Sites 项目的托管标识及 D1 绑定声明 |
| `docs/UX-REFERENCES.md` | 历史界面参考记录 |

`dist/server/index.js` 是构建生成的 Worker，包含浏览器资源；执行构建即可生成，因此不纳入本次源码导入。依赖目录、开发数据库和凭据不应提交。

## 现有网站与生产部署

现有网站：<https://ago-personal-os.riverasmccalla.chatgpt.site/>

Sites 项目 ID：`appgprj_6ac2908706a48191adbd327264291b96`。

将源码提交到 GitHub 不会自动部署现有网站，也不会迁移生产数据库。本地开发数据与线上数据独立。线上任务、进度和执行记录保存在 D1 中，不包含在本仓库；源码中的示例和历史预设内容仍按原实现保留。

当前生产 API 依赖 Sites 注入的 `oai-authenticated-user-id` 和名为 `DB` 的 D1 绑定。移到其他托管平台时，需要配置数据库与受信任的身份验证；不能把客户端自行发送的同名请求头当作生产登录方案。

## 在新对话或 Codex 中继续开发

提供本仓库链接，让开发助手先读取 `README.md`、`web/app.js`、`web/model.js`、`web/migrate.js` 与 `server/worker.js`。使用 GitHub 源码作为继续开发的起点，保留已有数据迁移逻辑。

项目的主要约定：

- 首页是行动入口，突出当前可执行任务。
- 路线保持简单：一个阶段一项任务目标；状态、百分比和日期直接编辑。
- 学习以 Python 为主，先独立尝试，卡住时逐级获取提示。
- 完成记录与独立掌握程度分别判断，不把进度 100% 当作已经掌握。
- 默认深色、Apple 风格；不为了扩充功能增加使用步骤。
- 不清空现有任务、执行记录和云端数据；发布前运行适当检查。

本次迁移只导出源码和补充说明，没有改动应用功能、界面或生产数据。迁移时已有 29 项自动检查通过；浏览器实机视觉验收尚未完成。
