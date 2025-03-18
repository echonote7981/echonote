import { StyleSheet, Platform, Dimensions } from 'react-native';
import theme from './theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const actionStyles = StyleSheet.create({
  
  notStartedButton: {  // ✅ Add this missing style
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.small,
    borderRadius: 8,
    alignItems: 'center',
  },
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 40,
    backgroundColor: theme.colors.background,
  },
  // New styles for ActionDetailsModal
  titleSection: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  notReviewedText: {
    color: '#999999',
  },
  pendingText: {
    color: '#FF9500',
  },
  completedText: {
    color: '#32D74B',
  },
  titleInput: {
    backgroundColor: '#333333',
    color: theme.colors.textPrimary,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 8,
  },
  contentText: {
    color: theme.colors.textSecondary,
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
  },
  prioritySection: {
    marginBottom: 16,
  },
  priorityBadgeText: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '500',
  },
  dueDateSection: {
    marginBottom: 16,
  },
  dateDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#333333',
    borderRadius: 8,
    padding: 12,
  },
  dateText: {
    color: theme.colors.textPrimary,
    fontSize: 16,
  },
  modalHeaderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    flex: 1,
  },
  listContainer: {
    flex: 1,
    paddingBottom: 20,
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
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 8,
    alignSelf: 'flex-start',
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
  // Action Details Modal styles
  modalContainer: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    height: '90%',
    marginTop: Platform.OS === 'ios' ? 40 : 0,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    flex: 1,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalScrollContent: {
    flex: 1,
  },
  modalFormContent: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 100 : 80,
  },
  notesSection: {
    marginBottom: 20,
  },
  notesLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  notesInput: {
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    padding: 12,
    color: theme.colors.textPrimary,
    fontSize: 16,
    minHeight: 120,
    maxHeight: 300, // Limit maximum height while still allowing scrolling
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  notesText: {
    fontSize: 16,
    color: theme.colors.textPrimary,
    padding: 12,
  },
  // Details section styles
  detailsSection: {
    marginBottom: 16,
  },
  detailsInput: {
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    padding: 12,
    color: theme.colors.textPrimary,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  modalButtonContainer: {
    marginTop: 20,
    gap: 12,
  },
  modalBottomButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    gap: 12,
  },
  modalButton: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  archiveButton: {
    backgroundColor: theme.colors.warning,
  },
  completeButton: {
    backgroundColor: theme.colors.success,
  },
  cancelButton: {
    backgroundColor: theme.colors.error,
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});


export default actionStyles;
