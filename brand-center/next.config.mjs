import createMDX from "@next/mdx";
import path from "node:path";
const withMDX = createMDX({});
export default withMDX({ pageExtensions: ["ts", "tsx", "md", "mdx"], output: "standalone", outputFileTracingRoot: path.resolve(process.cwd()) });
