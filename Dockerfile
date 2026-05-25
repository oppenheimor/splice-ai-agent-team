#####################################
# Stage 1: 构建阶段（builder）
# 用于安装依赖、生成 Prisma Client、构建 Next.js 应用
#####################################
FROM m.daocloud.io/docker.io/library/node:20-alpine AS builder

# 设置工作目录
WORKDIR /app

# 仅复制包管理相关文件，提高缓存利用率
COPY package.json pnpm-lock.yaml ./

# 使用国内 npm 镜像，加速依赖安装
ENV COREPACK_NPM_REGISTRY=https://registry.npmmirror.com
ENV npm_config_registry=https://registry.npmmirror.com

# 启用 Corepack，并激活 pnpm v9
# --frozen-lockfile 确保依赖版本严格一致
RUN corepack enable \
 && corepack prepare pnpm@9 --activate \
 && pnpm install --frozen-lockfile

# 复制项目源码
COPY . .

# 跳过数据库连接检查（仅用于生成 Prisma Client）
ENV DATABASE_URL="skip"

# 生成 Prisma Client、构建 Next.js 应用
# pnpm prune --prod 移除 devDependencies，减小产物体积
RUN pnpm prisma generate

RUN pnpm build \
  && pnpm prune --prod

#####################################
# Stage 2: 运行阶段（runner）
# 仅包含运行时所需的最小内容
#####################################
FROM m.daocloud.io/docker.io/library/node:20-alpine AS runner

# 设置运行时工作目录
WORKDIR /app

# 生产环境变量
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

# 创建非 root 用户，增强安全性
RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

# 从 builder 阶段复制 Next.js standalone 输出
# standalone 模式可减少对 node_modules 的依赖
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# 复制生产环境所需的 node_modules
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules

# 复制静态资源
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# 复制 Prisma schema（用于 migrate / generate）
COPY --from=builder --chown=nextjs:nodejs /app/prisma/schema.prisma ./prisma/schema.prisma

# 复制自定义启动脚本
COPY --chown=nextjs:nodejs entrypoint.sh ./entrypoint.sh

# 赋予执行权限
RUN chmod +x entrypoint.sh

# 切换到非 root 用户运行
USER nextjs

# 暴露端口
EXPOSE 3000

# 容器启动时执行的入口脚本
ENTRYPOINT ["/app/entrypoint.sh"]