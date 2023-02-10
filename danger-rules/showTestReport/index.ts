import { coverage } from "./plugin";

const showTestReport = async () => {
  await coverage();
};

export { showTestReport };
