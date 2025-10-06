import {
  SignJWT,
  jwtVerify,
  importPKCS8,
  importSPKI,
  generateKeyPair,
} from "jose";
import { writeFileSync, readFileSync, existsSync } from "fs";

async function testEd25519JWT() {
  try {
    let publicKey, privateKey;
    const privateKeyPath = "./private-key.pem";
    const publicKeyPath = "./public-key.pem";

    // 檢查是否已存在金鑰檔案
    if (existsSync(privateKeyPath) && existsSync(publicKeyPath)) {
      console.log("📁 載入現有的金鑰對...");

      // 載入現有的金鑰
      const privateKeyPem = readFileSync(privateKeyPath, "utf8");
      const publicKeyPem = readFileSync(publicKeyPath, "utf8");

      privateKey = await importPKCS8(privateKeyPem, "EdDSA");
      publicKey = await importSPKI(publicKeyPem, "EdDSA");

      console.log("✅ 現有金鑰對載入完成");
    } else {
      console.log("🔑 生成新的 Ed25519 金鑰對...");

      // 生成 Ed25519 金鑰對 (設定為可提取)
      const keyPair = await generateKeyPair("EdDSA", {
        extractable: true,
      });

      publicKey = keyPair.publicKey;
      privateKey = keyPair.privateKey;

      console.log("✅ 金鑰對生成完成");

      // 將金鑰轉換為 PEM 格式並儲存
      const privateKeyBuffer = await crypto.subtle.exportKey(
        "pkcs8",
        privateKey
      );
      const publicKeyBuffer = await crypto.subtle.exportKey("spki", publicKey);

      const privateKeyPem = `-----BEGIN PRIVATE KEY-----\n${Buffer.from(
        privateKeyBuffer
      ).toString("base64")}\n-----END PRIVATE KEY-----`;

      const publicKeyPem = `-----BEGIN PUBLIC KEY-----\n${Buffer.from(
        publicKeyBuffer
      ).toString("base64")}\n-----END PUBLIC KEY-----`;

      // 儲存金鑰到檔案
      writeFileSync(privateKeyPath, privateKeyPem);
      writeFileSync(publicKeyPath, publicKeyPem);

      console.log("💾 金鑰對已儲存到本地檔案:");
      console.log(`   - 私鑰: ${privateKeyPath}`);
      console.log(`   - 公鑰: ${publicKeyPath}`);
    }

    console.log("\n📝 建立 JWT Token...");

    // 建立 JWT Token
    const jwt = await new SignJWT({
      "urn:example:claim": true,
      sub: "user123",
      name: "測試用戶",
      iat: Math.floor(Date.now() / 1000),
    })
      .setProtectedHeader({ alg: "EdDSA" })
      .setIssuedAt()
      .setExpirationTime("2h")
      .setSubject("user123")
      .setIssuer("https://example.com")
      .sign(privateKey);

    console.log("✅ JWT Token 建立完成");
    console.log("🔐 JWT Token:", jwt);

    console.log("\n🔍 使用公鑰驗證 JWT...");

    // 使用公鑰驗證 JWT
    const { payload, protectedHeader } = await jwtVerify(jwt, publicKey, {
      issuer: "https://example.com",
      subject: "user123",
    });

    console.log("✅ JWT 驗證成功！");
    console.log("📋 Protected Header:", protectedHeader);
    console.log("📋 Payload:", payload);

    console.log("\n🧪 測試無效的 JWT...");

    // 測試無效的 JWT (修改過的部分)
    const invalidJwt = jwt.slice(0, -10) + "invalid";

    try {
      await jwtVerify(invalidJwt, publicKey);
      console.log("❌ 這不應該發生 - 無效 JWT 被驗證通過了");
    } catch (error) {
      console.log("✅ 正確地拒絕了無效的 JWT");
      console.log("❌ 錯誤訊息:", error.message);
    }

    console.log("\n🔧 測試從儲存的 PEM 檔案驗證 JWT...");

    // 從儲存的檔案重新載入公鑰並驗證
    const savedPublicKeyPem = readFileSync(publicKeyPath, "utf8");
    const importedPublicKey = await importSPKI(savedPublicKeyPem, "EdDSA");
    const { payload: payload2 } = await jwtVerify(jwt, importedPublicKey, {
      issuer: "https://example.com",
      subject: "user123",
    });

    console.log("✅ 從儲存的 PEM 檔案驗證成功！");
    console.log("📋 驗證的 Payload:", payload2);

    console.log("\n📄 儲存的公鑰內容:");
    console.log(savedPublicKeyPem);

    console.log("\n🎉 Ed25519 JWT 驗證測試完成！");
  } catch (error) {
    console.error("❌ 發生錯誤:", error.message);
    console.error("詳細錯誤:", error);
  }
}

// 執行測試
testEd25519JWT();
