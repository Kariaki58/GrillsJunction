'use client';

import { PAYMENT_DETAILS } from '@/lib/payment';
import { CopyButton } from '@/components/ui/copy-button';

const rows = [
  { label: 'Account number', value: PAYMENT_DETAILS.accountNumber },
  { label: 'Bank', value: PAYMENT_DETAILS.bank },
  { label: 'Account name', value: PAYMENT_DETAILS.accountName },
] as const;

export function PaymentDetails() {
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Transfer the exact order total to the account below, then confirm payment below.
      </p>
      {rows.map((row) => (
        <div
          key={row.label}
          className="flex items-center justify-between gap-3 rounded-2xl bg-muted border border-border px-4 py-3"
        >
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {row.label}
            </p>
            <p className="font-bold truncate">{row.value}</p>
          </div>
          <CopyButton value={row.value} label={row.label} />
        </div>
      ))}
    </div>
  );
}
