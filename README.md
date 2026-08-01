# lark-notify

> Lark (Feishu) custom bot notification SDK for Node.js — send text, rich-text, interactive cards, images, and share chats via webhooks.

[![npm version](https://img.shields.io/npm/v/lark-notify)](https://www.npmjs.com/package/lark-notify)
[![license MIT](https://img.shields.io/npm/l/lark-notify)](https://github.com/wangdongdong1194/lark-notify/blob/main/LICENSE)

- [Install](#install)
- [Quick start](#quick-start)
- [API](#api)
  - [Constructor](#constructor)
  - [sendText](#sendtext)
  - [sendPost](#sendpost)
  - [sendCard](#sendcard)
  - [sendImage](#sendimage)
  - [sendShareChat](#sendsharechat)
  - [send](#send)
- [Types](#types)
  - [LarkNotifyConfig](#larknotifyconfig)
  - [LarkApiResponse](#larkapiresponse)
  - [TextContent](#textcontent)
  - [PostContent](#postcontent)
  - [Card](#card)
  - [LarkMessage](#larkmessage)
  - [CardText](#cardtext)
- [Signing](#signing)
- [Development](#development)

---

## Install

```bash
npm install lark-notify
```

## Quick start

```ts
import { LarkNotifier } from "lark-notify";

const bot = new LarkNotifier({
  token: "your-webhook-token",
  // host / path are built in — you only need the token
});

await bot.sendText("Hello from lark-notify!");
```

With signature verification enabled:

```ts
const bot = new LarkNotifier({
  token: "your-webhook-token",
  signKey: "your-signing-key",
});
```

## Usage examples

### CI/CD deploy notification

```ts
import { LarkNotifier } from "lark-notify";

const bot = new LarkNotifier({ token: process.env.LARK_TOKEN! });

async function notifyDeploy(env: string, version: string, status: string) {
  const isSuccess = status === "success";

  await bot.sendCard({
    header: {
      title: { tag: "plain_text", content: isSuccess ? `✅ ${env} Deploy` : `❌ ${env} Deploy` },
      template: isSuccess ? "green" : "red",
    },
    elements: [
      {
        tag: "div",
        fields: [
          { is_short: true, text: { tag: "lark_md", content: `**Environment**\n${env}` } },
          { is_short: true, text: { tag: "lark_md", content: `**Version**\n${version}` } },
          { is_short: true, text: { tag: "lark_md", content: `**Status**\n${status}` } },
          { is_short: true, text: { tag: "lark_md", content: `**Pipeline**\n#${process.env.CI_PIPELINE_ID ?? "N/A"}` } },
        ],
      },
      {
        tag: "action",
        actions: [
          { tag: "button", text: { tag: "plain_text", content: "View Logs" }, url: "https://ci.example.com/logs", type: "primary" },
        ],
      },
    ],
  });
}

notifyDeploy("production", "v2.4.0", "success");
```

### Error alert

```ts
async function sendErrorAlert(service: string, error: Error) {
  await bot.sendCard({
    header: {
      title: { tag: "plain_text", content: "🚨 Error Alert" },
      template: "red",
    },
    elements: [
      { tag: "markdown", content: `**${service}** encountered an error:` },
      { tag: "hr" },
      { tag: "markdown", content: `\`\`\`\n${error.message}\n\`\`\`` },
      {
        tag: "note",
        elements: [{ tag: "plain_text", content: `⏱ ${new Date().toISOString()}` }],
      },
    ],
  });
}

try {
  // your business logic
} catch (err) {
  await sendErrorAlert("order-service", err as Error);
}
```

### Daily report

```ts
async function sendDailyReport(stats: { orders: number; revenue: number; newUsers: number }) {
  await bot.sendPost({
    post: {
      zh_cn: {
        title: `📊 Daily Report — ${new Date().toLocaleDateString("zh-CN")}`,
        content: [
          [
            { tag: "text", text: `📦 Orders: ${stats.orders}\n` },
            { tag: "text", text: `💰 Revenue: ¥${stats.revenue.toLocaleString()}\n` },
            { tag: "text", text: `👤 New Users: ${stats.newUsers}` },
          ],
        ],
      },
    },
  });
}

sendDailyReport({ orders: 1234, revenue: 56780, newUsers: 89 });
```

### Simple text push

```ts
// one-liner for quick notifications
await bot.sendText("Backup completed at " + new Date().toLocaleString());
```

## API

### Constructor

```ts
new LarkNotifier(config: LarkNotifyConfig)
```

#### `LarkNotifyConfig`

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `token` | `string` | ✅ | — | Webhook token from your bot's webhook URL. |
| `baseUrl` | `string` | — | `https://open.feishu.cn/open-apis/bot/v2/hook/` | Base URL prefix. The final webhook URL is `baseUrl + "/" + token`. |
| `signKey` | `string` | — | — | Signing key from **Bot settings → Security → Signature verification**. When set, every request is automatically signed. |
| `axiosConfig` | `AxiosRequestConfig` | — | `{ timeout: 10000 }` | Pass-through axios configuration (timeout, proxy, headers, etc.). |

> **Tip:** If you use a self-hosted Lark / proxy, override `baseUrl`:
> ```ts
> new LarkNotifier({ token: "xxx", baseUrl: "https://my-proxy.example.com/hooks" })
> ```

---

### `sendText`

Send a plain-text message.

```ts
await bot.sendText("Build succeeded ✅");
```

The message body sent to Lark:

```json
{
  "msg_type": "text",
  "content": { "text": "Build succeeded ✅" }
}
```

---

### `sendPost`

Send a rich-text message with formatted content. Supports text, links, @-mentions, and inline images.

```ts
await bot.sendPost({
  post: {
    zh_cn: {
      title: "📦 Release v2.4.0",
      content: [
        // paragraph 1
        [
          { tag: "text", text: "Changelog: " },
          { tag: "a", text: "View on GitHub", href: "https://github.com/user/repo/releases" },
        ],
        // paragraph 2
        [
          { tag: "text", text: "Pipeline triggered by " },
          { tag: "at", user_id: "ou_xxx", user_name: "Alice" },
        ],
      ],
    },
  },
});
```

#### `PostContent`

| Field | Type | Description |
|---|---|---|
| `post.zh_cn.title` | `string` | Optional title (Chinese locale). |
| `post.zh_cn.content` | `PostParagraphContent` | Array of paragraphs. |
| `post.en_us` | same shape | Optional English locale. |

Each paragraph (`PostParagraphContent`) is an array of lines. Each line (`PostLine`) is an array of elements.

#### Post elements

| Tag | Interface | Key fields |
|---|---|---|
| `text` | `PostTextElement` | `text`, `un_escape?` |
| `a` | `PostLinkElement` | `text`, `href` |
| `at` | `PostAtElement` | `user_id`, `user_name?` |
| `img` | `PostImageElement` | `image_key`, `width?`, `height?` |

---

### `sendCard`

Send an interactive card. Cards can have a colored header, markdown content, dividers, images, notes, and action buttons.

```ts
await bot.sendCard({
  header: {
    title: { tag: "plain_text", content: "🚨 CPU Alert" },
    template: "red",
  },
  elements: [
    { tag: "markdown", content: "CPU usage on **prod-01** has exceeded **90%** for 5 minutes." },
    { tag: "hr" },
    {
      tag: "div",
      fields: [
        { is_short: true, text: { tag: "lark_md", content: "**Instance**\nprod-01" } },
        { is_short: true, text: { tag: "lark_md", content: "**Region**\nus-east-1" } },
      ],
    },
    { tag: "note", elements: [{ tag: "plain_text", content: "Triggered by monitoring pipeline" }] },
    {
      tag: "action",
      layout: "flow",
      actions: [
        { tag: "button", text: { tag: "plain_text", content: "View Dashboard" }, url: "https://grafana.example.com", type: "primary" },
        { tag: "button", text: { tag: "plain_text", content: "Acknowledge" }, url: "https://alerts.example.com/ack", type: "default" },
      ],
    },
  ],
});
```

#### `Card`

| Field | Type | Description |
|---|---|---|
| `header` | `CardHeader` | Optional title bar with color. |
| `elements` | `CardElement[]` | Card body — one or more elements. |
| `config` | `CardConfig` | Optional `wide_screen_mode`, `enable_forward`. |

#### `CardHeader`

| Field | Type | Description |
|---|---|---|
| `title` | `CardText` | Header text. |
| `template` | `CardTemplateColor` | Header color: `blue`, `wathet`, `turquoise`, `green`, `yellow`, `orange`, `red`, `carmine`, `violet`, `purple`, `indigo`, `grey`. |

#### Card elements

| Tag | Interface | Key fields |
|---|---|---|
| `markdown` | `CardMarkdownElement` | `content` |
| `div` | `CardDivElement` | `text?`, `fields?`, `extra?` |
| `hr` | `CardHrElement` | *(none)* |
| `img` | `CardImageElement` | `img_key`, `alt?`, `title?`, `mode?` |
| `note` | `CardNoteElement` | `elements` (inline content) |
| `action` | `CardActionElement` | `actions`, `layout?` |

#### `CardAction`

| Field | Type | Description |
|---|---|---|
| `tag` | `"button"` | Always `"button"`. |
| `text` | `CardText` | Button label. |
| `url` | `string` | Link URL. |
| `multi_url` | `object` | Platform-specific URLs (`url`, `pc_url?`, `ios_url?`, `android_url?`). |
| `type` | `"default" \| "primary" \| "danger"` | Button style. |
| `value` | `Record<string, unknown>` | Custom payload (returned on click). |

---

### `sendImage`

Send an image by its `image_key` (uploaded via Lark's image upload API first).

```ts
await bot.sendImage("img_ecffc3b5-xxxx-xxxx-xxxx-xxxxxxxxxxxx");
```

---

### `sendShareChat`

Share a chat group by its ID.

```ts
await bot.sendShareChat("oc_xxxxxxxxxxxxxx");
```

---

### `send`

Send an arbitrary `LarkMessage` for advanced use cases.

```ts
await bot.send({
  msg_type: "text",
  content: { text: "Raw message" },
});
```

---

## Types

All types are exported so you can use them in your own code:

```ts
import type {
  LarkNotifyConfig,
  LarkMessage,
  LarkApiResponse,
  TextContent,
  PostContent,
  PostTextElement,
  PostLinkElement,
  PostAtElement,
  PostImageElement,
  Card,
  CardHeader,
  CardElement,
  CardAction,
  CardField,
  CardText,
  CardTemplateColor,
  CardConfig,
  ImageContent,
  ShareChatContent,
  SignedLarkMessage,
  MsgType,
} from "lark-notify";
```

### `LarkMessage`

The discriminated union for all message types:

```ts
type LarkMessage =
  | { msg_type: "text";        content: TextContent }
  | { msg_type: "post";        content: PostContent }
  | { msg_type: "interactive"; card: Card }
  | { msg_type: "image";       content: ImageContent }
  | { msg_type: "share_chat";  content: ShareChatContent };
```

### `CardText`

Many card fields accept `CardText`, which is a union of three forms:

```ts
type CardText =
  | string                                    // shorthand, treated as plain_text
  | { tag: "plain_text"; content: string }    // explicit plain text
  | { tag: "lark_md";     content: string };  // markdown (Lark flavor)
```

### `LarkApiResponse`

Every send method returns this:

```ts
interface LarkApiResponse {
  code: number;                        // 0 = success
  msg: string;                         // human-readable message
  data: Record<string, unknown>;       // response payload
}
```

---

## Signing

When the bot has **signature verification** enabled in Lark admin, you must provide `signKey`. The notifier automatically injects `timestamp` and `sign` into every request.

```
key        = timestamp + "\n" + signKey
sign       = Base64( HmacSHA256(key=key, data=empty_bytes) )
```

| Condition | Behavior |
|---|---|
| `signKey` provided | `timestamp` + `sign` injected into request body |
| `signKey` omitted | No signing fields added |

Error `19021` means the signature or timestamp is invalid — double-check your `signKey` and system clock.

---

## Development

```bash
npm install       # install dependencies
npm run dev       # run with tsx (set LARK_TOKEN + LARK_SIGN_KEY env vars)
npm run build     # compile TypeScript → dist/
```

### Test locally

```bash
LARK_TOKEN="your-token" LARK_SIGN_KEY="your-key" npm run dev
```

---

## License

[MIT](https://github.com/wangdongdong1194/lark-notify/blob/main/LICENSE)
