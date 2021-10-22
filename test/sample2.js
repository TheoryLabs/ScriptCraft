import xrun from '..'

xrun.load({
  foo2: {
    dep: "echo foo2-dep",
    task: "echo this is foo2"
  }
});
xrun.run("foo2");
