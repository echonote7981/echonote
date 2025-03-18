import { StyleSheet } from 'react-native';
import theme from './theme';

const recordStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: 20,
  },
  inputContainer: {
    width: '80%',
    marginBottom: 30,
  },
  input: {
    backgroundColor: theme.colors.surface,
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    color: theme.colors.textPrimary,
    borderColor: theme.colors.border,
    borderWidth: 1,
  },
  timerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
    width: '100%',
  },
  timer: {
    fontSize: 48,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    gap: 20,
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stopButton: {
    backgroundColor: theme.colors.error,
  },
  pauseButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resumeButton: {
    backgroundColor: theme.colors.success,
  },
  processingContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10,
  },
  processingText: {
    color: 'white',
    fontSize: 16,
  },
  // Banner styles for premium upgrade notification
  banner: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: theme.colors.warning || '#FF9800',
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  bannerText: {
    color: '#fff',
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  upgradeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    textDecorationLine: 'underline',
    marginLeft: 10,
  },
  // Styles for usage indicator
  usageContainer: {
    width: '90%',
    marginTop: 10,
    padding: 10,
  },
  usageText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 5,
  },
  usageBarContainer: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  usageBar: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 3,
  }
});

export default recordStyles;
