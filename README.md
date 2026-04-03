# 剧情向网页游戏（骨架）

## 目录结构

```
code/
├── frontend/                 # Next.js（App Router）+ TypeScript + Tailwind
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx          # /
│   │   │   ├── globals.css
│   │   │   └── game/page.tsx     # /game
│   │   ├── components/
│   │   │   ├── GameContainer.tsx
│   │   │   ├── StoryDisplay.tsx
│   │   │   └── ChoiceList.tsx
│   │   └── types/story.ts
│   ├── package.json
│   └── tailwind.config.ts
├── backend/                  # Spring Boot + MongoDB
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/storygame/game/
│       │   ├── StoryGameApplication.java
│       │   ├── config/WebConfig.java      # CORS（localhost:3000）
│       │   ├── controller/GameController.java
│       │   ├── service/GameService.java
│       │   ├── repository/
│       │   └── model/                     # StoryNode, Choice, UserState
│       └── resources/application.properties
├── docs/
│   └── database.md           # 集合数量、字段、如何建库
└── README.md
```

## 关键配置

### MongoDB（后端）

`backend/src/main/resources/application.properties`：

```properties
spring.data.mongodb.uri=${MONGODB_URI:mongodb://localhost:27017/storygame}
```

- 默认连接本机 `27017`，数据库名 `storygame`。
- 覆盖方式：环境变量 `MONGODB_URI`，例如  
  `export MONGODB_URI='mongodb://user:pass@host:27017/storygame'`
- **集合（表）说明、字段、怎么建库**：见 [docs/database.md](docs/database.md)。

### CORS

`WebConfig` 已允许 `http://localhost:3000` 访问 `/api/**`，便于前端开发时调用。

### Java 版本

Spring Boot 3.x 需要 **JDK 17+**。若本机 `mvn -version` 仍是 Java 8，请先：

```bash
export JAVA_HOME="$(/usr/libexec/java_home -v 17)"   # macOS 示例
```

## 运行方式

**1. 启动 MongoDB**（本机或 Docker 等，端口与 URI 与配置一致）

**2. 后端**

```bash
cd backend
export JAVA_HOME="$(/usr/libexec/java_home -v 17)"   # 若需要
mvn spring-boot:run
```

健康检查：<http://localhost:8080/api/health>

**3. 前端**

```bash
cd frontend
npm install
npm run dev
```

浏览器：<http://localhost:3000> ，游戏页：<http://localhost:3000/game>

 
