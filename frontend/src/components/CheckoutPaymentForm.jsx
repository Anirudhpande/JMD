import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Check, ShieldCheck, AlertCircle } from 'lucide-react';

export default function CheckoutPaymentForm({
  subtotal,
  vat,
  shipping,
  total,
  paymentMethod,
  customerDetails,
  cart,
  clearCart,
  onSuccess,
  onError
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [stripeError, setStripeError] = useState('');

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setStripeError('');

    const orderData = {
      user_id: localStorage.getItem('jmd_user') ? JSON.parse(localStorage.getItem('jmd_user')).id : 'guest',
      customer_details: customerDetails,
      items: cart,
      subtotal,
      vat,
      shipping,
      total,
      payment_method: paymentMethod
    };

    try {
      // 1. Create order on backend (returns order ID)
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      const order = await orderRes.json();
      
      if (!orderRes.ok) {
        throw new Error(order.message || 'Failed to initialize order.');
      }

      const orderId = order.id;

      if (paymentMethod === 'bank_transfer') {
        // Bank transfer path: order created directly as unpaid/pending, emails sent
        setProcessing(false);
        clearCart();
        onSuccess(orderId);
        return;
      }

      // Stripe Credit Card path
      // 2. Call backend to create PaymentIntent client secret
      const intentRes = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: total * 100, orderId })
      });
      const intentData = await intentRes.json();

      if (!intentRes.ok) {
        throw new Error(intentData.message || 'Failed to create payment intent.');
      }

      const clientSecret = intentData.clientSecret;

      // 3. Confirm payment via Stripe Elements (or mock simulation)
      if (clientSecret.startsWith('pi_mock_secret')) {
        // Simulated Stripe flow
        console.log('[MOCK PAYMENT] Simulating card authorization and webhook processing...');
        await new Promise((resolve) => setTimeout(resolve, 2000));
        
        // Trigger backend webhook simulator
        const webhookRes = await fetch('/api/webhooks/stripe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'payment_intent.succeeded',
            data: {
              object: {
                metadata: { orderId }
              }
            }
          })
        });

        if (webhookRes.ok) {
          setProcessing(false);
          clearCart();
          onSuccess(orderId);
        } else {
          throw new Error('Simulation webhook processing failed.');
        }
      } else {
        // Real Stripe payment confirmation
        const cardElement = elements.getElement(CardElement);
        const result = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: customerDetails.name,
              email: customerDetails.email,
              phone: customerDetails.phone
            }
          }
        });

        if (result.error) {
          throw new Error(result.error.message);
        } else if (result.paymentIntent.status === 'succeeded') {
          setProcessing(false);
          clearCart();
          onSuccess(orderId);
        }
      }
    } catch (err) {
      console.error('Payment transaction failure:', err);
      setStripeError(err.message || 'An unexpected payment error occurred.');
      onError(err.message || 'Payment failure.');
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handlePaymentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem' }}>
      
      {paymentMethod === 'bank_transfer' ? (
        /* Bank Transfer Instructions */
        <div style={{ border: '1px solid var(--color-accent)', padding: '1.5rem', backgroundColor: '#FFFFFF', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h5 style={{ textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.08em', fontWeight: 700 }}>Direct Bank Transfer Details</h5>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted-on-light)', lineHeight: 1.5 }}>
            To complete your order, please transfer the exact total to our business account. Use the Order ID as reference. Orders are held until funds clear in our bank.
          </p>
          
          <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse', borderTop: '1px solid var(--color-border-light)', paddingTop: '0.5rem' }}>
            <tbody>
              <tr>
                <td style={{ padding: '0.4rem 0', color: 'var(--text-muted-on-light)' }}>Beneficiary:</td>
                <td style={{ padding: '0.4rem 0', fontWeight: 600 }}>JMD Global Stones Pvt Ltd</td>
              </tr>
              <tr>
                <td style={{ padding: '0.4rem 0', color: 'var(--text-muted-on-light)' }}>Sort Code:</td>
                <td style={{ padding: '0.4rem 0', fontWeight: 600 }}>20-29-37</td>
              </tr>
              <tr>
                <td style={{ padding: '0.4rem 0', color: 'var(--text-muted-on-light)' }}>Account No:</td>
                <td style={{ padding: '0.4rem 0', fontWeight: 600 }}>83920194</td>
              </tr>
              <tr>
                <td style={{ padding: '0.4rem 0', color: 'var(--text-muted-on-light)' }}>Reference:</td>
                <td style={{ padding: '0.4rem 0', fontWeight: 600, color: 'var(--color-accent)' }}>[Your Order ID]</td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        /* Stripe Credit Card Form */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Card Information</label>
          <div className="stripe-element-container">
            <CardElement 
              options={{
                style: {
                  base: {
                    fontSize: '15px',
                    color: '#111111',
                    fontFamily: 'DM Sans, sans-serif',
                    '::placeholder': { color: '#8E8A82' }
                  },
                  invalid: { color: 'var(--color-danger)' }
                }
              }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted-on-light)', fontSize: '0.7rem', marginTop: '0.25rem' }}>
            <ShieldCheck size={14} style={{ color: 'var(--color-success)' }} />
            <span>Secure 256-bit SSL encrypted card transaction.</span>
          </div>
        </div>
      )}

      {stripeError && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid var(--color-danger)', color: 'var(--color-danger)', padding: '0.85rem 1rem', fontSize: '0.8rem', backgroundColor: '#FDF2F2' }}>
          <AlertCircle size={15} />
          <span>{stripeError}</span>
        </div>
      )}

      <button 
        type="submit" 
        disabled={processing} 
        className="btn btn-primary" 
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '52px', fontSize: '0.8rem', letterSpacing: '0.12em', fontWeight: 600 }}
      >
        {processing ? 'Processing Order...' : `Pay & Place Order (£${total.toFixed(2)})`}
      </button>

    </form>
  );
}
