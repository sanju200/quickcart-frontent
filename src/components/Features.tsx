import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';

const FEATURES = [
  {
    id: '1',
    icon: '🚀',
    title: '8 Minute Delivery',
    subtitle: 'Fastest in the city',
    bgColor: '#E8F5E9',
    iconColor: '#2E7D32',
  },
  {
    id: '2',
    icon: '💸',
    title: 'Best Prices',
    subtitle: 'Save up to 40%',
    bgColor: '#F1F8E9',
    iconColor: '#388E3C',
  },
  {
    id: '3',
    icon: '📦',
    title: 'Free Delivery',
    subtitle: 'On orders over ₹199',
    bgColor: '#E8F5E9',
    iconColor: '#43A047',
  },
  {
    id: '4',
    icon: '🛡️',
    title: 'Safe & Secure',
    subtitle: '100% authentic products',
    bgColor: '#F5F5F5',
    iconColor: '#212121',
  },
];

const Features = () => {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {FEATURES.map((item) => (
          <View key={item.id} style={[styles.card, { backgroundColor: '#fff' }]}>
            <View style={[styles.iconContainer, { backgroundColor: item.bgColor }]}>
              <Text style={[styles.icon, { color: item.iconColor }]}>{item.icon}</Text>
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.subtitle}>{item.subtitle}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    backgroundColor: '#F1F8E9',
  },
  scrollContent: {
    paddingHorizontal: 15,
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    width: 200,
    borderWidth: 1,
    borderColor: '#C8E6C9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  icon: {
    fontSize: 20,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#000',
  },
  subtitle: {
    fontSize: 10,
    color: '#616161',
    marginTop: 2,
  },
});

export default Features;
