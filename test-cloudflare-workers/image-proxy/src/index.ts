import { PhotonImage, SamplingFilter, resize } from "@cf-wasm/photon";

export default {
  async fetch(request: Request, env: any) {
    // Get the secret from the secrets store
    const TokenKey = (await env.IMAGE_PROXY_SECRET.get()) as SecretsStoreSecret;
    if (!TokenKey) {
      return new Response("Unauthorized", { status: 401 });
    }
    const bucket = env.IMAGE_PROXY_BUCKET as R2Bucket;
    if (!bucket) {
      return new Response("Internal Server Error", { status: 500 });
    }

    const url = new URL(request.url);
    const pathname = url.pathname;

    switch (request.method) {
      case "GET":
        // R2 key = path of the image (e.g. /images.jpg -> images.jpg)
        const objectKey = pathname.replace(/^\/+/, "");
        const object = await bucket.get(objectKey);
        if (!object || !object.body) {
          return new Response("Not Found", { status: 404 });
        }

        const imageArrayBuffer = await object.arrayBuffer();
        const imageUint8Array = new Uint8Array(imageArrayBuffer);
        const image = PhotonImage.new_from_byteslice(imageUint8Array);
        const imageWidth = image.get_width();
        const imageHeight = image.get_height();

        let width = url.searchParams.get("w") || undefined;
        let height = url.searchParams.get("h") || undefined;
        // override the width and height if it's larger than the image
        if (width && parseInt(width) > imageWidth) {
          width = imageWidth.toString();
        }
        if (height && parseInt(height) > imageHeight) {
          height = imageHeight.toString();
        }

        // calculate the ratio of the width and height
        const ratio = width
          ? parseInt(width) / imageWidth
          : height
          ? parseInt(height) / imageHeight
          : 1;

        // resize the image
        const resizedImage = resize(
          image,
          imageWidth * ratio,
          imageHeight * ratio,
          SamplingFilter.Lanczos3
        );

        const outputImage = resizedImage.get_bytes_webp();
        resizedImage.free();
        image.free();

        return new Response(outputImage, {
          headers: {
            "Content-Type": "image/webp",
            "Content-Length": outputImage.length.toString(),
          },
        });

      default:
        return new Response("Method Not Allowed", { status: 405 });
    }
  },
};
