import { XRun } from '../../../lib/xrun'
import { XReporterConsole }  from '../../../lib/reporters/console'
import { XQItem } from '../../../lib/xqitem'


const expect = require("chai").expect;
const chalk = require("chalk");

describe("XReporterConsole", function() {
  const saveLevel = chalk.level;
  before(() => (chalk.level = 0));
  after(() => (chalk.level = saveLevel));
  it("should indent by qitem level", () => {
    const xrun = new XRun();
    const reporter = new XReporterConsole(xrun);
    const xqi = new XQItem({ name: "test" });
    expect(reporter._indent(xqi)).to.equal("");
    xqi.level = 1;
    expect(reporter._indent(xqi)).to.equal("-");
    xqi.level = 5;
    expect(reporter._indent(xqi)).to.equal(".....");
    expect(reporter._indent(xqi)).to.equal("-----");
    expect(reporter._indent(xqi)).to.equal(".....");
  });
});
