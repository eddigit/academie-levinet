import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, Package, CreditCard, ArrowRight, Loader2 } from 'lucide-react';
import api from '../utils/api';
import { useCart } from '../context/CartContext';

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  const sessionId = searchParams.get('session_id');
  const paymentType = searchParams.get('type') || 'shop';

  useEffect(() => {
    // Clear cart on successful payment
    if (paymentType === 'shop') {
      clearCart();
    }

    // Fetch payment status
    const fetchStatus = async () => {
      if (sessionId) {
        try {
          const response = await api.get(`/payments/status/${sessionId}`);
          setPaymentDetails(response.data);
        } catch (error) {
          console.error('Error fetching payment status:', error);
        }
      }
      setLoading(false);
    };

    fetchStatus();
  }, [sessionId, paymentType, clearCart]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="bg-paper rounded-2xl border border-white/10 p-8 text-center">
          {loading ? (
            <div className="py-8">
              <Loader2 className="w-12 h-12 text-primary mx-auto animate-spin mb-4" />
              <p className="text-text-muted">Vérification du paiement...</p>
            </div>
          ) : (
            <>
              {/* Success Icon */}
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>

              {/* Title */}
              <h1 className="font-oswald text-3xl font-bold text-text-primary uppercase mb-2">
                Paiement Réussi !
              </h1>
              <p className="text-text-secondary mb-6">
                Merci pour votre {paymentType === 'shop' ? 'commande' : 'paiement'} !
              </p>

              {/* Payment Details */}
              {paymentDetails && (
                <div className="bg-background rounded-lg p-4 mb-6 text-left">
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-text-muted">Montant</span>
                    <span className="font-oswald font-bold text-primary">
                      {(paymentDetails.amount_total / 100).toFixed(2)}€
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-text-muted">Statut</span>
                    <span className="text-green-500 font-semibold">
                      {paymentDetails.payment_status === 'paid' ? 'Payé' : paymentDetails.status}
                    </span>
                  </div>
                </div>
              )}

              {/* Message based on payment type */}
              {paymentType === 'shop' && (
                <div className="bg-primary/10 rounded-lg p-4 mb-6 flex items-start gap-3 text-left">
                  <Package className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-text-primary font-semibold text-sm">Commande confirmée</p>
                    <p className="text-text-muted text-xs mt-1">
                      Vous recevrez un email de confirmation avec les détails de livraison.
                    </p>
                  </div>
                </div>
              )}

              {paymentType === 'membership' && (
                <div className="bg-primary/10 rounded-lg p-4 mb-6 flex items-start gap-3 text-left">
                  <CreditCard className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-text-primary font-semibold text-sm">Abonnement activé</p>
                    <p className="text-text-muted text-xs mt-1">
                      Votre compte a été mis à jour avec vos nouveaux avantages.
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                {paymentType === 'shop' && (
                  <Link
                    to="/member/boutique"
                    className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-oswald uppercase leading-none tracking-wider rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    Continuer mes achats
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
                
                <Link
                  to="/member/dashboard"
                  className="w-full py-3 bg-white/5 hover:bg-white/10 text-text-primary font-oswald uppercase leading-none tracking-wider rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  Retour à l'espace membre
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
