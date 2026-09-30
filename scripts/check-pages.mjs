import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { setTimeout as delay } from "node:timers/promises"

const TEMPFAIL = 75

function fail(message, code = 1) {
  mkdirSync("validation", { recursive: true })
  writeFileSync("validation/pages.txt", message + "\n")
  console.error(message)
  process.exit(code)
}

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"))
  } catch (err) {
    fail(`cannot read ${path}: ${err.message}`)
  }
}

const publish = readJson("validation/publish.json")
const url = String(publish.url || "").trim()
const commit = String(publish.commit || "").trim()
if (!url || !commit) {
  fail("validation/publish.json must contain url and commit")
}

const marker = `gc-build:${commit}`
let live = false
let lastStatus = "no response"
for (let attempt = 1; attempt <= 12; attempt++) {
  try {
    const response = await fetch(url, { redirect: "follow" })
    const body = await response.text()
    lastStatus = `HTTP ${response.status}`
    if (response.ok && body.includes(marker)) {
      live = true
      break
    }
    if (response.ok) {
      lastStatus = `HTTP ${response.status}, build marker not on the page yet`
    }
  } catch (err) {
    lastStatus = err.message
  }
  await delay(10_000)
}

if (!live) {
  fail(
    `Pages is not serving ${commit} at ${url} (${lastStatus}). Retry without spending an attempt.`,
    TEMPFAIL,
  )
}

let expectations = { must_contain: [], selectors: ["#root"] }
try {
  const parsed = JSON.parse(readFileSync("validation/expectations.json", "utf8"))
  expectations = {
    must_contain: Array.isArray(parsed.must_contain) ? parsed.must_contain : [],
    selectors:
      Array.isArray(parsed.selectors) && parsed.selectors.length > 0
        ? parsed.selectors
        : ["#root"],
  }
} catch {
  // No requirement-specific expectations yet. Smoke-check the app root.
}

let chromium
try {
  ;({ chromium } = await import("playwright"))
} catch (err) {
  fail(
    `playwright is not installed (${err.message}). From the worktree run: npm install && npx playwright install chromium`,
  )
}

const notes = []
const browser = await chromium.launch({ headless: true })
try {
  const page = await browser.newPage()
  page.on("pageerror", (err) => notes.push(`pageerror: ${err.message}`))
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30_000 })
  const text = await page.locator("body").innerText()
  for (const expected of expectations.must_contain) {
    if (!text.includes(String(expected))) {
      notes.push(`missing text: ${expected}`)
    }
  }
  for (const selector of expectations.selectors) {
    const count = await page.locator(String(selector)).count()
    if (count < 1) {
      notes.push(`missing selector: ${selector}`)
    }
  }
} catch (err) {
  notes.push(`playwright: ${err.message}`)
} finally {
  await browser.close()
}

if (notes.length > 0) {
  fail([`validation failed for ${url} at ${commit}`, ...notes].join("\n"))
}

const ok = `pass ${url} ${commit}\n`
mkdirSync("validation", { recursive: true })
writeFileSync("validation/pages.txt", ok)
process.stdout.write(ok)
