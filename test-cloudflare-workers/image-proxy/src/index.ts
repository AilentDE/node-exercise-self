import { PhotonImage, SamplingFilter, resize } from "@cf-wasm/photon";

class TimeKeeper {
  private startTime: number;
  private endTime: number;
  private taskName: string;

  constructor() {
    this.startTime = performance.now();
    this.endTime = performance.now();
    this.taskName = "init";
  }

  restart(taskName: string) {
    this.taskName = taskName;
    this.startTime = performance.now();
  }

  end(memo?: string) {
    this.endTime = performance.now();
    console.log(
      `${this.taskName} ${memo ? `(${memo})` : ""} took ${
        this.endTime - this.startTime
      }ms`
    );
  }
}

const ALLOWED_ORIGIN = "https://localhost:3000";

// 新增 helper 函數來添加 CORS headers
function addCorsHeaders(response: Response): Response {
  const newHeaders = new Headers(response.headers);
  newHeaders.set("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  newHeaders.set("Access-Control-Allow-Methods", "GET, PUT, OPTIONS");
  newHeaders.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}

// 新增 helper 函數來添加 Cache-Control headers
const CACHE_TTL = 60 * 60 * 2; // 2 hours
function addCacheHeaders(response: Response): Response {
  const newHeaders = new Headers(response.headers);
  newHeaders.set("Cache-Control", `public, max-age=${CACHE_TTL}`);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}

export default {
  async fetch(request: Request, env: any) {
    // Debug
    const timeKeeper = new TimeKeeper();

    // Get the secret from the secrets store
    const TokenKey = (await env.IMAGE_PROXY_SECRET.get()) as string;
    if (!TokenKey) {
      return new Response("Unauthorized", { status: 401 });
    }
    const bucket = env.IMAGE_PROXY_BUCKET as R2Bucket;
    if (!bucket) {
      return new Response("Internal Server Error", { status: 500 });
    }
    const kv = env.IMAGE_PROXY_KV as KVNamespace;
    if (!kv) {
      return new Response("Internal Server Error", { status: 500 });
    }

    const url = new URL(request.url);
    const pathname = url.pathname;
    // R2 key = path of the image (e.g. /images.jpg -> images.jpg)
    const objectKey = pathname.replace(/^\/+/, "");

    timeKeeper.end();

    switch (request.method) {
      case "OPTIONS":
        return new Response(null, {
          headers: {
            "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
            "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Access-Control-Max-Age": "86400",
          },
        });

      case "GET":
        // 檢查 response cache
        const imageCache = await caches.open("private:r2-cache");
        const searchParams = url.searchParams;

        // 創建標準化的 cache key
        const baseUrl = url.origin + url.pathname;
        let width = searchParams.get("w");
        const cacheKey = width ? `${baseUrl}?w=${width}` : baseUrl;

        console.log("Looking for cache key:", cacheKey);
        const cachedResponse = await imageCache.match(cacheKey);
        if (cachedResponse) {
          console.log("cache hit for key:", cacheKey);
          return addCorsHeaders(addCacheHeaders(cachedResponse));
        }

        // 檢查原始圖片是否存在
        const object = await bucket.head(objectKey);
        if (!object) {
          return addCorsHeaders(new Response("Not Found", { status: 404 }));
        }

        // 檢查是否需要 resize
        let objectBody: R2ObjectBody | null = null;
        if (width) {
          width = parseInt(width).toString();
          const newKey = `${objectKey}-${width}`;

          // 檢查是否已經存在
          objectBody = await bucket.get(newKey);
          if (objectBody) {
            const response = new Response(objectBody.body, {
              headers: {
                "Content-Type": "image/webp",
              },
            });
            await imageCache.put(cacheKey, response.clone());
            return addCorsHeaders(addCacheHeaders(response));
          }

          // 使用 KV 作為鎖機制，避免重複處理
          const lockKey = `lock:${newKey}`;
          const lockValue = `${Date.now()}-${Math.random()
            .toString(36)
            .substring(2, 9)}`; // 唯一標識符

          timeKeeper.restart("lock");

          // 嘗試設置鎖
          let lockAcquired = false;
          try {
            await kv.put(lockKey, lockValue, {
              expirationTtl: 60,
            });

            // 驗證鎖是否真的是自己設置的
            const verifyLock = await kv.get(lockKey);
            if (verifyLock === lockValue) {
              lockAcquired = true;
              timeKeeper.end("success");
            } else {
              // 鎖被其他請求搶走了
              console.log("Lock was acquired by another request");
              timeKeeper.end("failed");
            }
          } catch (error) {
            // 鎖設置失敗，可能是因為其他請求正在處理
            console.log(
              "Lock acquisition failed, waiting for other request to complete"
            );
            timeKeeper.end("failed");
          }

          if (!lockAcquired) {
            timeKeeper.restart("wait");
            // 等待其他請求完成處理
            for (let i = 0; i < 30; i++) {
              await new Promise((resolve) => setTimeout(resolve, 100));

              // 檢查是否已經處理完成
              objectBody = await bucket.get(newKey);
              if (objectBody) {
                timeKeeper.end();
                const response = new Response(objectBody.body, {
                  headers: {
                    "Content-Type": "image/webp",
                  },
                });
                await imageCache.put(cacheKey, response.clone());
                return addCorsHeaders(addCacheHeaders(response));
              }

              // 檢查鎖是否還在
              const existingLock = await kv.get(lockKey);
              if (!existingLock) {
                // 鎖已釋放，但圖片還沒生成，可能是處理失敗
                // 重新嘗試獲取鎖
                try {
                  const newLockValue = `${Date.now()}-${Math.random()
                    .toString(36)
                    .substring(2, 9)}`;
                  await kv.put(lockKey, newLockValue, {
                    expirationTtl: 60,
                  });

                  const verifyNewLock = await kv.get(lockKey);
                  if (verifyNewLock === newLockValue) {
                    lockAcquired = true;
                    timeKeeper.end("success");
                    break;
                  }
                } catch (error) {
                  // 繼續等待
                  timeKeeper.end("failed");
                }
              }
            }

            if (!lockAcquired) {
              return addCorsHeaders(
                new Response("Processing timeout", { status: 408 })
              );
            }
          }

          try {
            // 再次檢查是否已被其他請求處理
            objectBody = await bucket.get(newKey);
            if (objectBody) {
              const response = new Response(objectBody.body, {
                headers: {
                  "Content-Type": "image/webp",
                },
              });
              await imageCache.put(cacheKey, response.clone());
              return addCorsHeaders(addCacheHeaders(response));
            }

            // 執行 resize
            objectBody = await bucket.get(objectKey);
            timeKeeper.restart("resize");
            const resizedImage = await resizeR2Object(objectBody!, width);
            const outputImage = resizedImage.get_bytes_webp();
            resizedImage.free();
            timeKeeper.end();

            timeKeeper.restart("put");
            await bucket.put(newKey, outputImage);
            timeKeeper.end();

            const response = new Response(outputImage, {
              headers: {
                "Content-Type": "image/webp",
              },
            });
            await imageCache.put(cacheKey, response.clone());
            return addCorsHeaders(addCacheHeaders(response));
          } finally {
            // 釋放鎖
            await kv.delete(lockKey);
          }
        } else {
          objectBody = await bucket.get(objectKey);
          const response = new Response(objectBody!.body, {
            headers: {
              "Content-Type": object.httpMetadata?.contentType || "image/jpeg",
            },
          });
          await imageCache.put(cacheKey, response.clone());
          return addCorsHeaders(addCacheHeaders(response));
        }

      case "PUT":
        const requestBody = await request.arrayBuffer();
        if (!requestBody || requestBody.byteLength === 0) {
          return addCorsHeaders(
            new Response(
              JSON.stringify({
                success: false,
                error: "No data provided",
                detail: {
                  contentType: request.headers.get("Content-Type"),
                  contentLength: request.headers.get("Content-Length"),
                },
              }),
              {
                status: 400,
                headers: {
                  "Content-Type": "application/json",
                },
              }
            )
          );
        }

        const bufferData = new Uint8Array(requestBody);
        await bucket.put(objectKey, bufferData);
        const signature = await signHMACSHA256(TokenKey, objectKey);

        return addCorsHeaders(
          new Response(
            JSON.stringify({
              success: true,
              signature,
            }),
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          )
        );

      default:
        return addCorsHeaders(
          new Response("Method Not Allowed", { status: 405 })
        );
    }
  },
};

async function signHMACSHA256(key: string, message: string): Promise<string> {
  const enc = new TextEncoder();

  // 將密鑰轉為 CryptoKey
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  // 使用 CryptoKey 對 message 進行 HMAC-SHA1 簽章
  const signature = await crypto.subtle.sign(
    "HMAC",
    cryptoKey,
    enc.encode(message)
  );

  // 將 ArrayBuffer 轉為 Hex 字串
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function resizeR2Object(objectBody: R2ObjectBody, width: string) {
  const imageArrayBuffer = await objectBody.arrayBuffer();
  const imageUint8Array = new Uint8Array(imageArrayBuffer);
  const image = PhotonImage.new_from_byteslice(imageUint8Array);
  const imageWidth = image.get_width();
  const imageHeight = image.get_height();
  const ratio = parseInt(width) / imageWidth;
  const resizedImage = resize(
    image,
    imageWidth * ratio,
    imageHeight * ratio,
    SamplingFilter.Lanczos3
  );
  return resizedImage;
}
