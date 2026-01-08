import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

const canHaptic = Platform.OS !== 'web';

const runHaptic = async (action: () => Promise<void>) => {
  if (!canHaptic) return;
  try {
    await action();
  } catch {
    // Ignore haptics errors on unsupported devices.
  }
};

export const hapticSelection = () => runHaptic(() => Haptics.selectionAsync());

export const hapticImpactLight = () =>
  runHaptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));

export const hapticSuccess = () =>
  runHaptic(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));

export const hapticError = () =>
  runHaptic(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error));
