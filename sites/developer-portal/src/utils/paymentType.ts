type PaymentTypeConfig = {
  label: string;
  buttonText: string;
};

export const getPaymentTypeConfig = (type: string): PaymentTypeConfig => {
  switch (type) {
    case 'card': {
      return { label: 'Card', buttonText: 'Update Card' };
    }
    case 'us_bank_account': {
      return { label: 'Bank Account', buttonText: 'Update Account' };
    }
    default: {
      return { label: 'Billing Details', buttonText: 'Update Payment' };
    }
  }
};

export const CARD_NAMES: Record<string, string> = {
  amex: 'American Express',
  diners: "Diner's Club",
  discover: 'Discover',
  eftpos_au: 'EFTPOS',
  jcb: 'JCB',
  mastercard: 'Mastercard',
  unionpay: 'UnionPay',
  visa: 'Visa',
  unknown: 'Unknown',
};
