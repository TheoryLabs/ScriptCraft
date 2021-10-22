import assert from 'assert'

import defaults from '$constants'
import {NSOrder} from '$namespace-order'

class XTasks {
  constructor(namespace, tasks) {
    this._tasks = {[defaults.SCRIPT_CRAFT_TASKS_NAMESPACE]: {}}
    this._nsOrder = new NSOrder()
    if (namespace) {
      this.load(namespace, tasks)
    } else {
      this._namespaces = [defaults.SCRIPT_CRAFT_TASKS_NAMESPACE]
    }
  }

  load(namespace, tasks, priority = 1) {
    let overrides
    if (tasks === undefined) {
      tasks = namespace
      namespace = defaults.SCRIPT_CRAFT_TASKS_NAMESPACE
    } else if (typeof namespace === 'object') {
      overrides = namespace.overrides
      namespace = namespace.namespace
    }

    assert(tasks && typeof tasks === 'object', 'Invalid tasks')

    if (this._tasks[namespace] === undefined) {
      this._tasks[namespace] = {}
    }

    if (namespace !== defaults.SCRIPT_CRAFT_TASKS_NAMESPACE) {
      this._nsOrder.add(namespace, overrides, priority)
    }

    this._namespaces = [defaults.SCRIPT_CRAFT_TASKS_NAMESPACE].concat(this._nsOrder._namespaces)

    Object.assign(this._tasks[namespace], tasks)
  }

  count() {
    return this._namespaces.reduce((x, ns) => {
      return x + Object.keys(this._tasks[ns]).length
    }, 0)
  }

  names(ns) {
    return (ns || this._namespaces).reduce((x, ns) => {
      return x.concat(Object.keys(this._getNsTasks(ns)))
    }, [])
  }

  fullNames(ns) {
    return (ns || this._namespaces).reduce((x, ns) => {
      const nsTasks = this._getNsTasks(ns)
      return x.concat(
        Object.keys(nsTasks).map(t =>
          ns === defaults.SCRIPT_CRAFT_TASKS_NAMESPACE
            ? `${defaults.NAMESPACE_GROUP_DELIM}${t}`
            : `${ns}${defaults.NAMESPACE_GROUP_DELIM}${t}`
        )
      )
    }, [])
  }

  lookup(name) {
    const invalidName = 'Empty task name is invalid'
    assert(name, invalidName)
    name = name.trim()

    let optional = false
    // If there's a prefix ? then the execution is optional
    if (name.startsWith('?')) {
      optional = true
      name = name.substr(1).trim()
    }
    assert(name, invalidName)
    let res = {name}
    const nsSepIdx = name.indexOf(defaults.NAMESPACE_GROUP_DELIM)
    // no NS_SEP found
    if (nsSepIdx < 0) {
      res = this._searchNamespaces(name)
    } else {
      if (nsSepIdx === 0) {
        res.ns = defaults.SCRIPT_CRAFT_TASKS_NAMESPACE
        res.name = name.substr(1)
      } else {
        res.ns = name.substring(0, nsSepIdx).trim()
        assert(res.ns, `Invalid namespace in task name ${name}`)
        res.name = name.substring(nsSepIdx + 1)
      }
      const nsTasks = this._getNsTasks(res.ns)
      assert(res.name, `Empty task name from '${name}' is invalid`)
      res.item = nsTasks[res.name]
    }
    if (!res.item) {
      const opt = optional ? 'Optional ' : ''
      const err = new Error(
        `${opt}Task ${res.name}${res.ns ? ' in namespace ' + res.ns : ''} not found`
      )
      err.optional = optional
      err.res = res
      err.code = 'TASK_NOT_FOUND'
      throw err
    }
    return res
  }

  hasFinally() {
    for (const ns of this._namespaces) {
      const tasks = this._tasks[ns]
      for (const name in tasks) {
        if (tasks[name].hasOwnProperty('finally')) {
          return true
        }
      }
    }
    return false
  }

  _getNsTasks(ns) {
    const x = this._tasks[ns]
    assert(x, `No task namespace ${ns} exist`)
    return x
  }

  _searchNamespaces(name) {
    const ns = this._namespaces
    for (var i = 0; i < ns.length; i++) {
      const x = this._tasks[ns[i]][name]
      if (x) {
        return {ns: ns[i], name, item: x, search: true}
      }
    }
    return {name}
  }
}

export {XTasks}
