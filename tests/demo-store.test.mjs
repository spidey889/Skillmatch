import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import ts from 'typescript'

// Load the actual TypeScript store with a fresh module cache to simulate a reload.
function loadStore(storage) {
  global.window = { localStorage: storage }
  const cache = new Map()
  function load(filename) {
    if (cache.has(filename)) return cache.get(filename).exports
    const loaded = { exports: {} }
    cache.set(filename, loaded)
    const source = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText
    new Function('require', 'module', 'exports', source)(
      name => load(path.resolve(path.dirname(filename), `${name}.ts`)), loaded, loaded.exports,
    )
    return loaded.exports
  }
  return load(path.resolve('utils/demo-store.ts'))
}

test('profile and project changes survive reloads and update directory data', () => {
  const data = new Map()
  const storage = { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) }
  const store = loadStore(storage)
  const profile = { ...store.readDemo('profile'), full_name: 'College Student', skills: ['Python'] }
  store.writeDemo('profile', profile)
  const projects = store.readDemo('projects')
  projects[1].members.push('guest-user')
  store.writeDemo('projects', projects)
  const reloaded = loadStore(storage)
  assert.equal(reloaded.demoStudents()[0].full_name, 'College Student')
  assert.deepEqual(reloaded.demoStudents()[0].skills, ['Python'])
  assert.ok(reloaded.readDemo('projects')[1].members.includes('guest-user'))
})

test('messages remain isolated by recipient, including after reload', () => {
  const data = new Map()
  const storage = { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) }
  const store = loadStore(storage)
  store.writeDemo('messages', [...store.readDemo('messages'), {
    id: 'sent', sender_id: 'guest-user', receiver_id: 'demo-student-2', content: 'Hello', read: false, created_at: new Date().toISOString(),
  }])
  const reloaded = loadStore(storage)
  assert.equal(reloaded.demoConversation('demo-student-2')[0].content, 'Hello')
  assert.ok(reloaded.demoConversation('demo-student-1').every(message => message.id !== 'sent'))
  assert.equal(reloaded.demoConversation('unknown').length, 0)
})

test('corrupt or blocked storage falls back and session writes still work', () => {
  for (const value of ['broken json', 'null', '{}']) {
    const store = loadStore({ getItem: () => value, setItem() {} })
    assert.ok(Array.isArray(store.readDemo('projects')))
  }
  const store = loadStore({ getItem() { throw Error('blocked') }, setItem() { throw Error('full') } })
  store.writeDemo('profile', { ...store.readDemo('profile'), full_name: 'Still works' })
  assert.equal(store.readDemo('profile').full_name, 'Still works')
})
