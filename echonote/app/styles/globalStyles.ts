import { StyleSheet, Platform } from 'react-native';
import theme from './theme'; // Importing theme

const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingTop: Platform.OS === 'ios' ? 44 : 20, // Prevents status bar overlap
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  
  // Header styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    marginLeft: 8,
  },
  
  // Filter button styles
  filterButtons: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: 25,
    padding: 4,
    flex: 1,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 25,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  activeFilterButton: {
    backgroundColor: theme.colors.primary,
  },
  filterButtonText: {
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  activeFilterButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  
  // List styles
  listContent: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  
  // Search styles
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: theme.colors.background,
    borderRadius: 8,
    paddingHorizontal: 12,
    color: theme.colors.textPrimary,
  },
  clearButton: {
    padding: 8,
    position: 'absolute',
    right: 20,
  },
  
  // Card styles for items (meetings, actions, etc.)
  itemCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    marginHorizontal: 8,
    borderColor: theme.colors.border,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  
  // Special styles for action items
  actionItem: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    marginHorizontal: 8,
    borderColor: theme.colors.border,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionContent: {
    flex: 1,
  },
  actionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  actionText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  actionDueDate: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  actionNotes: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  
  // Generic item styles
  itemContent: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 4,
    flex: 1,
  },
  itemText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  itemDate: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  itemNotes: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  
  // For expanded content in archive items
  expandedContent: {
    marginTop: 8,
    marginBottom: 4,
  },
  expandIndicator: {
    alignItems: 'center',
    paddingTop: 8,
  },
  
  // Detail rows for meeting details
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  
  // Highlights section
  highlightsContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: theme.colors.background,
    borderRadius: 8,
  },
  highlightsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
    marginBottom: 4,
  },
  highlight: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 2,
    paddingLeft: 4,
  },
  
  // Status indicators
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: theme.colors.border,
    color: theme.colors.textSecondary,
  },
  pendingText: {
    backgroundColor: '#2C2C2C',
    color: theme.colors.textSecondary,
  },
  inProgressText: {
    backgroundColor: theme.colors.warning,
    color: '#000000',
  },
  completedText: {
    backgroundColor: theme.colors.success,
    color: '#000000',
  },
  
  // Priority flag
  priorityFlag: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    backgroundColor: theme.colors.border,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.textPrimary,
  },
  highPriorityFlag: {
    backgroundColor: theme.colors.error,
  },
  mediumPriorityFlag: {
    backgroundColor: theme.colors.warning,
  },
  lowPriorityFlag: {
    backgroundColor: theme.colors.success,
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  closeButton: {
    padding: 4,
  },
  modalSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  
  // Form styles
  formLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: theme.colors.background,
    borderRadius: 8,
    padding: 12,
    color: theme.colors.textPrimary,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    minHeight: 40,
  },
  textArea: {
    backgroundColor: theme.colors.background,
    borderRadius: 8,
    padding: 12,
    color: theme.colors.textPrimary,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  
  // Action buttons
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    marginLeft: 12,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButtonText: {
    color: theme.colors.onPrimary,
  },
  secondaryButtonText: {
    color: theme.colors.textPrimary,
  },
  
  // Dropdown styles
  dropdownContainer: {
    backgroundColor: theme.colors.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  dropdownText: {
    fontSize: 14,
    color: theme.colors.textPrimary,
  },
  selectedItem: {
    backgroundColor: 'rgba(187, 134, 252, 0.2)',
  },
});

export default globalStyles;
