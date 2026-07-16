#####################################
# Stage 1: 干净源码阶段（source）
# 保留 .dockerignore 过滤后的完整源码树，避免 Eve 运行时依赖具体目录白名单
#####################################
FROM scratch AS source

COPY . /app

#####################################
# Stage 2: 构建阶段（builder）
# 用于安装依赖、生成 Prisma Client、构建 Next.js 应用
#####################################
FROM m.daocloud.io/docker.io/library/node:24-bookworm AS builder

# 设置工作目录
WORKDIR /app

# 官方 Bookworm 完整镜像已包含 Python、gcc、g++、make 与 liblzma-dev，
# Eve 的 Node 原生扩展可以直接编译，无需在发布时安装系统工具链。

# 仅复制包管理相关文件，提高依赖安装层的缓存利用率
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# 使用国内 npm 镜像，加速依赖安装
ENV COREPACK_NPM_REGISTRY=https://registry.npmmirror.com
ENV npm_config_registry=https://registry.npmmirror.com
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH

# 启用 Corepack，并激活仓库锁定的 pnpm 版本
# 使用普通 Docker 层缓存，兼容未启用 BuildKit 的 self-hosted runner。
RUN corepack enable \
 && corepack prepare pnpm@11.13.1 --activate \
 && pnpm config set registry https://registry.npmmirror.com \
 && pnpm config set store-dir /pnpm/store \
 && pnpm install --frozen-lockfile --fetch-retries=5 --fetch-timeout=300000 --network-concurrency=16

# 复制经过 .dockerignore 过滤的项目源码
COPY --from=source /app ./

# 跳过数据库连接检查（仅用于生成 Prisma Client）
ENV DATABASE_URL="skip"

# 生成 Prisma Client、构建 Next.js 应用
# pnpm prune --prod 移除 devDependencies，减小产物体积
RUN pnpm prisma generate

RUN pnpm build \
  && pnpm prune --prod

#####################################
# Stage 3: 运行阶段（runner）
# 仅包含运行时所需的最小内容
#####################################
FROM m.daocloud.io/docker.io/library/node:24-bookworm-slim AS runner

# 设置运行时工作目录
WORKDIR /app

# 生产环境变量
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

# Bookworm slim 已包含 node-liblzma 运行所需的 liblzma5 共享库，
# 但 Prisma 仍需要 openssl 命令检测正确的 Debian OpenSSL 运行时。
RUN apt-get update \
 && apt-get install -y --no-install-recommends openssl \
 && rm -rf /var/lib/apt/lists/*

# 创建非 root 用户，增强安全性
RUN groupadd --gid 1001 nodejs \
 && useradd --uid 1001 --gid nodejs \
      --no-create-home --home-dir /nonexistent \
      --shell /usr/sbin/nologin nextjs

# `eve start` 会根据构建产物中的 module map 读取 authored source。复制完整的干净源码树，
# 让源码目录调整无需同步维护 Dockerfile；敏感文件、缓存和非运行资料由 .dockerignore 排除。
COPY --from=source --chown=nextjs:nodejs /app ./

# 从 builder 阶段复制 Next.js standalone 输出
# standalone 模式可减少对 node_modules 的依赖
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# 复制生产环境所需的 node_modules
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules

# 复制静态资源
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Eve 自托管服务构建产物；Next.js 会把同源 /eve/v1 请求转发到本机 4274 端口。
COPY --from=builder --chown=nextjs:nodejs /app/.output ./.output

# 复制自定义启动脚本
COPY --chown=nextjs:nodejs entrypoint.sh ./entrypoint.sh

# 赋予执行权限
RUN chmod +x entrypoint.sh \
 && mkdir -p .workflow-data .eve/sandbox-cache \
 && chown -R nextjs:nodejs .workflow-data .eve

# 切换到非 root 用户运行
USER nextjs

# 暴露端口
EXPOSE 3000

# 容器启动时执行的入口脚本
ENTRYPOINT ["/app/entrypoint.sh"]
