/**
 * Design tokens mirrored for JavaScript consumers (charts, inline styles).
 * These are the same values as the CSS custom properties in app/globals.css —
 * keep the two in step. All traced to scss/bootstrap/_variables.scss.
 */
export const tokens = {
  color: {
    primary: "#007bff",
    primaryDark: "#006fe6",
    primaryDarker: "#006adb",
    primaryHover: "#0056b2",
    secondary: "#6c757d",
    success: "#71bc42",
    info: "#17a2b8",
    warning: "#ffc107",
    danger: "#dc3545",
    light: "#f8f9fa",
    dark: "#343a40",
    black: "#000000",
    white: "#ffffff",
    body: "#808080",
    border: "#dee2e6",
    gray100: "#f8f9fa",
    gray200: "#e9ecef",
    gray300: "#dee2e6",
    gray400: "#ced4da",
    gray500: "#adb5bd",
    gray600: "#6c757d",
    gray700: "#495057",
    gray800: "#343a40",
    gray900: "#212529",
    accentCta: "#e81050",
    accentCtaButton: "#505288",
  },
  shadow: {
    cardSm: "0 .125rem .25rem rgba(0,0,0,.075)",
    card: "0 .5rem 1rem rgba(0,0,0,.15)",
    cardLg: "0 1rem 3rem rgba(0,0,0,.175)",
    nav: "4px 0 20px -5px rgba(0,0,0,.1)",
    popular: "0 10px 40px -10px rgba(0,0,0,.3)",
  },
  zIndex: {
    navbar: 1999,
    drawer: 2000,
    overlayer: 7100,
    loader: 7700,
    whatsapp: 9000,
    voice: 9200,
    cookie: 9500,
  },
} as const;

/** Recharts colourway — contributed by the theme palette, nothing invented. */
export const chartColors = {
  paid: tokens.color.success,
  pending: tokens.color.warning,
  overdue: tokens.color.danger,
  primary: tokens.color.primary,
  secondary: tokens.color.secondary,
  info: tokens.color.info,
  grid: tokens.color.gray200,
  axis: tokens.color.gray600,
} as const;
