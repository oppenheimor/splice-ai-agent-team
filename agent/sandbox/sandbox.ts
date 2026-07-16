import { defineSandbox } from "eve/sandbox";
import { justbash } from "eve/sandbox/just-bash";

// 一期只需要受控文件系统，不开放宿主 shell、Docker Socket 或出站网络。
export default defineSandbox({
  backend: justbash({ autoInstall: false }),
});
