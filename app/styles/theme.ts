// const darkTheme = {
//   colors: {
//     background: '#121212',
//     surface: '#1E1E1E',
//     primary: '#BB86FC',
//     primaryLight: '#D4BBFF', // Added for calendar highlights
//     primaryVariant: '#3700B3',
//     secondary: '#03DAC6',
//     error: '#CF6679',
//     onBackground: '#FFFFFF',
//     onSurface: '#FFFFFF',
//     onPrimary: '#000000',
//     onSecondary: '#000000',
//     onError: '#000000',
//     textPrimary: '#FFFFFF',
//     textSecondary: '#B3B3B3',
//     border: '#2C2C2C',
//     success: '#00C853',
//     warning: '#FFD600',
//     info: '#2196F3',
//     divider: '#2C2C2C',
//     cardBackground: '#1E1E1E',
//     statusProcessing: '#FFD600',
//     statusProcessed: '#00C853',
//     statusFailed: '#CF6679',
//     recordButton: '#BB86FC',
//     stopButton: '#CF6679',
//     pauseButton: '#FFD600',
//     resumeButton: '#00C853',
//   },
//   shadows: {
//     small: {
//       shadowColor: '#000',
//       shadowOffset: {
//         width: 0,
//         height: 2,
//       },
//       shadowOpacity: 0.25,
//       shadowRadius: 3.84,
//       elevation: 5,
//     },
//   },
// };

// export default darkTheme;




// app/styles/theme.ts (Centralized Theme File)
const theme = {
  colors: {
    background: '#1C1C1E', // Unified background color
    surface: '#2C2C2E',
    primary: '#8E7BE5',
    textPrimary: '#FFFFFF',
    textSecondary: '#A1A1A1',
    secondary: '#03DAC6',
    border: '#3A3A3C',
    success: '#32D74B',
    error: '#FF453A',
    warning: '#FFD60A',
    onPrimary: '#FFFFFF',
    onSecondary: '#000000',
    primaryLight: '#D4BBFF'
  },
  spacing: {
    small: 8,
    medium: 16,
    large: 24,
  },
  typography: {
    header: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },
    subHeader: { fontSize: 18, fontWeight: '600', color: '#FFFFFF' },
    body: { fontSize: 16, fontWeight: '500', color: '#A1A1A1' },
  },
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 3,
    },
  },
  

};

export default theme;
