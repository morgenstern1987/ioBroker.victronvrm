# Owner Handover (ioBroker.victronvrm)

## Scope
This handover covers the official-readiness updates prepared on branch:

- `fix/overall-stats-api-keys`
- Latest commit: `41e0aad` (`chore: improve ioBroker official readiness`)
- Fork branch pushed: `gregor-samosir/ioBroker.victronvrm:fix/overall-stats-api-keys`

## What was changed
- Updated workflows to align with ioBroker expected structure:
  - `.github/workflows/test-and-release.yml` (check-and-lint, adapter-tests, deploy, tags, concurrency)
  - `.github/workflows/node.js.yml` Node matrix to `20.x, 22.x, 24.x`
- Updated metadata/dependencies for repository checks:
  - `package.json` (`engines.node >=20`, updated ioBroker/release/testing toolchain versions)
  - `io-package.json` (`globalDependencies.admin >=7.6.20`, cleaned schema usage)
  - moved `encryptedNative`/`protectedNative` to top-level
- Updated admin config responsiveness:
  - `admin/jsonConfig.json` (`xs/sm/md/lg/xl` sizes added)
- Updated docs/install hints:
  - `README.md` (no direct npm install instructions)
- Added `.commitinfo` to `.gitignore`
- Consistency cleanup:
  - removed unused time helpers in `main.js`
  - corrected sensor wording/count references in docs/tests

## Local verification (done)
- `npm run lint` passed
- `npm test` passed
- `npx @iobroker/repochecker ... --local` now mainly reports external/process items

## Remaining owner-only steps
1. **Review + merge PR in upstream repo**
   - PR create link:
     - `https://github.com/gregor-samosir/ioBroker.victronvrm/pull/new/fix/overall-stats-api-keys`
2. **Publish npm package as package owner**
   - Package name: `iobroker.victronvrm`
   - Requires owner npm credentials and `iobroker` org owner setup.
3. **Add adapter to `ioBroker.repositories` (latest)**
   - Via web (`iobroker.dev`) or PR to `ioBroker/ioBroker.repositories`.

## Suggested owner command sequence
```bash
# In upstream local clone after merge or on release branch
npm ci
npm run lint
npm test

# Authenticate as package owner
npm whoami
npm publish
```

## Suggested PR text (upstream)
Title:
`chore: improve ioBroker official readiness`

Body:
- align GitHub workflows with ioBroker expected jobs/triggers
- update adapter metadata and dependency minimums
- fix io-package schema placement for encrypted/protected native fields
- add responsive sizing to jsonConfig controls
- update README installation guidance for repo-check compliance
- keep lint/tests green

## Suggested PR text (ioBroker.repositories latest)
Title:
`Add victronvrm to latest repository`

Body:
- Adapter: `victronvrm`
- Type: `energy`
- Repo: `https://github.com/morgenstern1987/ioBroker.victronvrm`
- npm: `https://www.npmjs.com/package/iobroker.victronvrm`
- Admin3/jsonConfig: included
- CI: test-and-release workflow included
- Note: Prepared and verified for ioBroker repo-check expectations

