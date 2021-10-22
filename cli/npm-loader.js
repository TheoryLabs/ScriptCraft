import chalk from 'chalk'
import readPkgUp from 'read-pkg-up'

import myPkg from '$pkg-manifest'
import config from '$config'
import defaults from '$constants'
import { logger } from '$logger'


export default (xrun, options) => {
  const readPkg = readPkgUp.sync();

  if (!readPkg) {
    return;
  }

  const Pkg = readPkg.packageJson;

  const pkgName = chalk.magenta(readPkg.path.replace(process.cwd(), "CWD"));

  if (Pkg.scripts && options.npm !== false) {
    const scripts = {};
    for (const k in Pkg.scripts) {
      if (!k.startsWith("pre") && !k.startsWith("post")) {
        const pre = `pre${k}`;
        const post = `post${k}`;
        scripts[k] = xrun.serial(
          Pkg.scripts.hasOwnProperty(pre) && pre,
          xrun.exec(Pkg.scripts[k], `${defaults.PACKAGE_MANIFEST_FILE_NAMESPACE}`),
          Pkg.scripts.hasOwnProperty(post) && post
        );
      } else {
        scripts[k] = xrun.exec(Pkg.scripts[k], `${defaults.PACKAGE_MANIFEST_FILE_NAMESPACE}`);
      }
    }
    xrun.load(`${defaults.PACKAGE_MANIFEST_FILE_NAMESPACE}`, scripts);
    logger.log(`Loaded npm package scripts from ${pkgName} into namespace ${chalk.magenta(defaults.PACKAGE_MANIFEST_FILE_NAMESPACE)}`);
  }

  const pkgOptField = config.getPkgOpt(Pkg);
  const pkgConfig = pkgOptField && Pkg[pkgOptField];

  if (pkgConfig) {
    const tasks = Object.assign({}, pkgConfig.tasks);
    if (Object.keys(tasks).length > 0) {
      xrun.load(`${defaults.MANIFEST_SCRIPT_HOOKS_NAMESPACE}`, tasks);
      logger.log(
        `Loaded ${myPkg.name} tasks from ${pkgName} into namespace ${chalk.magenta(`${defaults.MANIFEST_SCRIPT_HOOKS_NAMESPACE}`)}`
      );
    }
  }
};
