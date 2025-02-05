import { CloudStorageKey, CloudStorageValue, telegramCloudStorage } from "./telegramCloudStorage";

const INITIAL_CHUNK_COUNT = 32;
const MAX_RETRIES = 256;

export type LogFunction = (message: string) => void;
export type ErrorHandler = (errorMessage: string) => void;

const storeWithChunking = async (
  key: CloudStorageKey,
  value: CloudStorageValue,
  handleError: ErrorHandler
): Promise<number> => {
  const store = (k: CloudStorageKey, v: CloudStorageValue): Promise<void> => {
    return new Promise((resolve, reject) => {
      telegramCloudStorage.setItem(k, v, (error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  };

  const storeChunks = async (baseKey: CloudStorageKey, chunks: string[], depth: number = 0): Promise<number> => {
    if (depth > MAX_RETRIES) {
      throw new Error(`Failed to store after ${MAX_RETRIES} splitting attempts`);
    }

    const failedChunks: { index: number; value: string }[] = [];

    await Promise.all(
      chunks.map(async (chunk, index) => {
        const chunkKey = `${baseKey}_chunk_${index}`;
        try {
          await store(chunkKey, chunk);
        } catch (error) {
          failedChunks.push({ index, value: chunk });
        }
      })
    );

    if (failedChunks.length === 0) {
      return chunks.length;
    }

    const newChunks: string[] = chunks.filter((_, index) => !failedChunks.some((fc) => fc.index === index));

    for (const { value } of failedChunks) {
      const midPoint = Math.ceil(value.length / 2);
      newChunks.push(value.slice(0, midPoint), value.slice(midPoint));
    }

    return storeChunks(baseKey, newChunks, depth + 1);
  };

  try {
    const initialChunkSize = Math.ceil(value.length / INITIAL_CHUNK_COUNT);
    const initialChunks = Array.from({ length: INITIAL_CHUNK_COUNT }, (_, i) =>
      value.slice(i * initialChunkSize, (i + 1) * initialChunkSize)
    ).filter((chunk) => chunk.length > 0);

    const totalChunks = await storeChunks(key, initialChunks);
    await store(`${key}_meta`, JSON.stringify({ totalChunks }));
    return totalChunks;
  } catch (error) {
    handleError(`Failed to store "${key}": ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
};

const retrieveChunkedData = async (
  key: CloudStorageKey,
  log: LogFunction,
  handleError: ErrorHandler
): Promise<CloudStorageValue | undefined> => {
  const retrieve = (k: CloudStorageKey): Promise<CloudStorageValue | undefined> => {
    return new Promise((resolve, reject) => {
      telegramCloudStorage.getItem(k, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      });
    });
  };

  try {
    const metaData = await retrieve(`${key}_meta`);

    if (!metaData) {
      return undefined;
    }
    const { totalChunks } = JSON.parse(metaData) as { totalChunks: number };
    log(`Retrieving data for "${key}" (${totalChunks} chunks)`);
    await new Promise((resolve) => setTimeout(resolve, 250));

    const chunks = await Promise.all(
      Array.from({ length: totalChunks }, async (_, i) => {
        const chunk = await retrieve(`${key}_chunk_${i}`);
        return chunk || "";
      })
    );

    const data = chunks.join("");
    log(`Successfully retrieved and recombined data for "${key}"`);
    await new Promise((resolve) => setTimeout(resolve, 500));

    return data;
  } catch (error) {
    handleError(`Failed to retrieve data for "${key}": ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
};

const clearChunkedStorage = async (log: LogFunction, handleError: ErrorHandler): Promise<void> => {
  try {
    log("Starting storage clearance...");
    await new Promise((resolve) => setTimeout(resolve, 500));
    const keys = await new Promise<CloudStorageKey[]>((resolve, reject) => {
      telegramCloudStorage.getKeys((error, result) => {
        if (error) reject(error);
        else resolve(result || []);
      });
    });

    const keyGroups: Record<string, string[]> = {};
    keys.forEach((key) => {
      const baseKey = key.endsWith("_meta") ? key.replace("_meta", "") : key;
      if (!keyGroups[baseKey]) keyGroups[baseKey] = [];
      keyGroups[baseKey].push(key);
    });

    await Promise.all(
      Object.entries(keyGroups).map(async ([baseKey, groupKeys]) => {
        if (groupKeys.includes(`${baseKey}_meta`)) {
          const metaData = await new Promise<string | undefined>((resolve, reject) => {
            telegramCloudStorage.getItem(`${baseKey}_meta`, (error, result) => {
              if (error) reject(error);
              else resolve(result);
            });
          });

          if (metaData) {
            const { totalChunks } = JSON.parse(metaData);
            groupKeys.push(...Array.from({ length: totalChunks }, (_, i) => `${baseKey}_chunk_${i}`));
          }
        }

        await new Promise<void>((resolve, reject) => {
          telegramCloudStorage.removeItems(groupKeys, (error) => {
            if (error) reject(error);
            else resolve();
          });
        });
      })
    );

    log("Storage cleared successfully");
    await new Promise((resolve) => setTimeout(resolve, 500));
  } catch (error) {
    handleError(`Error clearing storage: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
};

export { storeWithChunking, retrieveChunkedData, clearChunkedStorage };
