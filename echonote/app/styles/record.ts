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
    backgroundColor: theme.colors.warning,
    padding: 16,
    marginTop: 10,
    marginBottom: 15,
    borderRadius: 8,
    alignItems: 'center',
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  bannerText: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  upgradeText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    overflow: 'hidden',
  },
  // Add progress indicator for recording limit
  recordingLimitContainer: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 4,
    marginTop: 8,
    overflow: 'hidden',
  },
  recordingLimitFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 4,
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
  },
});

export default recordStyles;
