import coverage from "danger-plugin-coverage";

const showTestReport = async () => {
  await coverage();
};

export { showTestReport };
