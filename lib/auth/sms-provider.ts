export async function sendSmsCode(phone: string, code: string): Promise<void> {
  // TODO: 购买并配置火山云短信服务后，把这里替换为真实短信发送调用。
  console.info(`[auth:sms] phone=${phone} code=${code}`);
}
