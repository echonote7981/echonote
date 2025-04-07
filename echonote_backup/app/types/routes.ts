declare global {
  namespace ReactNavigation {
    interface RootParamList {
      '/(tabs)': undefined;
      '/(tabs)/index': undefined;
      '/(tabs)/meetings': undefined;
      '/(tabs)/actions': undefined;
      '/(tabs)/archived': undefined;
      '/meeting/[id]': { id: string };
    }
  }
}

export type RootStackParamList = {
  '/(tabs)': undefined;
  '/(tabs)/index': undefined;
  '/(tabs)/meetings': undefined;
  '/(tabs)/actions': undefined;
  '/(tabs)/archived': undefined;
  '/meeting/[id]': { id: string };
}

export default RootStackParamList;
