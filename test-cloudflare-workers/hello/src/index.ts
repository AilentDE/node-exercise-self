export interface Env {
  // 在這裡定義您的環境變數
  // 例如：DATABASE_URL: string;
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const url = new URL(request.url);

    // 處理不同的路由
    switch (url.pathname) {
      case "/":
        return new Response("Hello from Cloudflare Workers!", {
          headers: { "Content-Type": "text/plain" },
        });

      case "/api/hello":
        return new Response(
          JSON.stringify({
            message: "Hello from API!",
            timestamp: new Date().toISOString(),
          }),
          {
            headers: { "Content-Type": "application/json" },
          }
        );

      default:
        return new Response("Not Found", { status: 404 });
    }
  },
};
