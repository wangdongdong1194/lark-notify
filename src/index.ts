// Public API
export { LarkNotifier } from "./lark";

// Types
export type {
  // Config
  LarkNotifyConfig,

  // Message type enum
  MsgType,

  // Message bodies
  LarkMessage,
  TextContent,
  PostContent,
  InteractiveContent,
  ImageContent,
  ShareChatContent,

  // Post (rich text) elements
  PostParagraph,
  PostElement,
  PostLine,
  PostParagraphContent,
  PostTextElement,
  PostLinkElement,
  PostAtElement,
  PostImageElement,

  // Interactive card
  Card,
  CardHeader,
  CardConfig,
  CardElement,
  CardMarkdownElement,
  CardDivElement,
  CardHrElement,
  CardImageElement,
  CardNoteElement,
  CardActionElement,
  CardAction,
  CardField,
  CardText,
  CardTemplateColor,

  // Response
  LarkApiResponse,
  SignedLarkMessage,
} from "./types";

// ---------- quick demo (only runs when executed directly) ----------
if (require.main === module) {
  const { LARK_TOKEN, LARK_SIGN_KEY } = process.env;

  if (!LARK_TOKEN) {
    console.error(
      "Set LARK_TOKEN env to test, e.g.:\n" +
        '  LARK_TOKEN="your-webhook-token" npx tsx src/index.ts\n' +
        "Optionally set LARK_SIGN_KEY for signature verification."
    );
    process.exit(1);
  }

  import("./lark").then(({ LarkNotifier }) => {
    const bot = new LarkNotifier({
      token: LARK_TOKEN,
      signKey: LARK_SIGN_KEY || undefined,
    });

    bot
      .sendText("👋 Hello from lark-notify!")
      .then((res) => console.log("✅ Sent:", res))
      .catch((err) => console.error("❌ Failed:", err.message));
  });
}
