import myPkg from '$pkg-manifest'


export default {
  taskFile: "xrun-tasks.js",
  taskFileExt: ["js", "ts"],
  search: ["xrun-tasks", "scx", "xrun", "xclap.", "clapfile.", "clap.", "gulpfile."],
  getPkgOpt: pkg => ["xclap", "scx", myPkg.name].find(f => pkg.hasOwnProperty(f))
}
