import { OnRampConfig, OnRampPurchase, OnRampPurchaseUpdateParams } from '@getpara/user-management-client';
import { OfframpDepositRequest } from '@getpara/core-sdk';

export type PortalMessageType =
  | 'ONRAMPS__INIT'
  | 'ONRAMPS__UPDATE_PURCHASE'
  | 'ONRAMPS__SIGN_MOONPAY_URL'
  | 'ONRAMPS__SIGN_DEPOSIT_TX';

export type PortalMessageStatus = 'ERROR' | 'SUCCESS';

export type PortalRequestPayload<T extends PortalMessageType> = T extends 'ONRAMPS__UPDATE_PURCHASE'
  ? {
      updates: OnRampPurchaseUpdateParams;
      depositRequest?: OfframpDepositRequest;
    }
  : T extends 'ONRAMPS__SIGN_MOONPAY_URL'
    ? {
        url: string;
      }
    : T extends 'ONRAMPS__SIGN_DEPOSIT_TX'
      ? {
          depositRequest: OfframpDepositRequest;
        }
      : never;

export type PortalRequest = { isPara: boolean; id: string; status?: undefined } & (
  | {
      type: 'ONRAMPS__INIT';
      payload?: undefined;
    }
  | {
      type: 'ONRAMPS__UPDATE_PURCHASE';
      payload: PortalRequestPayload<'ONRAMPS__UPDATE_PURCHASE'>;
    }
  | {
      type: 'ONRAMPS__SIGN_MOONPAY_URL';
      payload: PortalRequestPayload<'ONRAMPS__SIGN_MOONPAY_URL'>;
    }
  | {
      type: 'ONRAMPS__SIGN_DEPOSIT_TX';
      payload: PortalRequestPayload<'ONRAMPS__SIGN_DEPOSIT_TX'>;
    }
);

export type PortalResponsePayload<T extends PortalMessageType> = T extends 'ONRAMPS__INIT'
  ? {
      onRampPurchase: OnRampPurchase;
      onRampConfig: OnRampConfig;
    }
  : T extends 'ONRAMPS__UPDATE_PURCHASE'
    ? { onRampPurchase: OnRampPurchase }
    : T extends 'ONRAMPS__SIGN_MOONPAY_URL'
      ? { signature: string }
      : T extends 'ONRAMPS__SIGN_DEPOSIT_TX'
        ? { txHash: string; onRampPurchase: OnRampPurchase }
        : never;

export type PortalResponse = { id: string; status: PortalMessageStatus; type: PortalMessageType } & (
  | {
      status: 'ERROR';
      payload: { error: string };
    }
  | {
      status: 'SUCCESS';
      type: 'ONRAMPS__INIT';
      payload: PortalResponsePayload<'ONRAMPS__INIT'>;
    }
  | {
      status: 'SUCCESS';
      type: 'ONRAMPS__UPDATE_PURCHASE';
      payload: PortalResponsePayload<'ONRAMPS__UPDATE_PURCHASE'>;
    }
  | {
      status: 'SUCCESS';
      type: 'ONRAMPS__SIGN_MOONPAY_URL';
      payload: PortalResponsePayload<'ONRAMPS__SIGN_MOONPAY_URL'>;
    }
  | {
      status: 'SUCCESS';
      type: 'ONRAMPS__SIGN_DEPOSIT_TX';
      payload: PortalResponsePayload<'ONRAMPS__SIGN_DEPOSIT_TX'>;
    }
);
