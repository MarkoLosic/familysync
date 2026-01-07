/**
 * Style Utility
 * Provides fallback inline styles if NativeWind className doesn't work
 */

import { ViewStyle, TextStyle, ImageStyle } from 'react-native';

type Style = ViewStyle | TextStyle | ImageStyle;

/**
 * Common style presets for quick use
 */
export const commonStyles = {
  // Containers
  container: {
    flex: 1,
    backgroundColor: '#FAF5FF',
  } as ViewStyle,
  
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  } as ViewStyle,
  
  cardSmall: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  } as ViewStyle,

  // Layout
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,
  
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  } as ViewStyle,
  
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,

  // Text
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0f172a',
  } as TextStyle,
  
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
  } as TextStyle,
  
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#334155',
  } as TextStyle,
  
  body: {
    fontSize: 16,
    color: '#475569',
  } as TextStyle,
  
  caption: {
    fontSize: 14,
    color: '#64748b',
  } as TextStyle,

  // Buttons
  button: {
    backgroundColor: '#3b82f6',
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  } as TextStyle,

  // Colors
  bgWhite: { backgroundColor: '#ffffff' } as ViewStyle,
  bgPurple: { backgroundColor: '#a855f7' } as ViewStyle,
  bgPink: { backgroundColor: '#ec4899' } as ViewStyle,
  bgBlue: { backgroundColor: '#3b82f6' } as ViewStyle,
  
  // Spacing
  p4: { padding: 16 } as ViewStyle,
  p6: { padding: 24 } as ViewStyle,
  m4: { margin: 16 } as ViewStyle,
  mb4: { marginBottom: 16 } as ViewStyle,
  mt4: { marginTop: 16 } as ViewStyle,
  
  // Borders
  rounded: { borderRadius: 8 } as ViewStyle,
  roundedLg: { borderRadius: 16 } as ViewStyle,
  roundedXl: { borderRadius: 24 } as ViewStyle,
  rounded3xl: { borderRadius: 32 } as ViewStyle,
  roundedFull: { borderRadius: 9999 } as ViewStyle,
};

/**
 * Combine multiple styles
 * Usage: style={combine(commonStyles.card, commonStyles.p6, customStyle)}
 */
export function combine(...styles: (Style | undefined | false | null)[]): Style {
  return Object.assign({}, ...styles.filter(Boolean));
}

/**
 * Create responsive spacing
 */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

/**
 * Color palette
 */
export const colors = {
  purple: {
    50: '#FAF5FF',
    100: '#F3E8FF',
    500: '#A855F7',
    900: '#581C87',
  },
  pink: {
    50: '#FDF2F8',
    100: '#FCE7F3',
    500: '#EC4899',
    900: '#831843',
  },
  blue: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    500: '#3B82F6',
    900: '#1E3A8A',
  },
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  white: '#ffffff',
  black: '#000000',
};

/**
 * Shadow presets
 */
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  } as ViewStyle,
  
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  } as ViewStyle,
  
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  } as ViewStyle,
  
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  } as ViewStyle,
};

/**
 * Quick style builder
 * Usage: <View style={s('bg-white p-6 rounded-xl shadow-lg')} />
 */
export function s(className: string): Style {
  const styles: any = {};
  const classes = className.split(' ');
  
  classes.forEach(cls => {
    // Background colors
    if (cls === 'bg-white') styles.backgroundColor = colors.white;
    if (cls === 'bg-purple-50') styles.backgroundColor = colors.purple[50];
    if (cls === 'bg-purple-500') styles.backgroundColor = colors.purple[500];
    if (cls === 'bg-pink-100') styles.backgroundColor = colors.pink[100];
    if (cls === 'bg-blue-100') styles.backgroundColor = colors.blue[100];
    if (cls === 'bg-gray-50') styles.backgroundColor = colors.gray[50];
    
    // Padding
    if (cls === 'p-4') styles.padding = 16;
    if (cls === 'p-6') styles.padding = 24;
    if (cls === 'px-4') { styles.paddingHorizontal = 16; }
    if (cls === 'px-6') { styles.paddingHorizontal = 24; }
    if (cls === 'py-4') { styles.paddingVertical = 16; }
    if (cls === 'py-6') { styles.paddingVertical = 24; }
    
    // Margin
    if (cls === 'm-4') styles.margin = 16;
    if (cls === 'mb-4') styles.marginBottom = 16;
    if (cls === 'mt-4') styles.marginTop = 16;
    
    // Border radius
    if (cls === 'rounded') styles.borderRadius = 8;
    if (cls === 'rounded-lg') styles.borderRadius = 16;
    if (cls === 'rounded-xl') styles.borderRadius = 20;
    if (cls === 'rounded-2xl') styles.borderRadius = 24;
    if (cls === 'rounded-3xl') styles.borderRadius = 32;
    if (cls === 'rounded-full') styles.borderRadius = 9999;
    
    // Shadow
    if (cls === 'shadow') Object.assign(styles, shadows.sm);
    if (cls === 'shadow-md') Object.assign(styles, shadows.md);
    if (cls === 'shadow-lg') Object.assign(styles, shadows.lg);
    if (cls === 'shadow-xl') Object.assign(styles, shadows.xl);
    
    // Flex
    if (cls === 'flex-1') styles.flex = 1;
    if (cls === 'flex-row') styles.flexDirection = 'row';
    if (cls === 'items-center') styles.alignItems = 'center';
    if (cls === 'justify-center') styles.justifyContent = 'center';
    if (cls === 'justify-between') styles.justifyContent = 'space-between';
  });
  
  return styles;
}
