import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Formate un prénom : première lettre en majuscule, reste en minuscule
 * Gère les prénoms composés (Jean-Pierre -> Jean-Pierre)
 * @param {string} firstName - Le prénom à formater
 * @returns {string} Le prénom formaté
 */
export function formatFirstName(firstName) {
  if (!firstName) return '';
  return firstName
    .toLowerCase()
    .split(/[-\s]/)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(firstName.includes('-') ? '-' : ' ');
}

/**
 * Formate un nom de famille : tout en majuscules
 * @param {string} lastName - Le nom à formater
 * @returns {string} Le nom formaté en majuscules
 */
export function formatLastName(lastName) {
  if (!lastName) return '';
  return lastName.toUpperCase();
}

/**
 * Formate un nom complet : Prénom NOM
 * Détecte automatiquement le prénom et le nom (suppose que le dernier mot est le nom)
 * @param {string} fullName - Le nom complet à formater
 * @returns {string} Le nom formaté (Prénom NOM)
 */
export function formatFullName(fullName) {
  if (!fullName) return '';
  
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) {
    // Un seul mot - on le considère comme un prénom
    return formatFirstName(parts[0]);
  }
  
  // Le dernier mot est le nom, le reste sont les prénoms
  const lastName = parts.pop();
  const firstNames = parts.map(part => formatFirstName(part)).join(' ');
  
  return `${firstNames} ${formatLastName(lastName)}`;
}

/**
 * Formate un nom pour l'affichage dans une liste ou un tableau
 * Format: NOM Prénom
 * @param {string} fullName - Le nom complet à formater
 * @returns {string} Le nom formaté (NOM Prénom)
 */
export function formatNameForList(fullName) {
  if (!fullName) return '';
  
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) {
    return formatFirstName(parts[0]);
  }
  
  const lastName = parts.pop();
  const firstNames = parts.map(part => formatFirstName(part)).join(' ');
  
  return `${formatLastName(lastName)} ${firstNames}`;
}

/**
 * Extrait les initiales d'un nom complet
 * @param {string} fullName - Le nom complet
 * @returns {string} Les initiales (max 2 caractères)
 */
export function getInitials(fullName) {
  if (!fullName) return '';
  
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}
