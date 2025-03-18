// // This file is a fallback for using MaterialIcons on Android and web.

// import MaterialIcons from '@expo/vector-icons/MaterialIcons';
// import { SymbolWeight } from 'expo-symbols';
// import React from 'react';
// import { OpaqueColorValue, StyleProp, ViewStyle } from 'react-native';


// // Add your SFSymbol to MaterialIcons mappings here.
// const MAPPING = {
//   // See MaterialIcons here: https://icons.expo.fyi
//   // See SF Symbols in the SF Symbols app on Mac.
//   'house.fill': 'home',
//   'paperplane.fill': 'send',
//   'chevron.left.forwardslash.chevron.right': 'code',
//   'chevron.right': 'chevron-right',
// } as Partial<
//   Record<
//     import('expo-symbols').SymbolViewProps['name'],
//     React.ComponentProps<typeof MaterialIcons>['name']
//   >
// >;

// export type IconSymbolName = keyof typeof MAPPING;

// /**
//  * An icon component that uses native SFSymbols on iOS, and MaterialIcons on Android and web. This ensures a consistent look across platforms, and optimal resource usage.
//  *
//  * Icon `name`s are based on SFSymbols and require manual mapping to MaterialIcons.
//  */
// export function IconSymbol({
//   name,
//   size = 24,
//   color,
//   style,
// }: {
//   name: IconSymbolName;
//   size?: number;
//   color: string | OpaqueColorValue;
//   style?: StyleProp<ViewStyle>;
//   weight?: SymbolWeight;
// }) {
//   return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;

// }
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight } from 'expo-symbols';
import React from 'react';
import { OpaqueColorValue, StyleProp, TextStyle, ViewStyle } from 'react-native';

// Explicitly define icon names instead of using `keyof typeof MAPPING`
export type IconSymbolName = 
  | 'house.fill'
  | 'paperplane.fill'
  | 'chevron.left.forwardslash.chevron.right'
  | 'chevron.right';

// Define the mapping separately
const MAPPING: Record<IconSymbolName, React.ComponentProps<typeof MaterialIcons>['name']> = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
};

/**
 * An icon component that uses native SFSymbols on iOS, and MaterialIcons on Android and web.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  const materialIconName = MAPPING[name] || "help"; // Default fallback icon

  return (
    <MaterialIcons
      color={color}
      size={size}
      name={materialIconName}
      style={style as StyleProp<TextStyle>} // Ensures type safety
    />
  );
}
