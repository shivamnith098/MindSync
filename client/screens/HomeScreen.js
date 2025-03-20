import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <LinearGradient
        colors={['#4a6fa0', '#2c3e50']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>📘 MindSync</Text>
        <Text style={styles.headerSubtitle}>Your AI Note Assistant</Text>
      </LinearGradient>
      
      <View style={styles.content}>
        <View style={styles.welcomeSection}>
          <Image 
            source={{ uri: 'https://via.placeholder.com/80' }} 
            style={styles.welcomeIcon}
          />
          <View style={styles.welcomeTextContainer}>
            <Text style={styles.welcomeText}>Welcome back!</Text>
            <Text style={styles.welcomeSubtext}>What would you like to do today?</Text>
          </View>
        </View>
        
        <View style={styles.cardsContainer}>
          <TouchableOpacity 
            style={styles.card}
            onPress={() => navigation.navigate('UploadAINote')}
          >
            <View style={[styles.cardIcon, { backgroundColor: '#e9f5ff' }]}>
              <Text style={styles.cardIconText}>📤</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Upload AI Note</Text>
              <Text style={styles.cardDescription}>Add new notes to your collection</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.card}
            onPress={() => navigation.navigate('ConceptCluster')}
          >
            <View style={[styles.cardIcon, { backgroundColor: '#fff5e9' }]}>
              <Text style={styles.cardIconText}>🔍</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Concept Cluster</Text>
              <Text style={styles.cardDescription}>Explore related ideas and notes</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.card}
            onPress={() => navigation.navigate('LinkedNotes')}
          >
            <View style={[styles.cardIcon, { backgroundColor: '#f0e9ff' }]}>
              <Text style={styles.cardIconText}>🔗</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Linked Notes</Text>
              <Text style={styles.cardDescription}>See connections between your notes</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 5,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  welcomeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  welcomeIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  welcomeTextContainer: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  welcomeSubtext: {
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 5,
  },
  cardsContainer: {
    flex: 1,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 16,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  cardIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    flexShrink: 0,
  },
  cardIconText: {
    fontSize: 24,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  cardDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 4,
    flexWrap: 'wrap',
  },
});