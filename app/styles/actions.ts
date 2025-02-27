import { StyleSheet, Platform } from 'react-native';
import theme from './theme';

const actionStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 40,
    backgroundColor: theme.colors.background,
  },
  listContainer: {
    flex: 1,
    paddingBottom: 20,
  },
  actionCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderColor: theme.colors.border,
    borderWidth: 1,
    ...theme.shadows.small,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  filterButtonText: {
    color: theme.colors.onPrimary,
    marginLeft: 4,
  },
  actionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    color: theme.colors.textPrimary,
  },
  actionDueDate: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  actionMeeting: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  priorityHigh: {
    backgroundColor: theme.colors.error + '20',
  },
  priorityMedium: {
    backgroundColor: theme.colors.warning + '20',
  },
  priorityLow: {
    backgroundColor: theme.colors.success + '20',
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '500',
  },
  priorityTextHigh: {
    color: theme.colors.error,
  },
  priorityTextMedium: {
    color: theme.colors.warning,
  },
  priorityTextLow: {
    color: theme.colors.success,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: theme.colors.primary,
  },
});

export default actionStyles;
