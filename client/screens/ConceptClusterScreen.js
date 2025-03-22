

import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet, 
  ActivityIndicator, 
  Alert,
  Animated,
  TextInput
} from 'react-native';
import axios from 'axios';
import { API } from '../config';
import { Ionicons, AntDesign, MaterialIcons } from '@expo/vector-icons';

export default function ConceptClusterScreen({ navigation, route }) {
  const [concepts, setConcepts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredConcepts, setFilteredConcepts] = useState([]);
  const [similarConceptsMap, setSimilarConceptsMap] = useState({});
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    if (route.params?.newConcepts) {
      const newConcepts = route.params.newConcepts;
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true })
      ]).start();
      fetchConcepts(newConcepts);
    } else {
      fetchConcepts();
    }
  }, [route.params]);

  useEffect(() => {
    if (concepts.length > 0) {
      const filtered = searchTerm
        ? concepts.filter(c => 
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (c.keywords && c.keywords.some(k => k.toLowerCase().includes(searchTerm.toLowerCase())))
          )
        : concepts;
      setFilteredConcepts(filtered);
    }
  }, [searchTerm, concepts]);

  const normalizeAndCluster = (conceptsData) => {
    const similarityMap = {};
    
    const normalizedConcepts = conceptsData.map(c => {
      return {
        ...c,
        normalizedName: c.name.toLowerCase().trim(),
        keywords: c.keywords || []
      };
    });
    
    
    normalizedConcepts.forEach(concept => {
      const similar = [];
      normalizedConcepts.forEach(otherConcept => {
       
        if (concept.normalizedName === otherConcept.normalizedName) return;
        
        
        if (
          concept.normalizedName.includes(otherConcept.normalizedName) ||
          otherConcept.normalizedName.includes(concept.normalizedName) ||
          (concept.keywords && otherConcept.keywords && 
           concept.keywords.some(k => otherConcept.keywords.includes(k)))
        ) {
          similar.push(otherConcept.name);
        }
      });
      
      if (similar.length > 0) {
        similarityMap[concept.name] = similar;
      }
    });
    
    setSimilarConceptsMap(similarityMap);
    return normalizedConcepts;
  };

  const fetchConcepts = async (newConcepts = []) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/concepts`);
      let conceptsData = res.data.concepts || [];
      
      
      conceptsData = conceptsData.map(concept => {
        if (!concept.keywords) {
          
          const keywords = generateKeywords(concept.name);
          return { ...concept, keywords };
        }
        return concept;
      });
      
      
      newConcepts.forEach(conceptName => {
       
        const existingConceptIndex = conceptsData.findIndex(
          c => c.name.toLowerCase() === conceptName.toLowerCase()
        );
        
        if (existingConceptIndex === -1) {
          // Generate keywords for new concept
          const keywords = generateKeywords(conceptName);
          conceptsData.push({ 
            name: conceptName, 
            isNew: true,
            keywords
          });
        } else {
         
          conceptsData[existingConceptIndex] = { 
            ...conceptsData[existingConceptIndex], 
            isUpdated: true 
          };
          
          
          if (!conceptsData[existingConceptIndex].keywords) {
            conceptsData[existingConceptIndex].keywords = generateKeywords(conceptName);
          }
        }
      });
      
      // Normalize and find similar concepts
      const processedConcepts = normalizeAndCluster(conceptsData);
      setConcepts(processedConcepts);
      setFilteredConcepts(processedConcepts);
    } catch (err) {
      console.error("Error fetching concepts:", err);
      Alert.alert("Failed to fetch concepts");
    } finally {
      setLoading(false);
    }
  };

  // Generate keywords from concept name
  const generateKeywords = (conceptName) => {
    const words = conceptName.split(/\s+/);
    const keywords = [];
    
    // Add individual words as keywords
    words.forEach(word => {
      if (word.length > 2) {  
        keywords.push(word.toLowerCase());
      }
    });
    
    // Add the full concept as a keyword
    if (words.length > 1) {
      keywords.push(conceptName.toLowerCase());
    }
    
    return keywords;
  };

  const handleConceptPress = (concept) => {
    navigation.navigate('LinkedNotes', { 
      topic: concept.name,
      keywords: concept.keywords,
      relatedConcepts: similarConceptsMap[concept.name] || []
    });
  };

  const renderConceptCard = (item, index) => {
    const hasSimilarConcepts = similarConceptsMap[item.name] && similarConceptsMap[item.name].length > 0;
    
    return (
      <TouchableOpacity 
        key={index}
        style={[
          styles.card, 
          item.isNew && styles.newCard,
          item.isUpdated && styles.updatedCard,
          hasSimilarConcepts && styles.connectedCard
        ]}
        onPress={() => handleConceptPress(item)}
      >
        {item.isNew && <Text style={styles.newBadge}>NEW</Text>}
        {item.isUpdated && <Text style={styles.updatedBadge}>UPDATED</Text>}
        {hasSimilarConcepts && (
          <View style={styles.connectedBadge}>
            <AntDesign name="link" size={10} color="#4285F4" />
          </View>
        )}
        
        <Text style={styles.cardText}>{item.name}</Text>
        
        {item.keywords && (
          <View style={styles.keywordsContainer}>
            {item.keywords.slice(0, 2).map((keyword, kidx) => (
              <Text key={kidx} style={styles.keywordPill}>
                {keyword}
              </Text>
            ))}
            {item.keywords.length > 2 && (
              <Text style={styles.keywordPill}>+{item.keywords.length - 2}</Text>
            )}
          </View>
        )}
        
        {hasSimilarConcepts && (
          <View style={styles.similarContainer}>
            <Text style={styles.similarText}>
              Similar: {similarConceptsMap[item.name].slice(0, 1).join(', ')}
              {similarConceptsMap[item.name].length > 1 ? ` +${similarConceptsMap[item.name].length - 1}` : ''}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.containerWrapper}>
      <View style={styles.header}>
        <Text style={styles.heading}>🧠 Concept Clusters</Text>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search concepts or keywords..."
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
          {searchTerm.length > 0 && (
            <TouchableOpacity onPress={() => setSearchTerm('')} style={styles.clearSearch}>
              <Ionicons name="close-circle" size={18} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4285F4" />
        </View>
      ) : (
        <ScrollView style={styles.container}>
          <View style={styles.grid}>
            {filteredConcepts.map((item, index) => renderConceptCard(item, index))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  containerWrapper: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 8,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 4,
  },
  clearSearch: {
    padding: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: '#e8f0fe',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    width: '48%',
    position: 'relative',
  },
  newCard: {
    backgroundColor: '#E6F4EA',
    borderWidth: 1,
    borderColor: '#34A853',
  },
  updatedCard: {
    backgroundColor: '#FEF7E0',
    borderWidth: 1,
    borderColor: '#FBBC04',
  },
  connectedCard: {
    borderWidth: 1,
    borderColor: '#4285F4',
  },
  newBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    fontSize: 10,
    fontWeight: 'bold',
    color: '#34A853',
  },
  updatedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FBBC04',
  },
  connectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#E8F0FE',
    padding: 2,
    borderRadius: 4,
  },
  cardText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  keywordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
  },
  keywordPill: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    fontSize: 10,
    marginRight: 4,
    marginBottom: 4,
  },
  similarContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  similarText: {
    fontSize: 10,
    color: '#666',
  },
});