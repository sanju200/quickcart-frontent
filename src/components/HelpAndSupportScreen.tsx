import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { useAppNavigation } from '../context/AppContext';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const FAQS = [
  {
    id: '1',
    question: 'How can I track my order?',
    answer: 'You can track your order in the "Order History" section. Simply tap on any order to see its current status and estimated delivery time.',
  },
  {
    id: '2',
    question: 'What are the payment options?',
    answer: 'We accept various payment methods including Credit/Debit Cards, UPI, Net Banking, and popular Digital Wallets. Cash on Delivery (COD) is also available for most locations.',
  },
  {
    id: '3',
    question: 'How do I return or replace an item?',
    answer: 'You can initiate a return or replacement within 48 hours of delivery from the "Order History" screen. Ensure the product is in its original condition with tags intact.',
  },
  {
    id: '4',
    question: 'When will I receive my refund?',
    answer: 'Refunds are typically processed within 5-7 business days after the returned product reaches our warehouse and passes quality checks.',
  },
  {
    id: '5',
    question: 'How to change my delivery address?',
    answer: 'You can add, edit, or delete your addresses in the "Saved Addresses" section under your Account Profile.',
  },
  {
    id: '6',
    question: 'Is there a minimum order value for free delivery?',
    answer: 'Free delivery is applicable on all orders above ₹500. For orders below this amount, a nominal delivery fee of ₹40 will be charged.',
  },
];

const HelpAndSupportScreen = () => {
  const { navigate } = useAppNavigation();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigate('PROFILE')} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.heroSection}>
          <Text style={styles.heroEmoji}>🎧</Text>
          <Text style={styles.heroTitle}>How can we help you today?</Text>
          <Text style={styles.heroSubtitle}>Browse frequently asked questions or contact our support team.</Text>
        </View>

        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        
        <View style={styles.faqContainer}>
          {FAQS.map((faq) => (
            <TouchableOpacity 
              key={faq.id} 
              style={[styles.faqItem, expandedId === faq.id && styles.faqItemExpanded]}
              onPress={() => toggleExpand(faq.id)}
              activeOpacity={0.7}
            >
              <View style={styles.faqHeader}>
                <Text style={styles.faqQuestion}>{faq.question}</Text>
                <Text style={styles.expandIcon}>{expandedId === faq.id ? '−' : '+'}</Text>
              </View>
              {expandedId === faq.id && (
                <View style={styles.faqAnswerContainer}>
                  <Text style={styles.faqAnswer}>{faq.answer}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Still need help?</Text>
        
        <View style={styles.contactContainer}>
          <TouchableOpacity style={styles.contactItem}>
            <View style={styles.contactIconBox}>
              <Text style={styles.contactIcon}>✉️</Text>
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Email Support</Text>
              <Text style={styles.contactValue}>support@quickgreen.com</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactItem}>
            <View style={styles.contactIconBox}>
              <Text style={styles.contactIcon}>📞</Text>
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Call Us</Text>
              <Text style={styles.contactValue}>+1 (800) 123-4567</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactItem}>
            <View style={styles.contactIconBox}>
              <Text style={styles.contactIcon}>💬</Text>
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Live Chat</Text>
              <Text style={styles.contactValue}>Available 24/7</Text>
            </View>
          </TouchableOpacity>
        </View>

        <Text style={styles.footerText}>Response time is usually within 24 hours.</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FBF9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 5,
    marginRight: 10,
  },
  backIcon: {
    fontSize: 24,
    color: '#000',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  scrollContent: {
    padding: 15,
    paddingBottom: 100,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#eee',
  },
  heroEmoji: {
    fontSize: 50,
    marginBottom: 15,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1B5E20',
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 30,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    marginTop: 10,
  },
  faqContainer: {
    marginBottom: 25,
  },
  faqItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
    overflow: 'hidden',
  },
  faqItemExpanded: {
    borderColor: '#2E7D32',
    borderWidth: 1.5,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  faqQuestion: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    paddingRight: 10,
  },
  expandIcon: {
    fontSize: 20,
    color: '#2E7D32',
    fontWeight: 'bold',
  },
  faqAnswerContainer: {
    padding: 16,
    paddingTop: 0,
    borderTopWidth: 0,
    borderTopColor: '#f5f5f5',
  },
  faqAnswer: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
  },
  contactContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 20,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  contactIconBox: {
    width: 45,
    height: 45,
    backgroundColor: '#F1F8E9',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  contactIcon: {
    fontSize: 22,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  contactValue: {
    fontSize: 13,
    color: '#2E7D32',
    marginTop: 2,
  },
  footerText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 12,
    marginTop: 10,
  },
});

export default HelpAndSupportScreen;
