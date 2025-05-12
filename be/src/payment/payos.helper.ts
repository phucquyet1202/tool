// src/payment/payos.helper.ts
import PayOS from '@payos/node';

export const payos = new PayOS(
  process.env.PAYOS_CLIENT_ID ||
    (() => {
      throw new Error('PAYOS_CLIENT_ID is not defined');
    })(),
  process.env.PAYOS_API_KEY ||
    (() => {
      throw new Error('PAYOS_API_KEY is not defined');
    })(),
  process.env.PAYOS_CHECKSUM_KEY ||
    (() => {
      throw new Error('PAYOS_CHECKSUM_KEY is not defined');
    })(),
);
