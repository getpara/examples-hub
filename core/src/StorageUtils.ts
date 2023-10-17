/*
 * Base class for storage.
 *
 * This class will eventually not be exported.
 * Clients of this library should not use it.
 * @internal
 */
export interface StorageUtils {
    /**
     * Retrieves a stored value.
     *
     * Returns undefined if the key does not exist.
     */
    get(key: string): Promise<string | null> | string | null,

    /**
     * Stores a value.
     */
    set(key: string, value?: string): Promise<void> | void,

    /**
     * Removes a single value from storage.
     */
    removeItem(key: string): Promise<void> | void,

    /**
     * Remove all items from storage that start with `prefix`.
     */
    clear(prefix: string): Promise<void> | void,
}
