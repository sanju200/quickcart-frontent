import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useAppNavigation } from '../context/AppContext';

const FeedbackCenterScreen = () => {
  const { navigate } = useAppNavigation();
  const [feedbacks] = useState([
    { id: '1', user: 'Amit G.', rating: 5, comment: 'Super fast delivery, fresh veggies!', type: 'Product', date: '2h ago' },
    { id: '2', user: 'Sita R.', rating: 2, comment: 'Milk was near expiry date.', type: 'Product', date: '5h ago' },
    { id: '3', user: 'John D.', rating: 4, comment: 'Rider was polite but took time to find address.', type: 'Delivery', date: 'Yesterday' },
    { id: '4', user: 'Priya M.', rating: 5, comment: 'Best service in town!', type: 'Service', date: 'Yesterday' },
  ]);

  const renderFeedbackItem = ({ item }: { item: any }) => (
    <View style={styles.feedbackCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.userName}>{item.user}</Text>
        <Text style={styles.dateText}>{item.date}</Text>
      </View>
      <View style={styles.ratingRow}>
         {[1,2,3,4,5].map(s => (
           <Text key={s} style={{ color: s <= item.rating ? '#FFD600' : '#E0E0E0', fontSize: 16 }}>★</Text>
         ))}
         <View style={styles.typeBadge}>
            <Text style={styles.typeText}>{item.type}</Text>
         </View>
      </View>
      <Text style={styles.comment}>{item.comment}</Text>
      <View style={styles.actions}>
         <TouchableOpacity style={styles.actionBtn}><Text style={styles.actionText}>Reply</Text></TouchableOpacity>
         <TouchableOpacity style={styles.actionBtn}><Text style={styles.actionText}>Flag</Text></TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigate('HOME')} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Customer Feedback</Text>
      </View>

      <View style={styles.summaryBar}>
         <View style={styles.summaryItem}>
            <Text style={styles.summaryVal}>4.2</Text>
            <Text style={styles.summaryLabel}>Avg Rating</Text>
         </View>
         <View style={styles.summaryItem}>
            <Text style={styles.summaryVal}>92%</Text>
            <Text style={styles.summaryLabel}>Positive</Text>
         </View>
         <View style={styles.summaryItem}>
            <Text style={styles.summaryVal}>12</Text>
            <Text style={styles.summaryLabel}>Pending</Text>
         </View>
      </View>

      <FlatList
        data={feedbacks}
        keyExtractor={(item) => item.id}
        renderItem={renderFeedbackItem}
        contentContainerStyle={styles.listContent}
      />
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    flex: 1,
  },
  summaryBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryVal: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  summaryLabel: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  listContent: {
    padding: 15,
    paddingBottom: 120,
  },
  feedbackCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#eee',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  userName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  dateText: {
    fontSize: 10,
    color: '#999',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeBadge: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 10,
  },
  typeText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#666',
    textTransform: 'uppercase',
  },
  comment: {
    fontSize: 13,
    color: '#444',
    lineHeight: 18,
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 15,
    borderTopWidth: 1,
    borderTopColor: '#f1f1f1',
    paddingTop: 10,
  },
  actionBtn: {
    paddingVertical: 4,
  },
  actionText: {
    fontSize: 12,
    color: '#1976D2',
    fontWeight: '600',
  },
});

export default FeedbackCenterScreen;
