import { StyleSheet } from 'react-native';

const bannerMessageStyles = StyleSheet.create({
    container: {
      position: 'absolute',
      top: 16, // Add space from the top
      left: 0,
      right: 0,
      zIndex: 1000,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 14,
      backgroundColor: '#0A1930',
      borderBottomWidth: 1,
      borderBottomColor: '#1E3A6A',
      borderTopWidth: 1,
      borderTopColor: '#1E3A6A',
    },
    text: {
      color: 'white',
      fontSize: 16,
      fontWeight: '500',
      flexShrink: 1,
      width: '70%', // Control text width to force wrapping
    },
    button: {
      backgroundColor: '#FFCC00',
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 20,
      alignSelf: 'center',
      marginLeft: 8,
    },
    buttonText: {
      fontWeight: 'bold',
      color: '#0A1930',
    },
  });

export { bannerMessageStyles };
export default bannerMessageStyles;
