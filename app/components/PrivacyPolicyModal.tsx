import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import theme from '../styles/theme';
import { useUser } from '../context/UserContext';
import { useTranslation } from 'react-i18next';


interface PrivacyPolicyModalProps {
  visible: boolean;
  onClose: () => void;
  onAccept?: () => void;
  showAcceptButton?: boolean;
}

export default function PrivacyPolicyModal({ visible, onClose, onAccept, showAcceptButton = false }: PrivacyPolicyModalProps) {
  const { hasAcceptedPrivacyPolicy, setHasAcceptedPrivacyPolicy } = useUser();
  const { t } = useTranslation();
  const handleAcceptPrivacyPolicy = () => {
    setHasAcceptedPrivacyPolicy(true);
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
            <Text style={styles.modalTitle}>Privacy Policy</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={24} color={theme.colors.textPrimary} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.legalTextContainer}>
            <Text style={styles.legalText}>
              This Privacy Policy describes how EchoNotes ("we", "our", or "us") collects, uses, and shares your personal information when you use our voice recording and transcription application.
            </Text>
            <Text style={styles.legalSectionTitle}>1. Information We Collect</Text>
            <Text style={styles.legalText}>
              We collect information you provide directly to us, such as when you create an account, upload content, or contact us for support. This may include your name, email address, and any audio recordings or transcriptions you create using our application.
            </Text>
            <Text style={styles.legalSectionTitle}>2. Automatically Collected Information</Text>
            <Text style={styles.legalText}>
              When you use our application, we automatically collect certain information about your device and how you interact with our application, including device information, usage data, and log information.
            </Text>
            <Text style={styles.legalSectionTitle}>3. How We Use Your Information</Text>
            <Text style={styles.legalText}>
              We use the information we collect to provide, maintain, and improve our application, to communicate with you, to comply with legal obligations, and to protect our rights and the rights of others.
            </Text>
            <Text style={styles.legalSectionTitle}>4. Sharing of Information</Text>
            <Text style={styles.legalText}>
              We may share your information with service providers who perform services on our behalf, in response to legal requests, to protect our rights, and in connection with business transfers.
            </Text>
            <Text style={styles.legalSectionTitle}>5. Data Security</Text>
            <Text style={styles.legalText}>
              We take reasonable measures to help protect your personal information from loss, theft, misuse, and unauthorized access, disclosure, alteration, and destruction.
            </Text>
            <Text style={styles.legalSectionTitle}>6. Your Choices</Text>
            <Text style={styles.legalText}>
              You can access and update certain information about your account directly within the application. You may also request that we delete your account and personal information.
            </Text>
            <Text style={styles.legalSectionTitle}>7. Children's Privacy</Text>
            <Text style={styles.legalText}>
              Our application is not intended for children under the age of 13, and we do not knowingly collect personal information from children under 13.
            </Text>
            <Text style={styles.legalSectionTitle}>8. Changes to This Privacy Policy</Text>
            <Text style={styles.legalText}>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
            </Text>
            <Text style={styles.legalSectionTitle}>9. Contact Us</Text>
            <Text style={styles.legalText}>
              If you have any questions about this Privacy Policy, please contact us at support@echonotes.com.
            </Text>
            <Text style={styles.legalText}>
              Last Updated: March 22, 2025
            </Text>
          </ScrollView>

          {showAcceptButton ? (
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.acceptButton, hasAcceptedPrivacyPolicy && styles.acceptedButton]}
                onPress={handleAcceptPrivacyPolicy}
              >
                <Text style={styles.acceptButtonText}>
                  {hasAcceptedPrivacyPolicy ? 'Policy Accepted' : 'Accept Policy'}
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
                  <Text style={styles.customButtonText}>I Agree</Text>
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
  acceptButton: {
    backgroundColor: theme.colors.primary,
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    minHeight: 50,
  },
  acceptedButton: {
    backgroundColor: theme.colors.success,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginLeft: 10,
    marginTop: 10,
  },
  secondaryButtonText: {
    color: theme.colors.textPrimary,
    fontWeight: '600',
    fontSize: 16,
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  closeButton: {
    backgroundColor: '#FF453A',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    minHeight: 50,
    width: '80%',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
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
