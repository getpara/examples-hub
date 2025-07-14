# Failing Projects Checklist

## Critical Issues (Multiple Failures)

### [ ] server/with-bun
- [ ] Build failed
- [ ] Lint failed
- [ ] Typecheck failed

### [ ] server/with-node
- [ ] Build failed  
- [ ] Lint failed
- [ ] Typecheck failed

### [ ] web/with-react-nextjs/connector-reown-appkit
- [x] Build failed
- [x] Typecheck failed

### [ ] web/with-react-nextjs/connector-wagmi
- [x] Build failed
- [x] Typecheck failed

## Build Only Issues

### [ ] server/with-bun/test-ui
- [ ] Build failed
- [ ] Lint failed

### [ ] server/with-deno/test-ui
- [ ] Build failed
- [ ] Lint failed

### [ ] server/with-node/test-ui
- [ ] Build failed
- [ ] Lint failed

### [ ] specialized/with-bulk-pregen
- [ ] Build failed

### [ ] specialized/with-telegram-web-app
- [ ] Build failed

### [ ] web/with-react-nextjs/para-modal-cosmos
- [ ] Build failed

### [ ] web/with-react-nextjs/para-modal-multichain
- [ ] Build failed

### [ ] web/with-react-nextjs/para-pregen-claim
- [ ] Build failed

### [ ] web/with-react-nextjs/signer-solana-signers-v2
- [ ] Build failed

### [ ] web/with-react-nextjs/smart-wallet-alchemy
- [ ] Build failed

## Typecheck Only Issues

### [ ] mobile/with-expo
- [ ] Typecheck failed

### [ ] specialized/with-squid-router-api
- [ ] Typecheck failed

## Summary

- **Total failing projects:** 16
- **Build failures:** 14 projects
- **Lint failures:** 5 projects  
- **Typecheck failures:** 6 projects
- **Server projects:** All server projects are failing (likely environment/dependency issues)
- **React Next.js projects:** 8 out of 21 failing (mixed issues)

## Priority Order

1. **Fix server environment issues first** (affects 5 projects)
2. **Fix React Next.js connector projects** (likely dependency conflicts)
3. **Address individual build failures**
4. **Fix remaining typecheck issues**