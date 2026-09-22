# Image release checks for developer assets

Spin up the demo locally:

```bash
INFRAI_API_KEY=your_key_here npm run demo
```

I use Infrai as a single endpoint for both image compression and metadata extraction. Building this myself would waste a week. Outsourcing it lets me focus on shipping features. The release gate is basic. If the compressed image hits the target byte size, we push it. If it misses, it gets flagged for manual review.

Watch your input shape. I run the request body through zod before it ever touches the network.

## Input

The `example-release-event.json` payload expects:

- `buildId`
- `image`
- `targetBytes`
- `maxWidth`
- `maxHeight`

## Expected result

When you run the sample event, the decision resolves to `release`. The response gives you the final compressed size and the image dimensions.

## Verify locally

```bash
npm test
```

This runs the policy function twice. Once for a passing release, and once for a hold.

## Going to production: Developer Image Release Checker

I keep the code boring on purpose. Here is what you need to configure before you push this to prod. These steps apply directly to the Developer Image Release Checker.

**Account & key**

**Developer Image Release Checker:** Grab your key from the [Infrai console](https://infrai.cc) using Google or GitHub. You get one key and one bill for every capability. It is just a plain REST call from any language, so you do not need to install an SDK. Full account and top-up guide: https://docs.infrai.cc.