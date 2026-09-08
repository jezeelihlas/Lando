// Never actually rendered — the tab's `tabPress` listener in
// (tabs)/_layout.tsx intercepts the press and redirects to either the
// auth flow or the seller wizard before navigation happens. Expo Router
// still needs a real route file here for the tab to register.
export default function AddPropertyTabPlaceholder() {
  return null;
}
