# lark-notify

> Lark (Feishu) bot notification SDK — send text, rich-text, cards, and images via custom bot webhooks.

## Install

```bash
npm install lark-notify
```

## Quick start

```ts
import { LarkNotifier } from "lark-notify";

const bot = new LarkNotifier({
  token: "your-webhook-token",
  signKey: "your-signing-key", // optional — enables HMAC-SHA256 signing
});

await bot.sendText("Deploy finished ✅");
```

### Message types

```ts
// plain text
await bot.sendText("Hello!");

// rich text (post)
await bot.sendPost({
  post: {
    zh_cn: {
      title: "Release Notes",
      content: [
        [
          { tag: "text", text: "v2.3.1 " },
          { tag: "a", text: "changelog", href: "https://example.com" },
        ],
      ],
    },
  },
});

// interactive card
await bot.sendCard({
  header: { title: { tag: "plain_text", content: "Alert" }, template: "red" },
  elements: [
    { tag: "markdown", content: "CPU usage exceeds **90%**" },
    {
      tag: "action",
      actions: [
        { tag: "button", text: { tag: "plain_text", content: "Details" }, url: "https://example.com", type: "primary" },
      ],
    },
  ],
});

// image
await bot.sendImage("img_xxx");

// share a chat
await bot.sendShareChat("oc_xxx");
```

## API

### `new LarkNotifier(config)`

| Option | Type | Required | Default | Description |
|---|---|---|---|---|
| `token` | `string` | ✅ | — | Webhook token from the bot's webhook URL |
| `baseUrl` | `string` | — | `https://open.feishu.cn/open-apis/bot/v2/hook/` | Webhook base URL |
| `signKey` | `string` | — | — | Signing key from bot settings → Security. When set, every request is signed with HMAC-SHA256. |
| `axiosConfig` | `AxiosRequestConfig` | — | — | Pass-through axios options (timeout, proxy, etc.) |

The final webhook URL is constructed as `${baseUrl}/${token}`.

### Methods

All methods return `Promise<LarkApiResponse>`.

| Method | Message type |
|---|---|
| `sendText(text)` | Plain text |
| `sendPost(content)` | Rich text (formatted post) |
| `sendCard(card)` | Interactive card |
| `sendImage(imageKey)` | Image |
| `sendShareChat(id)` | Share a chat |
| `send(message)` | Raw `LarkMessage` |

## Types

The package exports full TypeScript type definitions:

```ts
import type {
  LarkNotifyConfig,
  LarkMessage,
  LarkApiResponse,
  Card,
  CardHeader,
  CardElement,
  CardAction,
  PostContent,
  // … and more
} from "lark-notify";
```

## Signing

When `signKey` is configured, `timestamp` and `sign` are automatically injected:

```
timestamp  = current Unix seconds
key        = `${timestamp}\n${signKey}`
sign       = Base64(HmacSHA256(key=key, data=""))
```

No manual signing needed — the notifier handles it internally.

## Development

```bash
npm install
npm run dev     # tsx src/index.ts
npm run build   # tsc → dist/
```

## License

MIT
