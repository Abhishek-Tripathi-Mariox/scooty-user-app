import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Bottom inset for the gesture-nav bar / home indicator. The top inset is
// already handled globally by the Root wrapper in index.js; use this for
// footers pinned to the bottom edge and for the bottom tab bar.
// Returns 0 on devices without an intruding navigation bar.
export function useBottomInset(): number {
  const insets = useSafeAreaInsets();
  return insets.bottom;
}
