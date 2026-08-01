import axios, { AxiosInstance } from "axios";
import { createHmac } from "node:crypto";
import type {
  LarkNotifyConfig,
  LarkMessage,
  SignedLarkMessage,
  LarkApiResponse,
  TextContent,
  PostContent,
  InteractiveContent,
  ImageContent,
  ShareChatContent,
  Card,
} from "./types";

/** Default Lark/Feishu API base URL */
const DEFAULT_BASE_URL = "https://open.feishu.cn/open-apis/bot/v2/hook/";

/**
 * Lark (Feishu) bot notifier.
 *
 * @example
 * ```ts
 * import { LarkNotifier } from "lark-notify";
 *
 * const bot = new LarkNotifier({
 *   token: "your-webhook-token",
 *   signKey: "your-signing-key", // optional
 * });
 *
 * await bot.sendText("Hello from Lark!");
 * ```
 */
export class LarkNotifier {
  private readonly webhookUrl: string;
  private readonly signKey?: string;
  private readonly http: AxiosInstance;

  constructor(config: LarkNotifyConfig) {
    const baseUrl = config.baseUrl || DEFAULT_BASE_URL;

    this.webhookUrl = `${baseUrl}/${config.token}`;
    this.signKey = config.signKey;

    this.http = axios.create({
      timeout: 10_000,
      headers: { "Content-Type": "application/json" },
      ...config.axiosConfig,
    });
  }

  // ---- public convenience methods ----

  /** Send a plain text message */
  async sendText(text: string): Promise<LarkApiResponse> {
    const content: TextContent = { text };
    return this.send({ msg_type: "text", content });
  }

  /** Send a rich-text (post) message */
  async sendPost(content: PostContent): Promise<LarkApiResponse> {
    return this.send({ msg_type: "post", content });
  }

  /** Send an interactive card message */
  async sendCard(card: Card): Promise<LarkApiResponse> {
    const content: InteractiveContent = { card };
    return this.send({ msg_type: "interactive", content });
  }

  /** Send an image message */
  async sendImage(imageKey: string): Promise<LarkApiResponse> {
    const content: ImageContent = { image_key: imageKey };
    return this.send({ msg_type: "image", content });
  }

  /** Share a chat */
  async sendShareChat(shareChatId: string): Promise<LarkApiResponse> {
    const content: ShareChatContent = { share_chat_id: shareChatId };
    return this.send({ msg_type: "share_chat", content });
  }

  /**
   * Send a raw Lark message.
   *
   * If the notifier was configured with a `signKey`, the signature fields
   * (`timestamp`, `sign`) are automatically injected into every request.
   */
  async send(message: LarkMessage): Promise<LarkApiResponse> {
    const body = this.signKey ? this.attachSign(message) : message;

    const response = await this.http.post<LarkApiResponse>(this.webhookUrl, body);
    return response.data;
  }

  // ---- internal ----

  private attachSign(message: LarkMessage): SignedLarkMessage {
    const { timestamp, sign } = this.generateSign(this.signKey!);
    return { ...message, timestamp, sign };
  }

  private generateSign(secret: string): { timestamp: string; sign: string } {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const key = `${timestamp}\n${secret}`;
    // key   = timestamp + "\n" + secret
    // data  = empty bytes
    // sign  = Base64(HmacSHA256(key, data))
    const sign = createHmac("sha256", key).digest("base64");

    return { timestamp, sign };
  }
}
