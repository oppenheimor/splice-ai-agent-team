const operatorAvatarByName: Record<string, string> = {
  稳健深耕型: "/agent-team/requirements-diagnosis/avatars/stable-deepening.png",
  增长探索型: "/agent-team/requirements-diagnosis/avatars/growth-explorer.png",
  经验判断型: "/agent-team/requirements-diagnosis/avatars/experience-judgment.png",
  数据验证型: "/agent-team/requirements-diagnosis/avatars/data-validation.png",
  系统重构型: "/agent-team/requirements-diagnosis/avatars/system-rebuilder.png",
  快速试水型: "/agent-team/requirements-diagnosis/avatars/rapid-experimenter.png",
  成本优先型: "/agent-team/requirements-diagnosis/avatars/cost-first.png",
  长期投入型: "/agent-team/requirements-diagnosis/avatars/long-term-builder.png",
  风险防守型: "/agent-team/requirements-diagnosis/avatars/risk-defender.png",
  创新进攻型: "/agent-team/requirements-diagnosis/avatars/innovation-attacker.png",
  平衡统筹型: "/agent-team/requirements-diagnosis/avatars/balanced-coordinator.png",
};

export function getOperatorAvatar(operatorTypeName: string): string {
  return operatorAvatarByName[operatorTypeName] || operatorAvatarByName.平衡统筹型;
}
