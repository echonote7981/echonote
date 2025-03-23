import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import theme from '../styles/theme';
import { useUser } from '../context/UserContext';

interface TermsModalProps {
  visible: boolean;
  onClose: () => void;
  onAccept?: () => void;
  showAcceptButton?: boolean;
}

export default function TermsModal({ visible, onClose, onAccept, showAcceptButton = false }: TermsModalProps) {
  const { hasAcceptedTerms, setHasAcceptedTerms } = useUser();

  const handleAcceptTerms = () => {
    setHasAcceptedTerms(true);
    if (onAccept) {
      onAccept();
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Terms and Conditions</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={24} color={theme.colors.textPrimary} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.legalTextContainer}>
            <Text style={styles.legalText}>
              These Terms and Conditions ("Terms") govern your use of EchoNotes, a voice recording and transcription application. By using our application, you agree to these Terms.
            </Text>
            <Text style={styles.legalSectionTitle}>1. User Accounts</Text>
            <Text style={styles.legalText}>
              You may be required to create an account to use certain features of our application. You are responsible for maintaining the confidentiality of your account credentials.
            </Text>
            <Text style={styles.legalSectionTitle}>2. License</Text>
            <Text style={styles.legalText}>
              Subject to these Terms, we grant you a limited, non-exclusive, non-transferable license to use the application for your personal, non-commercial purposes.
            </Text>
            <Text style={styles.legalSectionTitle}>3. User Content</Text>
            <Text style={styles.legalText}>
              You retain all rights to any content you submit, post, or display on or through the application. By submitting content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and display such content in connection with the application.
            </Text>
            <Text style={styles.legalSectionTitle}>4. Privacy</Text>
            <Text style={styles.legalText}>
              Our Privacy Policy, which is incorporated into these Terms, explains how we collect, use, and disclose information about you. By using the application, you agree to our collection, use, and disclosure of information as described in the Privacy Policy.
            </Text>
            <Text style={styles.legalSectionTitle}>5. Subscription Services</Text>
            <Text style={styles.legalText}>
              Some features of the application may require a subscription. Subscriptions are billed on a recurring basis. You can cancel your subscription at any time, but we do not provide refunds for partial subscription periods.
            </Text>
            <Text style={styles.legalSectionTitle}>6. Termination</Text>
            <Text style={styles.legalText}>
              We may terminate or suspend your access to the application at any time, without prior notice or liability, for any reason, including if you breach these Terms.
            </Text>
            <Text style={styles.legalSectionTitle}>7. Disclaimer of Warranties</Text>
            <Text style={styles.legalText}>
              The application is provided "as is" and "as available" without warranties of any kind, either express or implied.
            </Text>
            <Text style={styles.legalSectionTitle}>8. Limitation of Liability</Text>
            <Text style={styles.legalText}>
              In no event shall we be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or business opportunities.
            </Text>
            <Text style={styles.legalSectionTitle}>9. Changes to Terms</Text>
            <Text style={styles.legalText}>
              We may modify these Terms at any time. Your continued use of the application after any modifications indicates your acceptance of the modified Terms.
            </Text>
            <Text style={styles.legalSectionTitle}>10. Governing Law</Text>
            <Text style={styles.legalText}>
              These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which we operate, without regard to its conflict of law provisions.
            </Text>
          </ScrollView>

          {showAcceptButton ? (
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.acceptButton, hasAcceptedTerms && styles.acceptedButton]}
                onPress={handleAcceptTerms}
              >
                <Text style={styles.acceptButtonText}>
                  {hasAcceptedTerms ? 'Terms Accepted' : 'Accept Terms'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.secondaryButton}
                onPress={onClose}
              >
                <Text style={styles.secondaryButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.singleButtonContainer}>
              <TouchableOpacity onPress={onClose}>
                <View style={styles.customButton}>
                  <Text style={styles.customButtonText}>I Understand</Text>
                </View>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  singleButtonContainer: {
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
  acceptedButton: {
    backgroundColor: theme.colors.success,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginLeft: 10,
  },
  secondaryButtonText: {
    color: theme.colors.textPrimary,
    fontWeight: '600',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderRadius: 10,
    width: '100%',
    maxHeight: '80%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  legalTextContainer: {
    marginBottom: 20,
  },
  legalSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginTop: 15,
    marginBottom: 5,
  },
  legalText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 10,
    lineHeight: 20,
  },
  acceptButton: {
    backgroundColor: theme.colors.primary,
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
    flex: 1,
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  customButton: {
    backgroundColor: '#FF9500',
    borderWidth: 0,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    minHeight: 50,
    width: 200,
  },
  customButtonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
