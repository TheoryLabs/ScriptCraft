import assert from 'assert'
import chalk from 'chalk'

import myPkg from '$pkg-manifest'
import config from '$config'
import defaults from '$constants'


export default {
  cwd: {
    type: "string",
    alias: "w",
    desc: `Set ${myPkg.name}'s ${chalk.magenta("CWD")}`,
    requireArg: true
  },
  dir: {
    type: "string",
    alias: "d",
    desc: `Set dir to look for ${chalk.green(config.taskFile)} (default is ${chalk.magenta(
      "CWD"
    )})`,
    requireArg: true
  },
  npm: {
    type: "boolean",
    alias: "n",
    default: true,
    desc: `load npm scripts into namespace ${chalk.magenta(`${defaults.PACKAGE_MANIFEST_FILE_NAMESPACE}`)} (--no-npm to disable)`
  },
  nmbin: {
    type: "boolean",
    alias: "b",
    desc: `add ${chalk.magenta("CWD/node_modules/.bin")} to ${chalk.blue("PATH")}`,
    default: true
  },
  list: {
    type: "string",
    alias: "l",
    desc: "List tasks names from list of comma separated namespaces (default is all namespaces)",
    default: ""
  },
  full: {
    type: "count",
    alias: "f",
    desc: "--list show tasks names with namespace",
    default: false
  },
  ns: {
    type: "boolean",
    alias: "m",
    desc: "List all namespaces"
  },
  soe: {
    type: "enum",
    enum: v => {
      if (v === undefined) return "full";
      if (!v || v === "no") return "";
      assert(v === "soft" || v === "full", `option soe value must be one of: no, soft, full`);
      return v;
    },
    alias: "e",
    desc: `Stop on errors - one of: no, soft, full`,
    default: "full"
  },
  quiet: {
    type: "boolean",
    alias: "q",
    desc: "Do not output any logs",
    default: false
  },
  serial: {
    type: "boolean",
    alias: ["s", "x"],
    desc: "Execute tasks from command line serially",
    default: false
  },
  require: {
    type: "string array",
    alias: "r",
    desc: `require module for tasks instead of loading ${config.taskFile}. require from path is CWD`
  }
};
