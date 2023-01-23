import { buildBenchmarking } from "./build";
import { searchBenchmarking } from "./search";

const main = async () => {
  await buildBenchmarking();
  for (const suite of Object.values(searchBenchmarking)) {
    await suite();
  }
};

main();
