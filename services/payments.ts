export type CheckoutBuyer = {
  fullName: string;
  email: string;
  phone: string;
  city?: string;
  country?: string;
  address?: string;
  zipCode?: string;
};

export type CheckoutItem = {
  id: string;
  name: string;
  category: string;
  price: number;
};

export type CheckoutFormInitPayload = {
  amount: number;
  currency?: 'TRY';
  buyer: CheckoutBuyer;
  item: CheckoutItem;
  conversationId?: string;
};

export type CheckoutFormInitResponse = {
  status?: string;
  errorMessage?: string;
  checkoutFormContent?: string;
  token?: string;
  paymentPageUrl?: string;
  conversationId?: string;
};

const PAYMENTS_API_BASE_URL = (import.meta.env.VITE_PAYMENTS_API_URL ?? '').trim();

const buildPaymentsUrl = (path: string) => {
  if (!PAYMENTS_API_BASE_URL) return path;
  return `${PAYMENTS_API_BASE_URL.replace(/\/$/, '')}${path}`;
};

export const createCheckoutForm = async (
  payload: CheckoutFormInitPayload
): Promise<CheckoutFormInitResponse> => {
  const response = await fetch(buildPaymentsUrl('/api/iyzico/checkout-form'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Checkout init failed (${response.status})`);
  }

  return (await response.json()) as CheckoutFormInitResponse;
};
