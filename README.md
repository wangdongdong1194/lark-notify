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

// plain text
await bot.sendText("Deploy finished ✅");

// rich text (post)
await bot.sendPost({
  post: {
    zh_cn: {
      title: "Release Notes",
      content: [[[{ tag: "text", text: "v2.3.1 has been released." }]]],
    },
  },
});

// interactive card
await bot.sendCard({
  header: { title: { tag: "plain_text", content: "Alert" }, template: "red" },
  elements: [{ tag: "markdown", content: "CPU usage exceeds **90%**" }],
});
```

## API

### `new LarkNotifier(config)`

| Option | Type | Required | Description |
|---|---|---|---|
| `token` | `string` | ✅ | Webhook token — the ID from `…/bot/v2/hook/{token}` |
| `baseUrl` | `string` | — | Base URL, defaults to `https://open.feishu.cn` |
| `signKey` | `string` | — | Signing key from bot settings → Security — enables HMAC-SHA256 |
| `axiosConfig` | `AxiosRequestConfig` | — | Pass-through axios options (timeout, proxy, etc.) |

### Methods

| Method | Description |
|---|---|
| `sendText(text)` | Plain text message |
| `sendPost(content)` | Rich-text (formatted) message |
| `sendCard(card)` | Interactive card message |
| `sendImage(imageKey)` | Image message |
| `sendShareChat(id)` | Share a chat |
| `send(message)` | Send a raw `LarkMessage` (for advanced use) |

All methods return `Promise<LarkApiResponse>`.

### Exported utilities

```ts
import { generateSign } from "lark-notify";
const { timestamp, sign } = generateSign("your-sign-key");
// Use timestamp + sign for manual HTTP calls
```

## Signing

When `signKey` is configured, the notifier automatically injects `timestamp` and `sign` into every request body:

```
timestamp    = current Unix seconds
stringToSign = `${timestamp}\n${signKey}`
sign         = Base64(HMAC-SHA256(key=signKey, message=stringToSign))
```

## Development

```bash
npm install
npm run dev     # tsx src/index.ts
npm run build   # tsc → dist/
npm start       # node dist/index.js
```

## License

MIT
