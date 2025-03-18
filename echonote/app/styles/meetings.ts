import { StyleSheet } from 'react-native';
import theme from './theme';

const meetingStyles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
    backgroundColor: '#000000',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  meetingCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  meetingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  meetingTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    color: '#FFFFFF',
  },
  meetingDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  meetingDate: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  meetingDuration: {
    fontSize: 14,
    color: '#FFFFFF',
    marginTop: 4,
  },
  meetingStatus: {
    fontSize: 14,
    marginTop: 8,
    padding: 4,
    borderRadius: 4,
    overflow: 'hidden',
    alignSelf: 'flex-start',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusSpinner: {
    marginLeft: 4,
  },
  statusProcessing: {
    backgroundColor: '#4CAF50',
    color: '#4CAF50',
  },
  statusProcessed: {
    backgroundColor: '#4CAF50',
    color: '#4CAF50',
  },
  statusFailed: {
    backgroundColor: '#FF3B30',
    color: '#FF3B30',
  },
  summary: {
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 12,
    lineHeight: 24,
  },
  highlightsContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#2C2C2E',
  },
  highlightsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  highlightsList: {
    marginTop: 12,
  },
  highlight: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 4,
    paddingLeft: 8,
    borderLeftWidth: 2,
    borderLeftColor: '#4CAF50',
  },
  moreHighlights: {
    fontSize: 14,
    color: '#4CAF50',
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#FFFFFF',
    marginTop: 8,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionMenuContainer: {
    width: '80%',
    maxWidth: 300,
    backgroundColor: '#1C1C1E',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
  },
  actionMenu: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'column',
    alignItems: 'center',
    padding: 15,
    width: 100,
    borderRadius: 10,
    backgroundColor: '#2C2C2E',
  },
  actionButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginTop: 8,
  },
  confirmDialog: {
    width: '80%',
    maxWidth: 300,
    backgroundColor: '#1C1C1E',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  confirmMessage: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  confirmButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    gap: 10,
  },
  confirmButton: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#2C2C2E',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
});

export default meetingStyles;
