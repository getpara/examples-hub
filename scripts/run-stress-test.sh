#!/bin/bash

set -e

export STRESS_TEST_ITERATIONS=${STRESS_TEST_ITERATIONS:-10}
export STRESS_TEST_NETWORK=${STRESS_TEST_NETWORK:-slow-3g}
export STRESS_TEST_JITTER=${STRESS_TEST_JITTER:-false}
export STRESS_TEST_SUITE=${STRESS_TEST_SUITE:-all}
export STRESS_TEST_PORT=${STRESS_TEST_PORT:-3003}
export HEADLESS=${HEADLESS:-true}

echo "🔬 Starting stress test: $STRESS_TEST_ITERATIONS iterations, $STRESS_TEST_NETWORK network, $STRESS_TEST_SUITE suite"
if [ "$STRESS_TEST_JITTER" = "true" ]; then
  echo "⚡ useEffect jitter mode: ENABLED"
else
  echo "⚡ useEffect jitter mode: DISABLED"
fi

if lsof -ti:$STRESS_TEST_PORT > /dev/null 2>&1; then
  lsof -ti:$STRESS_TEST_PORT | xargs kill -9 2>/dev/null || true
  sleep 2
fi

(cd examples/para-modal-stress-testing && STRESS_TEST_JITTER=$STRESS_TEST_JITTER yarn build && PORT=$STRESS_TEST_PORT yarn start) &
SERVER_PID=$!

echo "⏳ Waiting for server to be ready..."
for i in {1..60}; do
  if curl -f http://localhost:$STRESS_TEST_PORT > /dev/null 2>&1; then
    echo "✅ Server ready"
    break
  fi
  sleep 2
done

if ! curl -f http://localhost:$STRESS_TEST_PORT > /dev/null 2>&1; then
  echo "❌ Server failed to start after 2 minutes"
  kill $SERVER_PID 2>/dev/null || true
  exit 1
fi

if [ "$CI" = "true" ]; then
  echo "🔄 CI mode: Preserving existing blob reports for accumulation"
  mkdir -p blob-report
  rm -rf playwright-report
else
  echo "🧹 Local mode: Cleaning previous reports"
  rm -rf blob-report playwright-report
  mkdir -p blob-report
fi

export TEST_TIMESTAMP=$(date -u +"%Y-%m-%dT%H-%M-%S")

for i in $(seq 1 $STRESS_TEST_ITERATIONS); do
  echo "🧪 Iteration $i/$STRESS_TEST_ITERATIONS"
  export ITERATION_ID="$i"
  npx playwright test --config=e2e/stress-test/playwright.config.ts || true
done

kill $SERVER_PID 2>/dev/null || true

echo "📊 Merging reports..."
npx playwright merge-reports --reporter html ./blob-report > /dev/null 2>&1

rm -f blob-report/*.jsonl
rm -rf blob-report/resources

echo "✅ Complete! View report: open playwright-report/index.html"
