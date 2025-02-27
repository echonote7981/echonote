import { StyleSheet, Platform } from 'react-native';
import theme from './theme';

const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    paddingTop: Platform.OS === 'ios' ? 16 : 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  listContainer: {
    flex: 1,
    paddingBottom: 20,
  },
  input: {
    width: '100%',
    height: 48,
    borderColor: '#E0E0E0',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  listContent: {
    padding: 16,
  },
  meetingItem: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  meetingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    color: '#FFFFFF',
  },
  date: {
    fontSize: 14,
    color: '#999999',
  },
  expandedContent: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#FFFFFF',
  },
  highlightsContainer: {
    marginTop: 8,
  },
  highlightsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#FFFFFF',
  },
  highlight: {
    fontSize: 14,
    marginBottom: 4,
    paddingLeft: 8,
    color: '#FFFFFF',
  },
});

export default commonStyles;

export const meetingDetailsStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1E',
  },
  contentContainer: {
    padding: 16,
  },
  value: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 24,
  },
  errorText: {
    color: '#FF453A',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  transcriptContainer: {
    marginLeft: 36,
    marginTop: 12,
  },
  listContainer: {
    marginLeft: 36,
    marginTop: 8,
  },
  listItem: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 24,
    marginBottom: 8,
  },
  actionItem: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  actionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionCheckbox: {
    marginRight: 8,
  },
  actionTitle: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: '#999999',
  },
  editButton: {
    padding: 4,
  },
  addButton: {
    padding: 4,
  },
  actionDetail: {
    fontSize: 14,
    color: '#999999',
    marginBottom: 2,
    marginLeft: 32,
  },
  actionNotes: {
    fontSize: 14,
    color: '#FFFFFF',
    marginTop: 4,
    marginLeft: 32,
  },
  processingText: {
    fontSize: 14,
    color: '#FFD60A',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  high: {
    color: '#FF453A',
  },
  medium: {
    color: '#FFD60A',
  },
  low: {
    color: '#32D74B',
  },
  pending: {
    color: '#FFD60A',
  },
  completed: {
    color: '#32D74B',
  },
});
