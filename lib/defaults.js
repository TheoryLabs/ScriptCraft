import myPkg from '$pkg-manifest'

export default {
  PACKAGE_MANIFEST_FILE_NAMESPACE: `package_script_fields`,
  MANIFEST_SCRIPT_HOOKS_NAMESPACE: `package_script_overrides`,
  SCRIPT_CRAFT_TASKS_NAMESPACE: `🍺`,
  PACKAGE_EXPORTS_NAMESPACE: `${myPkg.name}`,
  NAMESPACE_GROUP_DELIM: '/',
  // NAMESPACE: '/',
  // NS_SEP: '/',
  SERIAL_SIG: '.',
  ANON_SHELL_SIG: ['~$', '~@'],
  ANON_SHELL_OPT_SIG: [`~(`],
  ANON_SHELL_OPT_CLOSE_SIG: [`)$`, ')@'],
  SHELL_FLAGS: ['tty', 'spawn', 'sync', 'noenv', 'npm'],
  STR_ARRAY_SIG: '~[',
  CONCURRENT_SYM: Symbol('concurrent'),
  SERIAL_SYM: Symbol('serial'),
  STOP_SYM: Symbol('xrun.stop')
}
