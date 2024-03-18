// ANY CHANGES TO THIS FILE REQUIRE A REBUILD OF THE WORKER
// FILE IN THE PORTAL!
// run `yarn build` to rebuild the worker file

// leaving this for now as we don't want to export all walletUtils function from web-sdk
import { Message, handleMessage } from '@usecapsule/web-sdk/dist/workers/worker';

addEventListener('message', async (e: { data: Message }) => {
  const skipClose = await handleMessage(e, self.postMessage);
  if (skipClose) {
    return;
  }
  self.close();
});
