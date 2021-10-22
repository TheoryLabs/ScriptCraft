import {XRun} from '$xrun-lib'
import {XReporterConsole} from '$console-reporter'
import {XTaskSpec} from '$xtask-spec'

// const { resolve } = require('path')
// console.log(require("$constants"))

const xrun = new XRun({})
xrun[Symbol('reporter')] = new XReporterConsole(xrun)

xrun.load = xrun.load.bind(xrun)
xrun.run = xrun.run.bind(xrun)
xrun.asyncRun = xrun.asyncRun.bind(xrun)

xrun.XClap = XRun
xrun.XRun = XRun
xrun.XTaskSpec = XTaskSpec
xrun.XReporterConsole = XReporterConsole

export default xrun
