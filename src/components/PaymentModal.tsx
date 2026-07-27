import { useState } from 'react';
import { X, CreditCard, Lock, CheckCircle2, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useLang } from '@/context/LanguageContext';

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  itemType: 'tool' | 'plan';
  itemId: string | null;
  itemName: string;
  amount: number;
  onSuccess?: () => void;
}

export default function PaymentModal({
  open,
  onClose,
  itemType,
  itemId,
  itemName,
  amount,
  onSuccess,
}: PaymentModalProps) {
  const { session, refreshProfile } = useAuth();
  const { t } = useLang();
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  function formatCardNumber(value: string): string {
    const digits = value.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  }

  function formatExpiry(value: string): string {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  }

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (cardNumber.replace(/\s/g, '').length < 16) {
      setError('Please enter a valid card number');
      return;
    }
    if (!cardName.trim()) {
      setError('Please enter the cardholder name');
      return;
    }
    if (expiry.length < 5) {
      setError('Please enter a valid expiry date');
      return;
    }
    if (cvv.length < 3) {
      setError('Please enter a valid CVV');
      return;
    }
    if (!session?.user) {
      setError('Please sign in first');
      return;
    }

    setProcessing(true);

    // Record the purchase in the database
    const { error: insertError } = await supabase.from('purchases').insert({
      user_id: session.user.id,
      item_type: itemType,
      item_id: itemType === 'tool' ? itemId : null,
      amount,
      currency: 'USD',
      payment_method: 'Visa',
      status: 'completed',
      card_last4: cardNumber.replace(/\s/g, '').slice(-4),
    });

    setProcessing(false);

    if (insertError) {
      setError('Payment failed. Please try again.');
      return;
    }

    // If purchasing Pro plan, upgrade the user's profile
    if (itemType === 'plan') {
      await supabase
        .from('profiles')
        .update({ plan: 'pro' })
        .eq('id', session.user.id);
      await refreshProfile();
    }

    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setCardNumber('');
      setCardName('');
      setExpiry('');
      setCvv('');
      onSuccess?.();
      onClose();
    }, 2000);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass-strong rounded-2xl shadow-glass w-full max-w-md p-6 animate-fade-in-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 btn-ghost !p-1.5"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {success ? (
          <div className="text-center py-8">
            <div className="grid place-items-center w-16 h-16 rounded-full bg-accent-100 dark:bg-accent-900/40 text-accent-600 dark:text-accent-400 mx-auto mb-4 animate-fade-in-up">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold">{t('payment.success')}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{itemName}</p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-1">
              <div className="grid place-items-center w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 text-white">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold">{t('payment.title')}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{itemName}</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl glass mt-4 mb-4">
              <span className="text-sm font-medium">{t('payment.total')}</span>
              <span className="text-2xl font-extrabold bg-gradient-to-r from-brand-600 to-accent-600 bg-clip-text text-transparent">
                ${amount.toFixed(2)}
              </span>
            </div>

            <form onSubmit={handlePay} className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1.5">{t('payment.cardNumber')}</label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    placeholder={t('payment.cardNumberPlaceholder')}
                    className="input !pl-10 font-mono"
                    inputMode="numeric"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium block mb-1.5">{t('payment.cardName')}</label>
                <input
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder={t('payment.cardNamePlaceholder')}
                  className="input uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium block mb-1.5">{t('payment.expiry')}</label>
                  <input
                    value={expiry}
                    onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                    placeholder={t('payment.expiryPlaceholder')}
                    className="input font-mono"
                    inputMode="numeric"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1.5">{t('payment.cvv')}</label>
                  <input
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder={t('payment.cvvPlaceholder')}
                    className="input font-mono"
                    inputMode="numeric"
                  />
                </div>
              </div>

              {error && (
                <div className="text-sm text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 rounded-lg p-3">
                  {error}
                </div>
              )}

              <button type="submit" disabled={processing} className="btn-primary w-full">
                {processing ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t('payment.processing')}
                  </span>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    {t('payment.payNow')} ${amount.toFixed(2)}
                  </>
                )}
              </button>

              <p className="text-xs text-slate-400 text-center flex items-center justify-center gap-1">
                <Lock className="w-3 h-3" />
                {t('payment.secure')}
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
