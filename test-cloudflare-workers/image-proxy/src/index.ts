import { PhotonImage, SamplingFilter, resize } from "@cf-wasm/photon";

export default {
  async fetch(request: Request, env: any) {
    // Debug Variables
    console.log("timeKeeper start");
    const timeKeeper = new Map<string, number>();
    let start = performance.now();
    let end = performance.now();

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

    switch (request.method) {
      case "OPTIONS":
        return new Response("OK", { status: 200 });

      case "GET":
        // debug
        end = performance.now();
        console.log("base process", end - start);
        timeKeeper.set("base process", end - start);
        start = performance.now();

        // 檢查原始圖片是否存在
        const object = await bucket.head(objectKey);
        if (!object) {
          return new Response("Not Found", { status: 404 });
        }

        // 檢查是否需要 resize
        let width = url.searchParams.get("w") || undefined;
        let objectBody: R2ObjectBody | null = null;
        if (width) {
          width = parseInt(width).toString();
          const newKey = `${objectKey}-${width}`;

          // 檢查是否已經存在
          objectBody = await bucket.get(newKey);
          if (objectBody) {
            return new Response(objectBody.body, {
              headers: {
                "Content-Type": "image/webp",
              },
            });
          }

          // 使用 KV 作為鎖機制，避免重複處理
          const lockKey = `lock:${newKey}`;
          const lockValue = Date.now().toString();

          // 嘗試設置鎖，如果失敗則等待
          let lockAcquired = false;
          try {
            await kv.put(lockKey, lockValue, {
              expirationTtl: 60,
            });
            lockAcquired = true;
          } catch (error) {
            // 鎖設置失敗，可能是因為其他請求正在處理
            console.log(
              "Lock acquisition failed, waiting for other request to complete"
            );
          }

          if (!lockAcquired) {
            // 等待其他請求完成處理
            for (let i = 0; i < 30; i++) {
              // 增加等待時間到 3 秒
              await new Promise((resolve) => setTimeout(resolve, 100));

              // 檢查是否已經處理完成
              objectBody = await bucket.get(newKey);
              if (objectBody) {
                return new Response(objectBody.body, {
                  headers: {
                    "Content-Type": "image/webp",
                  },
                });
              }

              // 檢查鎖是否還在
              const existingLock = await kv.get(lockKey);
              if (!existingLock) {
                // 鎖已釋放，但圖片還沒生成，可能是處理失敗
                // 重新嘗試獲取鎖
                try {
                  await kv.put(lockKey, lockValue, {
                    expirationTtl: 60,
                  });
                  lockAcquired = true;
                  break;
                } catch (error) {
                  // 繼續等待
                }
              }
            }

            if (!lockAcquired) {
              return new Response("Processing timeout", { status: 408 });
            }
          }

          try {
            // 再次檢查是否已被其他請求處理
            objectBody = await bucket.get(newKey);
            if (objectBody) {
              return new Response(objectBody.body, {
                headers: {
                  "Content-Type": "image/webp",
                },
              });
            }

            // 執行 resize
            objectBody = await bucket.get(objectKey);
            const resizedImage = await resizeR2Object(objectBody!, width);
            const outputImage = resizedImage.get_bytes_webp();
            resizedImage.free();

            await bucket.put(newKey, outputImage);
            return new Response(outputImage, {
              headers: {
                "Content-Type": "image/webp",
              },
            });
          } finally {
            // 釋放鎖
            await kv.delete(lockKey);
          }
        } else {
          objectBody = await bucket.get(objectKey);
          return new Response(objectBody!.body, {
            headers: {
              "Content-Type": object.httpMetadata?.contentType || "image/jpeg",
            },
          });
        }

      case "PUT":
        const requestBody = await request.arrayBuffer();
        if (!requestBody || requestBody.byteLength === 0) {
          return new Response(
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
          );
        }

        const bufferData = new Uint8Array(requestBody);
        await bucket.put(objectKey, bufferData);
        const signature = await signHMACSHA256(TokenKey, objectKey);

        return new Response(
          JSON.stringify({
            success: true,
            signature,
          }),
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

      default:
        return new Response("Method Not Allowed", { status: 405 });
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
