# GraphQL 學習筆記 (Practice Pylon GraphQL)

這份文件記錄了在練習 GraphQL 過程中所學習到的核心概念與架構模式。

## 1. Controller vs Store 的運用

在 GraphQL 的 Resolver 中，我們可以使用不同的後端模式來提供資料，最常見的有以下兩種：

### Stateless (無狀態) - Controller 模式
*   **特性：** 沒有需要維護的內部狀態，單純作為一個執行動作的集合（如打外部 API、運算）。
*   **寫法：** 導出包含普通函式 (async functions) 的一般 Object。
*   **範例：** `StarWarsController.fetchSwapi`，因為它只是去打外部 API 拿資料，用完就丟了，用普通 Object 包函式非常輕量且正確。

### Stateful (有狀態) - Store 模式
*   **特性：** 內部需要維護狀態資料（如模擬的記憶體資料庫陣列 `this.characters`），需要有辦法讀改這些狀態。
*   **寫法：** 撰寫一個 `Class` 並導出它的實例 (Instance)，例如 `export default new StarWarsStore()`。
*   **範例：** 為了維護 `characters` 陣列，並確保 `addCharacter` 或 `deleteCharacter` 修改的總是這份狀態。

---

## 2. 解決 Class Method 的 `this` 遺失問題

當我們將 Class 的 Method 當作 Resolver 傳遞給 GraphQL 路由時：
```typescript
{
  character: StarWarsStore.getCharacter
}
```
這麼做只傳遞了函式的「參照」，當框架執行這個函式時，`this` 不再指向原本 Store 的實例，這會導致存取 `this.characters` 時報錯 (`undefined`)。可以透過以下兩種方式解決：

### 解法一：使用 `constructor` 與 `bind()` (傳統做法)
在建構子中強制將 `this` 綁死到實例上。
```typescript
constructor() {
  this.getCharacter = this.getCharacter.bind(this);
}
```

### 解法二：使用箭頭函式 (Arrow Functions) (現代更簡潔)
直接利用 Arrow Function 天生會鎖定宣告時的上下文環境的特性。
```typescript
getCharacter = (id: number) => {
  return this.characters.find(c => c.id === id);
}
```

---

## 3. GraphQL 別名 (Aliases)：在一個 Request 中查詢多筆相同欄位的資料

不同於傳統 RESTful API 需要呼叫兩次 endpoint (`GET /character/1`、`GET /character/2`)，GraphQL 允許我們在「同一次 HTTP Request」之內查詢重複欄位。為了避免欄位名稱衝突，我們可以替查詢加上「別名」：

**GraphQL 查詢語法：**
```graphql
query {
  # 將 id 為 1 的結果命名為 person1
  person1: character(id: 1) {
    id
    name
    height
  }

  # 將 id 為 2 的結果命名為 person2
  person2: character(id: 2) {
    id
    name
    height
  }
}
```

**JSON 回傳結果：**
```json
{
  "data": {
    "person1": { "id": 1, "name": "Luke Skywalker", "height": 172 },
    "person2": { "id": 2, "name": "Darth Vader", "height": 202 }
  }
}
```

---

## 4. GraphQL 與 RESTful API 架構比較

**GraphQL 其實只是一個「API 的展示層 (Transport / Interface Layer)」！**

在底層架構上，不管是透過 GraphQL、RESTful API、gRPC，甚至是終端機指令 (CLI)，負責運算核心商業邏輯的 `Controller` 或 `Service`，以及跟 `Database` 溝通的部分完全是共用的。

### 餐廳比喻🍔
*   **資料庫 (Database)：** 負責存放食材的地方（冰箱、倉庫）。
*   **Service / Controller (業務邏輯)：** 負責把食材變成料理的廚師。
*   **RESTful API (傳統餐廳)：** 客人只能拿著固定的菜單點菜 (`GET /burger/1`)。廚師看到固定點單後去拿菜、做漢堡。
*   **GraphQL (自助式吃到飽)：** 客人走進來不看菜單，直接開口要求高度客製化的內容：我要一片漢堡肉、兩片生菜、半杯可樂 (`query { burger { meat lettuce } drink(size: half) }`)。

**無論從哪個窗口點菜，接單的都是後台同一個廚師 (負責處理商業邏輯)，然後從同一個冰箱 (資料庫) 拿料。**

這代表著兩者的系統核心可以完美共存，如果企業想把舊有 REST 架構轉換成 GraphQL，完全不用重寫後端的 Controller/Service/Database 邏輯，只需要像在 `src/index.ts` 裡面一樣，把原本 REST 的路由換成註冊 GraphQL 的 Resolver 即可。

### N+1 的小挑戰
因為 GraphQL 給予了前端高度自由的巢狀查詢，有時候這會對後端資料庫發出太密集、零碎的查詢次數，這稱為 `N+1` 查詢問題。為了應付這個挑戰，GraphQL 的實作架構通常會在底層再掛上類似 `Dataloader` 的機制將多次小查詢打包為一次的大查詢來優化效能。
