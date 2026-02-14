// Country codes and flag emojis mapping
export const countries = [
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'BR', name: 'Brésil', flag: '🇧🇷' },
  { code: 'ES', name: 'Espagne', flag: '🇪🇸' },
  { code: 'IT', name: 'Italie', flag: '🇮🇹' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
  { code: 'BE', name: 'Belgique', flag: '🇧🇪' },
  { code: 'CH', name: 'Suisse', flag: '🇨🇭' },
  { code: 'DE', name: 'Allemagne', flag: '🇩🇪' },
  { code: 'GB', name: 'Royaume-Uni', flag: '🇬🇧' },
  { code: 'US', name: 'États-Unis', flag: '🇺🇸' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'MX', name: 'Mexique', flag: '🇲🇽' },
  { code: 'AR', name: 'Argentine', flag: '🇦🇷' },
  { code: 'CL', name: 'Chili', flag: '🇨🇱' },
  { code: 'CO', name: 'Colombie', flag: '🇨🇴' },
  { code: 'RU', name: 'Russie', flag: '🇷🇺' },
  { code: 'JP', name: 'Japon', flag: '🇯🇵' },
  { code: 'KR', name: 'Corée du Sud', flag: '🇰🇷' },
  { code: 'CN', name: 'Chine', flag: '🇨🇳' },
  { code: 'IN', name: 'Inde', flag: '🇮🇳' },
  { code: 'IL', name: 'Israël', flag: '🇮🇱' },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳' },
  { code: 'TH', name: 'Thaïlande', flag: '🇹🇭' },
  { code: 'AU', name: 'Australie', flag: '🇦🇺' },
  { code: 'NZ', name: 'Nouvelle-Zélande', flag: '🇳🇿' },
  { code: 'MA', name: 'Maroc', flag: '🇲🇦' },
  { code: 'TN', name: 'Tunisie', flag: '🇹🇳' },
  { code: 'DZ', name: 'Algérie', flag: '🇩🇿' },
  { code: 'SN', name: 'Sénégal', flag: '🇸🇳' },
  { code: 'CI', name: 'Côte d\'Ivoire', flag: '🇨🇮' },
  { code: 'ZA', name: 'Afrique du Sud', flag: '🇿🇦' },
  { code: 'MU', name: 'Île Maurice', flag: '🇲🇺' },
  { code: 'PL', name: 'Pologne', flag: '🇵🇱' },
  { code: 'NL', name: 'Pays-Bas', flag: '🇳🇱' },
  { code: 'SE', name: 'Suède', flag: '🇸🇪' },
  { code: 'NO', name: 'Norvège', flag: '🇳🇴' },
  { code: 'DK', name: 'Danemark', flag: '🇩🇰' },
  { code: 'FI', name: 'Finlande', flag: '🇫🇮' },
  { code: 'GR', name: 'Grèce', flag: '🇬🇷' },
  { code: 'TR', name: 'Turquie', flag: '🇹🇷' },
  { code: 'RO', name: 'Roumanie', flag: '🇷🇴' },
  { code: 'HU', name: 'Hongrie', flag: '🇭🇺' },
  { code: 'CZ', name: 'République Tchèque', flag: '🇨🇿' },
  { code: 'AT', name: 'Autriche', flag: '🇦🇹' },
  { code: 'IE', name: 'Irlande', flag: '🇮🇪' },
  { code: 'LU', name: 'Luxembourg', flag: '🇱🇺' },
  { code: 'MC', name: 'Monaco', flag: '🇲🇨' },
];

// Get flag by country code
export const getFlag = (countryCode) => {
  if (!countryCode) return '🏳️';
  const country = countries.find(c => c.code === countryCode.toUpperCase());
  return country ? country.flag : '🏳️';
};

// Get flag by country name (fuzzy match)
export const getFlagByName = (countryName) => {
  if (!countryName) return '🏳️';
  const normalizedName = countryName.toLowerCase().trim();
  const country = countries.find(c => 
    c.name.toLowerCase() === normalizedName ||
    c.name.toLowerCase().includes(normalizedName) ||
    normalizedName.includes(c.name.toLowerCase())
  );
  return country ? country.flag : '🏳️';
};

// Get country code by name
export const getCountryCode = (countryName) => {
  if (!countryName) return 'FR';
  const normalizedName = countryName.toLowerCase().trim();
  const country = countries.find(c => 
    c.name.toLowerCase() === normalizedName ||
    c.name.toLowerCase().includes(normalizedName) ||
    normalizedName.includes(c.name.toLowerCase())
  );
  return country ? country.code : 'FR';
};

// Dan grades list
export const danGrades = [
  { value: 'debutant', label: 'Débutant' },
  { value: '1dan', label: '1er Dan' },
  { value: '2dan', label: '2ème Dan' },
  { value: '3dan', label: '3ème Dan' },
  { value: '4dan', label: '4ème Dan' },
  { value: '5dan', label: '5ème Dan' },
  { value: '6dan', label: '6ème Dan' },
  { value: '7dan', label: '7ème Dan' },
  { value: '8dan', label: '8ème Dan' },
  { value: '9dan', label: '9ème Dan' },
  { value: '10dan', label: '10ème Dan' },
];

// Get dan label
export const getDanLabel = (value) => {
  const dan = danGrades.find(d => d.value === value);
  return dan ? dan.label : value || 'Non défini';
};

// Disciplines list
export const disciplines = [
  'Self-Pro Krav (SPK)',
  'Krav Maga',
  'KAPAP',
  'Canne Défense',
  'Self Féminine (SFJL)',
  'Self Enfant',
  'ROS (Real Operational System)',
];

export default { countries, getFlag, getFlagByName, getCountryCode, danGrades, getDanLabel, disciplines };
