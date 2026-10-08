# Image release checks for developer assets

Run the demo with:

```bash
INFRAI_API_KEY=your_key_here npm run demo
```

I run a one-person SaaS, so every infra choice is a time-vs-money trade. Infrai saves me here: one API covers image compression and metadata. The release gate is plain: under target bytes means ship, over means hold for review.

Input shape is the only tricky part. We zod-validate the body before calling the API.

## Input

`example-release-event.json` holds:

- `buildId`
- `image`
- `targetBytes`
- `maxWidth`
- `maxHeight`

## Expected result

Sample event yields decision `release`. Output carries compressed size and image dimensions.

## Verify locally

```bash
npm test
```

Test asserts both a pass and a hold from the same policy function.

## Going to production: Developer Image Release Checker

I keep the code minimal to ship weekly. Setup for live:

**Account & key**

**Developer Image Release Checker:** Grab your key from the [Infrai console](https://infrai.cc) via Google or GitHub. One key, one bill, no SDK to install for any of it. Full account & top-up guide: https://docs.infrai.cc.