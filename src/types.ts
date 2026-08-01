// ============================================================
// Lark (Feishu) Bot Webhook — type definitions
// https://open.feishu.cn/document/client-docs/bot-v3/add-custom-bot
// ============================================================

// ---- supported message types ----
export type MsgType = "text" | "post" | "interactive" | "share_chat" | "image";

// ---- text message ----
export interface TextContent {
  text: string;
}

// ---- post (rich-text) message ----
export type PostParagraph = PostTextElement[];

export interface PostTextElement {
  tag: "text";
  text: string;
  un_escape?: boolean;
}

export interface PostLinkElement {
  tag: "a";
  text: string;
  href: string;
}

export interface PostAtElement {
  tag: "at";
  user_id: string;
  user_name?: string;
}

export interface PostImageElement {
  tag: "img";
  image_key: string;
  width?: number;
  height?: number;
}

export type PostElement =
  | PostTextElement
  | PostLinkElement
  | PostAtElement
  | PostImageElement;

/** A single line inside a post paragraph */
export type PostLine = PostElement[];

/** A post paragraph contains one or more lines (element arrays) */
export type PostParagraphContent = PostLine[];

export interface PostContent {
  post: {
    zh_cn?: {
      title?: string;
      content: PostParagraphContent;
    };
    en_us?: {
      title?: string;
      content: PostParagraphContent;
    };
  };
}

// ---- interactive (card) message ----
export type CardTemplateColor =
  | "blue"
  | "wathet"
  | "turquoise"
  | "green"
  | "yellow"
  | "orange"
  | "red"
  | "carmine"
  | "violet"
  | "purple"
  | "indigo"
  | "grey";

export interface CardHeader {
  title: CardText;
  template?: CardTemplateColor;
}

export type CardText = string | { tag: "plain_text"; content: string } | { tag: "lark_md"; content: string };

export interface CardElementBase {
  tag: string;
}

export interface CardMarkdownElement extends CardElementBase {
  tag: "markdown";
  content: string;
}

export interface CardDivElement extends CardElementBase {
  tag: "div";
  text?: CardText;
  fields?: CardField[];
  extra?: CardElement;
}

export interface CardField {
  is_short: boolean;
  text: CardText;
}

export interface CardHrElement extends CardElementBase {
  tag: "hr";
}

export interface CardImageElement extends CardElementBase {
  tag: "img";
  img_key: string;
  alt?: CardText;
  title?: CardText;
  mode?: "fit_horizontal" | "crop_center";
}

export interface CardNoteElement extends CardElementBase {
  tag: "note";
  elements: CardElement[];
}

export interface CardActionElement extends CardElementBase {
  tag: "action";
  actions: CardAction[];
  layout?: "bisected" | "trisection" | "flow";
}

export interface CardAction {
  tag: "button";
  text: CardText;
  url?: string;
  multi_url?: { url: string; pc_url?: string; ios_url?: string; android_url?: string };
  type?: "default" | "primary" | "danger";
  value?: Record<string, unknown>;
}

export type CardElement =
  | CardMarkdownElement
  | CardDivElement
  | CardHrElement
  | CardImageElement
  | CardNoteElement
  | CardActionElement;

export interface CardConfig {
  wide_screen_mode?: boolean;
  enable_forward?: boolean;
}

export interface Card {
  header?: CardHeader;
  elements: CardElement[];
  config?: CardConfig;
}

export interface InteractiveContent {
  card: Card;
}

// ---- share_chat message ----
export interface ShareChatContent {
  share_chat_id: string;
}

// ---- image message ----
export interface ImageContent {
  image_key: string;
}

// ---- union message type ----
export type LarkMessage =
  | { msg_type: "text"; content: TextContent }
  | { msg_type: "post"; content: PostContent }
  | { msg_type: "interactive"; content: InteractiveContent }
  | { msg_type: "share_chat"; content: ShareChatContent }
  | { msg_type: "image"; content: ImageContent };

/** Message enriched with signature fields (added at request time) */
export type SignedLarkMessage = LarkMessage & {
  timestamp: string;
  sign: string;
};

// ---- API response ----
export interface LarkApiResponse {
  code: number;
  msg: string;
  data: Record<string, unknown>;
}

// ---- notifier config ----
export interface LarkNotifyConfig {
  /** Base URL, defaults to "https://open.feishu.cn" */
  baseUrl?: string;
  /**
   * Webhook token — the random string from your bot's webhook URL:
   * `https://open.feishu.cn/open-apis/bot/v2/hook/{token}`
   */
  token: string;
  /**
   * Optional signing key (from bot settings → Security → Sign verification).
   * When set, every request includes a timestamp + HMAC-SHA256 signature.
   */
  signKey?: string;
  /** Optional axios request config overrides (timeout, proxy, etc.) */
  axiosConfig?: import("axios").CreateAxiosDefaults;
}
