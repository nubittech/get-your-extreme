export type QrCodeRecord = {
  id: string;
  key: string;
  url: string;
  dataUrl: string;
  updatedAt: string;
};

export type QrCodeUpsertInput = {
  key: string;
  url: string;
  dataUrl: string;
};
