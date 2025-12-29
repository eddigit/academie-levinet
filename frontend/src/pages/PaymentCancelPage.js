import React from 'react';
import { Link } from 'react-router-dom';
import { XCircle, ArrowLeft, ShoppingBag } from 'lucide-react';

const PaymentCancelPage = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="bg-paper rounded-2xl border border-white/10 p-8 text-center">
          {/* Cancel Icon */}
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-10 h-10 text-red-500" />
          </div>

          {/* Title */}
          <h1 className="font-oswald text-3xl font-bold text-text-primary uppercase mb-2">
            Paiement Annulé
          </h1>
          <p className="text-text-secondary mb-6">
            Votre paiement a été annulé. Aucun montant n'a été débité.
          </p>

          {/* Info Box */}
          <div className="bg-background rounded-lg p-4 mb-6 text-left">
            <p className="text-text-muted text-sm">
              Votre panier a été conservé. Vous pouvez reprendre votre commande à tout moment.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link
              to="/member/boutique"
              className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-oswald uppercase leading-none tracking-wider rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              Retourner à la boutique
            </Link>
            
            <Link
              to="/member/dashboard"
              className="w-full py-3 bg-white/5 hover:bg-white/10 text-text-primary font-oswald uppercase leading-none tracking-wider rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour à l'espace membre
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancelPage;
