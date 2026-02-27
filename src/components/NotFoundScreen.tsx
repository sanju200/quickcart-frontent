import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAppNavigation } from '../context/AppContext';

const NotFoundScreen = () => {
  const { navigate } = useAppNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>404</Text>
      <Text style={styles.title}>Page Not Found</Text>
      <Text style={styles.subtitle}>The screen you are looking for does not exist or you don't have access to it.</Text>
      
      <TouchableOpacity style={styles.btnPrimary} onPress={() => navigate('HOME')}>
        <Text style={styles.btnText}>Go to Home</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F8E9', padding: 20, justifyContent: 'center', alignItems: 'center' },
  icon: { fontSize: 80, fontWeight: 'bold', color: '#2E7D32', marginBottom: 10 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 30, textAlign: 'center' },
  btnPrimary: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 12,
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default NotFoundScreen;
