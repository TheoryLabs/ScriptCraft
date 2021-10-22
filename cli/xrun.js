import Path from 'path'
import Fs from 'fs'

import chalk from 'chalk'
import xsh, { envPath } from 'xsh'
import requireAt from 'require-at'
import { makeOptionalRequire } from 'optional-require'

import { logger } from '$logger'
import parseCmdArgs from '$parse-cmd-args'
import usage from '$usage'
import cliOptions from '$cli-options'
import parseArray from '$parse-array'
import defaults from '$constants'


const optionalRequire = makeOptionalRequire(require)

// const { resolve } = Path
// console.log(require("$constants"))

function flushLogger(opts) {
  logger.quiet(opts && opts.quiet);
  logger.resetBuffer(true, false);
}

function exit(code) {
  process.exit(code);
}

function xrun(argv, offset, clapMode = false, xrunPath = process.cwd()) {
  if (!argv) {
    argv = process.argv;
    offset = 2;
  }

  if (argv.length === 3 && argv[offset] === "--options") {
    Object.keys(cliOptions).forEach(k => {
      const x = cliOptions[k];
      console.log(`--${k}`);
      console.log(`-${x.alias}`);
    });
    return exit(0);
  }

  // handle situation where node.js thinks this pkg is at a diff dir than where it's
  // physically installed, a scenario in case pkg mgr installs using symlinks
  let runner;
  const foundReq = [
    xrunPath, // first look for it in path passed from cli
    `${defaults.PACKAGE_EXPORTS_NAMESPACE}`, // let node.js resolve by package name
    ".." // finally load from definitive known location
  ].find(p => {
    return p && (runner = optionalRequire(p))
  });
  const foundPath = Path.dirname(require.resolve(foundReq));
  const cmdArgs = parseCmdArgs(argv, offset, clapMode, foundPath);
  const opts = cmdArgs.opts;

  const numTasks = runner.countTasks();

  if (numTasks === 0) {
    const fromCwd = Path.dirname(requireAt(process.cwd()).resolve(`${defaults.PACKAGE_EXPORTS_NAMESPACE}`));
    const fromMyDir = Path.dirname(require.resolve(".."));
    const info = cmdArgs.searchResult.xrunFile
      ? `
This could be due to a few reasons:

  1. your task file ${cmdArgs.searchResult.xrunFile} didn't load any tasks or contains errors.
  2. there are multiple copies of this package (@theorylabs/script-craft) installed in "node_modules".

Here are some attempts to detect them from CWD and my dir.  They should be the same:

    - resolved from CWD: '${fromCwd}'
    - resolved from my dir: '${fromMyDir}'
    - actual dir used: '${foundPath}'
`
      : `
You do not have a "xrun-tasks.js|ts" file, so the only tasks may come from your
'package.json' scripts, and you probably don't have any defined there either.
`;
    logger.error(`${chalk.red("*** No tasks found ***")}
${info}
For reference, current __dirname is:
    - '${__dirname}'
`);
  } else if (cmdArgs.parsed.source.list !== "default") {
    flushLogger(opts);
    const ns = opts.list && opts.list.split(",").map(x => x.trim());
    try {
      if (opts.full) {
        let fn = runner._tasks.fullNames(ns);
        if (opts.full > 1) fn = fn.map(x => (x.startsWith("/") ? x : `/${x}`));
        console.log(fn.join("\n"));
      } else {
        console.log(runner._tasks.names(ns).join("\n"));
      }
    } catch (err) {
      console.log(err.message);
    }
    return exit(0);
  } else if (opts.ns) {
    flushLogger(opts);
    console.log(runner._tasks._namespaces.join("\n"));
    return exit(0);
  }

  const cmdName = Path.basename(process.argv[1] || "") || "xrun";

  if (cmdArgs.tasks.length === 0 || numTasks === 0) {
    flushLogger(opts);
    runner.printTasks();
    if (!opts.quiet) {
      console.log(`${usage}`);
      console.log(
        chalk.bold(" Help:"),
        `${cmdName} -h`,
        chalk.bold(" Example:"),
        `${cmdName} build\n`
      );
    }
    return exit(1);
  }

  if (opts.help) {
    console.log("help for tasks:", cmdArgs.tasks);
    return exit(0);
  }

  flushLogger(opts);

  if (opts.nmbin) {
    const nmBin = Path.join(opts.cwd, "node_modules", ".bin");
    if (Fs.existsSync(nmBin)) {
      const x = chalk.magenta(`${xsh.pathCwd.replace(nmBin, ".")}`);
      if (!process.env.PATH.match(new RegExp(`${nmBin}(${Path.delimiter}|$)`))) {
        envPath.addToFront(nmBin);
        logger.log(`Added ${x} to PATH`);
      } else {
        logger.log(`PATH already contains ${x}`);
      }
    }
  }

  if (!process.env.hasOwnProperty("FORCE_COLOR")) {
    process.env.FORCE_COLOR = "1";
  }

  if (runner.stopOnError === undefined || cmdArgs.parsed.source.soe !== "default") {
    runner.stopOnError = opts.soe;
  }

  let tasks = cmdArgs.tasks.map(x => {
    if (x.startsWith("/") && x.indexOf("/", 1) > 1) {
      return x.substr(1);
    }
    return x;
  });

  if (tasks[0].startsWith("[")) {
    let arrayStr;
    try {
      arrayStr = tasks.join(" ");
      tasks = parseArray(arrayStr);
    } catch (e) {
      console.log(
        "Parsing array of tasks failed:",
        chalk.red(`${e.message}:`),
        chalk.cyan(arrayStr)
      );
      return exit(1);
    }
  }

  if (tasks.length > 1 && tasks[0] !== "." && opts.serial) {
    tasks = ["."].concat(tasks);
  }

  return runner.run(tasks.length === 1 ? tasks[0] : tasks);
}


export default xrun
