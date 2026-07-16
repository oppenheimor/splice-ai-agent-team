import { eveChannel } from "eve/channels/eve";
import { wishCreatorAppAuth } from "../../lib/wish-creator/eve-auth";

export default eveChannel({
  // 生产与开发都校验主站登录 Cookie，并绑定当前许愿池会话。
  auth: [wishCreatorAppAuth()],
});
