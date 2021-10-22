import cli from '../cli'

let _cli
try {
  _cli = cli()
  return _cli
}
catch(err) {
  console.error(err)
  throw err
}
finally {
  console.log(_cli)
}
