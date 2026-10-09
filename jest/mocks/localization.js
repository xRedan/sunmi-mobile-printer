const fs = require('node:fs')
const path = require('node:path')

const decode = (text) =>
  text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/\\n/g, '\n')
    .replace(/\\'/g, "'")
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\')

const load = (directory) => {
  const xml = fs.readFileSync(
    path.join(
      __dirname,
      '../../android/app/src/main/res',
      directory,
      'strings.xml',
    ),
    'utf8',
  )
  const strings = Object.fromEntries(
    [...xml.matchAll(/<string name="([^"]+)"[^>]*>([\s\S]*?)<\/string>/g)].map(
      ([, key, value]) => [key, decode(value)],
    ),
  )
  const plurals = Object.fromEntries(
    [...xml.matchAll(/<plurals name="([^"]+)">([\s\S]*?)<\/plurals>/g)].map(
      ([, key, body]) => [
        key,
        Object.fromEntries(
          [
            ...body.matchAll(/<item quantity="([^"]+)">([\s\S]*?)<\/item>/g),
          ].map(([, quantity, value]) => [quantity, decode(value)]),
        ),
      ],
    ),
  )
  return { strings, plurals }
}

const resources = {
  ja: load('values'),
  jaExplicit: load('values-ja'),
  en: load('values-en'),
}
const subscribers = new Set()
let locale = 'ja-JP'
const current = () => resources[locale.startsWith('en') ? 'en' : 'ja']
const getResources = () => ({ locale, strings: current().strings })

const setLocale = (value) => {
  locale = value
  for (const subscriber of subscribers) subscriber(getResources())
}

module.exports = {
  __esModule: true,
  default: {
    getResources,
    getQuantityString: (name, count) => {
      const values = current().plurals[name]
      return count === 1 && values.one ? values.one : values.other
    },
    onResourcesChanged: (listener) => {
      subscribers.add(listener)
      return { remove: () => subscribers.delete(listener) }
    },
  },
  setLocale,
  resources,
}
