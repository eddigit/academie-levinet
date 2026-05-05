// Feature flags Académie Levinet
//
// SHOWCASE_MODE :
//   true  -> boutique vitrine : prix affichés mais ni panier ni "Ajouter".
//            Jacques colle des QR codes PayPal sur ses visuels produits.
//   false -> boutique e-commerce classique avec panier et checkout.
//
// Pour rollback : passer la valeur à `false` (rien d'autre à toucher).
export const SHOWCASE_MODE = true;

// CHATBOT_ENABLED :
//   true  -> widget de chat (assistant visiteur / membre) actif, appelle
//            /api/assistant/* côté backend (consommation LLM).
//   false -> widget non monté, aucun appel LLM, bouton flottant masqué.
export const CHATBOT_ENABLED = false;
