# 火山引擎托管构建 + SSH 发布模板

这个目录是新项目接入清单，不包含项目无关的“万能发布脚本”。健康检查、migration、数据卷和反向代理都与应用运行契约有关，复制后必须由项目负责人确认。

## 使用方式

1. 把 `pipeline-final-command.sh` 的命令填入火山流水线最终阶段。
2. 把 `required-env.txt` 复制到新项目的 `deploy/required-env.txt`，替换成该项目启动必需的变量名。
3. 参照 `project-variables.example` 替换项目部署参数。
4. 从本仓库复制 `scripts/deploy-from-volcengine.sh`、`scripts/deploy-production.sh`、生产 Compose 和四个部署测试。
5. 搜索所有 `splice-ai`、`agent-team`、`/agent-team/`、`prisma`、`4274` 和 `3000`，逐项替换为新项目的真实契约。
6. 按[生产部署与新项目接入指南](../../docs/生产部署与新项目接入指南.md)完成服务器、镜像仓库和火山流水线配置。

完成复制后必须执行部署测试，并用第二套非生产环境验证一次完整发布和回滚。模板只减少重复配置，不替代项目级验证。

