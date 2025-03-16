import { StyleSheet, Dimensions } from 'react-native';
import theme from './theme';

const { width } = Dimensions.get('window');

const calendarStyles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    backgroundColor: theme.colors.background,
  },
  calendarContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderColor: theme.colors.border,
    borderWidth: 1,
    ...theme.shadows.small,
  },
  weekContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    marginBottom: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    borderColor: theme.colors.border,
    borderWidth: 1,
    ...theme.shadows.small,
  },
  dayButton: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
  },
  selectedDay: {
    backgroundColor: theme.colors.primary,
  },
  dayName: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  selectedText: {
    color: theme.colors.onPrimary,
  },
  eventsList: {
    flex: 1,
    paddingTop: 16,
    paddingBottom: 20,
  },
  eventCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderColor: theme.colors.border,
    borderWidth: 1,
    ...theme.shadows.small,
  },
  tasksHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  dateText: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: theme.colors.border,
    borderWidth: 1,
    ...theme.shadows.small,
  },
  taskTimeContainer: {
    width: 80,
    alignItems: 'center',
  },
  taskTime: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
    marginTop: 8,
  },
  taskContent: {
    flex: 1,
    marginLeft: 16,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
    color: theme.colors.textPrimary,
  },
  taskDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  emptyText: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    marginTop: 20,
  },
  // Calendar view styles
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  calendar: {
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    marginHorizontal: 10,
    marginTop: 10,
    ...theme.shadows.small,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  // Action items display styles
  actionsContainer: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    marginHorizontal: 10,
    marginTop: 20,
    marginBottom: 20,
    padding: 16,
    ...theme.shadows.small,
  },
  dateHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 16,
  },
  actionsList: {
    paddingBottom: 20,
  },
  actionCard: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: theme.colors.border,
    borderWidth: 1,
    ...theme.shadows.small,
  },
  actionPriority: {
    width: 4,
    height: '80%',
    borderRadius: 2,
    backgroundColor: theme.colors.primary,
    marginRight: 12,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  actionNotes: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    maxHeight: '90%',
  },
  backToCalendarLink: {
    padding: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    marginTop: 10,
  },
  backToCalendarText: {
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: '500',
  },
});

export default calendarStyles;
