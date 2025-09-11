import { BalancesConfig, CustomAsset, NETWORKS } from '@getpara/user-management-client';

/**
 * Validates if an object is a valid BalancesConfig
 * @param obj - The object to validate
 * @returns True if the object is a valid BalancesConfig, false otherwise
 */
export function validateBalancesConfig(obj: any): obj is BalancesConfig {
  // Check if obj is an object
  if (!obj || typeof obj !== 'object') {
    return false;
  }

  // Check displayType is valid
  if (!obj.displayType || (obj.displayType !== 'AGGREGATED' && obj.displayType !== 'CUSTOM_ASSET')) {
    return false;
  }

  // Validate AGGREGATED mode
  if (obj.displayType === 'AGGREGATED') {
    // excludeStandardAssets should be boolean if present
    if (obj.excludeStandardAssets !== undefined && typeof obj.excludeStandardAssets !== 'boolean') {
      return false;
    }

    // additionalAssets should be array if present
    if (obj.additionalAssets !== undefined) {
      if (!Array.isArray(obj.additionalAssets)) {
        return false;
      }

      // Validate each additional asset (price required for AGGREGATED mode)
      for (const asset of obj.additionalAssets) {
        if (!validateCustomAsset(asset)) {
          return false;
        }

        // Additional price validation for AGGREGATED mode
        const hasPriceUrl = typeof asset.priceUrl === 'string' && asset.priceUrl.trim();
        const hasPrice =
          asset.price &&
          typeof asset.price === 'object' &&
          typeof asset.price.value === 'number' &&
          asset.price.value > 0 &&
          typeof asset.price.currency === 'string' &&
          asset.price.currency.trim();

        if (!hasPriceUrl && !hasPrice) {
          return false; // Must have at least one price source
        }
        if (hasPriceUrl && hasPrice) {
          return false; // Can't have both price sources
        }
      }
    }

    return true;
  }

  // Validate CUSTOM_ASSET mode
  if (obj.displayType === 'CUSTOM_ASSET') {
    // asset is required for CUSTOM_ASSET mode
    if (!obj.asset) {
      return false;
    }

    if (!validateCustomAsset(obj.asset)) {
      return false;
    }

    // Price validation for CUSTOM_ASSET mode (price not required, but can't have conflicts)
    const hasPriceUrl = typeof obj.asset.priceUrl === 'string' && obj.asset.priceUrl.trim();
    const hasPrice =
      obj.asset.price &&
      typeof obj.asset.price === 'object' &&
      typeof obj.asset.price.value === 'number' &&
      obj.asset.price.value > 0 &&
      typeof obj.asset.price.currency === 'string' &&
      obj.asset.price.currency.trim();

    if (hasPriceUrl && hasPrice) {
      return false; // Can't have both price sources even if not required
    }

    return true;
  }

  return false;
}

/**
 * Validates if an object is a valid CustomAsset
 * @param obj - The object to validate
 * @returns True if the object is a valid CustomAsset, false otherwise
 */
function validateCustomAsset(obj: any): obj is CustomAsset {
  // Check if obj is an object
  if (!obj || typeof obj !== 'object') {
    return false;
  }

  // Check required string fields (must be non-empty)
  if (typeof obj.name !== 'string' || !obj.name.trim() || typeof obj.symbol !== 'string' || !obj.symbol.trim()) {
    return false;
  }

  // Check implementations array exists and has at least one implementation
  if (!Array.isArray(obj.implementations) || obj.implementations.length === 0) {
    return false;
  }

  // Validate each network implementation
  for (const network of obj.implementations) {
    if (!network || typeof network !== 'object') {
      return false;
    }

    // Check network definition (can be string or object)
    if (typeof network.network === 'string') {
      // Standard network - validate it's a valid network from NETWORKS
      if (!NETWORKS.includes(network.network as any)) {
        return false;
      }

      // For standard networks: contractAddress must be a non-empty string
      if (typeof network.contractAddress !== 'string' || !network.contractAddress.trim()) {
        return false;
      }
    } else if (typeof network.network === 'object') {
      // Custom network - validate required fields (must be non-empty)
      if (
        typeof network.network.name !== 'string' ||
        !network.network.name.trim() ||
        typeof network.network.rpcUrl !== 'string' ||
        !network.network.rpcUrl.trim() ||
        typeof network.network.evmChainId !== 'string' ||
        !network.network.evmChainId.trim()
      ) {
        return false;
      }

      // For custom networks: contractAddress can be undefined (native token) or non-empty string
      if (
        network.contractAddress !== undefined &&
        (typeof network.contractAddress !== 'string' || !network.contractAddress.trim())
      ) {
        return false;
      }
    } else {
      return false;
    }
  }

  // Price validation is handled separately in validateBalancesConfig based on displayType

  return true;
}
