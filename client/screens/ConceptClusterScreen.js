// import React, { useEffect, useState, useRef } from 'react';
// import { 
//   View, 
//   Text, 
//   TouchableOpacity, 
//   ScrollView, 
//   StyleSheet, 
//   ActivityIndicator, 
//   Alert,
//   Animated,
//   Image,
//   Dimensions
// } from 'react-native';
// import axios from 'axios';
// import { API } from '../config';
// import { Ionicons } from '@expo/vector-icons';

// const { width } = Dimensions.get('window');

// export default function ConceptClusterScreen({ navigation, route }) {
//   const [concepts, setConcepts] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [selectedConcept, setSelectedConcept] = useState(null);
//   const [notes, setNotes] = useState([]);
//   const [notesLoading, setNotesLoading] = useState(false);
//   // Animation values
//   const fadeAnim = useRef(new Animated.Value(0)).current;
//   const slideAnim = useRef(new Animated.Value(50)).current;

//   // Check if we received new concepts from upload
//   useEffect(() => {
//     if (route.params?.newConcepts && route.params?.fromUpload) {
//       // Highlight these concepts or pre-select one
//       const newConcepts = route.params.newConcepts;
      
//       // Add animation when new concepts arrive
//       Animated.parallel([
//         Animated.timing(fadeAnim, {
//           toValue: 1,
//           duration: 800,
//           useNativeDriver: true,
//         }),
//         Animated.timing(slideAnim, {
//           toValue: 0,
//           duration: 600,
//           useNativeDriver: true,
//         })
//       ]).start();
      
//       // Fetch all concepts and add the new ones if they don't exist
//       fetchConcepts(newConcepts);
//     } else {
//       fetchConcepts();
//       // Set default animation values
//       fadeAnim.setValue(1);
//       slideAnim.setValue(0);
//     }
//   }, [route.params]);

//   const fetchConcepts = async (newConcepts = []) => {
//     setLoading(true);
//     try {
//       const res = await axios.get(`${API}/concepts`);
//       let conceptsData = res.data.concepts || [];
      
//       // If we have new concepts from upload, ensure they exist in our list
//       if (newConcepts.length > 0) {
//         const existingConceptNames = conceptsData.map(c => c.name);
        
//         // Add any new concepts that don't exist yet
//         newConcepts.forEach(concept => {
//           if (!existingConceptNames.includes(concept)) {
//             conceptsData.push({ name: concept, isNew: true });
//           } else {
//             // Mark existing concepts that match new ones
//             const index = conceptsData.findIndex(c => c.name === concept);
//             if (index !== -1) {
//               conceptsData[index].isNew = true;
//             }
//           }
//         });
//       }
      
//       setConcepts(conceptsData);
      
//       // Auto-select the first new concept if it exists
//       const newConceptToSelect = conceptsData.find(c => c.isNew)?.name;
//       if (newConceptToSelect) {
//         fetchNotesByConcept(newConceptToSelect);
//       }
//     } catch (err) {
//       console.error("Concept fetch error:", err);
//       Alert.alert("Failed to fetch concepts");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchNotesByConcept = async (concept) => {
//     setSelectedConcept(concept);
//     setNotes([]);
//     setNotesLoading(true);
//     try {
//       const res = await axios.get(`${API}/related/${concept}`);
//       setNotes(res.data || []);
//     } catch (err) {
//       console.error("Notes fetch error:", err);
//       Alert.alert("Failed to fetch notes for this concept");
//     } finally {
//       setNotesLoading(false);
//     }
//   };

//   const handleConceptPress = (concept) => {
//     // When a concept card is clicked, show notes beneath it
//     fetchNotesByConcept(concept);
//   };

//   const handleViewAllNotes = (concept) => {
//     // Navigate to LinkedNotesScreen for full detailed view
//     navigation.navigate('LinkedNotes', { topic: concept });
//   };

//   const renderConcepts = () => {
//     if (concepts.length === 0) {
//       return (
//         <View style={styles.emptyState}>
//           <Image 
//             source={require('../assets/favicon.png')} 
//             style={styles.emptyImage}
//             // If you don't have this image, you can replace with any other placeholder or remove
//           />
//           <Text style={styles.emptyText}>No concepts found yet.</Text>
//           <Text style={styles.emptySubtext}>
//             Upload notes or images to start building your concept network.
//           </Text>
//           <TouchableOpacity 
//             style={styles.emptyButton}
//             onPress={() => navigation.navigate('UploadAINoteScreen')}
//           >
//             <Text style={styles.emptyButtonText}>Upload Now</Text>
//           </TouchableOpacity>
//         </View>
//       );
//     }

//     return (
//       <View style={styles.grid}>
//         {concepts.map((item, index) => (
//           <Animated.View
//             key={index}
//             style={[
//               item.isNew && { 
//                 opacity: fadeAnim,
//                 transform: [{ translateY: slideAnim }]
//               }
//             ]}
//           >
//             <TouchableOpacity
//               style={[
//                 styles.card,
//                 selectedConcept === item.name && styles.selectedCard,
//                 item.isNew && styles.newCard
//               ]}
//               onPress={() => handleConceptPress(item.name)}
//             >
//               {item.isNew && (
//                 <View style={styles.newBadge}>
//                   <Text style={styles.newBadgeText}>NEW</Text>
//                 </View>
//               )}
//               <Text style={styles.cardText}>{item.name}</Text>
//             </TouchableOpacity>
//           </Animated.View>
//         ))}
//       </View>
//     );
//   };

//   return (
//     <ScrollView style={styles.container}>
//       <View style={styles.header}>
//         <Text style={styles.heading}>🧠 Concept Clusters</Text>
//         <TouchableOpacity 
//           style={styles.uploadButton}
//           onPress={() => navigation.navigate('UploadAINoteScreen')}
//         >
//           <Ionicons name="add-circle" size={24} color="#4285F4" />
//           <Text style={styles.uploadButtonText}>Add</Text>
//         </TouchableOpacity>
//       </View>

//       {loading ? (
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color="#4285F4" />
//           <Text style={styles.loadingText}>Loading concepts...</Text>
//         </View>
//       ) : (
//         renderConcepts()
//       )}

//       {selectedConcept && (
//         <View style={styles.selectedConceptSection}>
//           <View style={styles.sectionHeader}>
//             <Text style={styles.subheading}>📂 Notes related to "{selectedConcept}"</Text>
//             <TouchableOpacity 
//               style={styles.viewAllButton}
//               onPress={() => handleViewAllNotes(selectedConcept)}
//             >
//               <Text style={styles.viewAllButtonText}>View All</Text>
//               <Ionicons name="arrow-forward" size={16} color="#4285F4" />
//             </TouchableOpacity>
//           </View>
          
//           {notesLoading ? (
//             <ActivityIndicator size="small" color="#4285F4" style={styles.notesLoading} />
//           ) : notes.length > 0 ? (
//             notes.slice(0, 3).map((note, idx) => (
//               <TouchableOpacity 
//                 key={idx} 
//                 style={styles.noteCard}
//                 onPress={() => navigation.navigate('LinkedNotes', { 
//                   topic: selectedConcept,
//                   selectedNote: note
//                 })}
//               >
//                 <Text style={styles.noteContent} numberOfLines={3}>
//                   {note.content}
//                 </Text>
//                 <View style={styles.noteFooter}>
//                   <Text style={styles.noteConcepts}>
//                     🔍 {note.concepts?.filter(c => c !== selectedConcept).slice(0, 2).join(', ')}
//                     {note.concepts?.length > 3 ? '...' : ''}
//                   </Text>
//                   <Text style={styles.readMore}>Read more</Text>
//                 </View>
//               </TouchableOpacity>
//             ))
//           ) : (
//             <View style={styles.emptyNotesContainer}>
//               <Text style={styles.emptyNotesText}>No notes found for this concept.</Text>
//               <TouchableOpacity 
//                 style={styles.createButton}
//                 onPress={() => navigation.navigate('UploadAINoteScreen')}
//               >
//                 <Text style={styles.createButtonText}>Add New Note</Text>
//               </TouchableOpacity>
//             </View>
//           )}
//         </View>
//       )}
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#FFFFFF',
//     padding: 16,
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   heading: {
//     fontSize: 28,
//     fontWeight: 'bold',
//     color: '#333',
//   },
//   uploadButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#E8F0FE',
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     borderRadius: 20,
//   },
//   uploadButtonText: {
//     color: '#4285F4',
//     fontWeight: '600',
//     marginLeft: 4,
//   },
//   categoryHeading: {
//     fontSize: 18,
//     fontWeight: '600',
//     marginTop: 15,
//     marginBottom: 10,
//     color: '#555',
//   },
//   grid: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     justifyContent: 'space-between',
//   },
//   card: {
//     backgroundColor: '#e8f0fe',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 12,
//     width: width / 2 - 24,
//     elevation: 2,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//     position: 'relative',
//   },
//   selectedCard: {
//     backgroundColor: '#d2e3fc',
//     borderWidth: 2,
//     borderColor: '#4285F4',
//   },
//   newCard: {
//     backgroundColor: '#E6F4EA',
//     borderWidth: 1,
//     borderColor: '#34A853',
//   },
//   cardText: {
//     fontWeight: 'bold',
//     fontSize: 16,
//     color: '#333',
//   },
//   newBadge: {
//     position: 'absolute',
//     top: -8,
//     right: -8,
//     backgroundColor: '#34A853',
//     borderRadius: 12,
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//   },
//   newBadgeText: {
//     color: 'white',
//     fontSize: 10,
//     fontWeight: 'bold',
//   },
//   selectedConceptSection: {
//     marginTop: 30,
//     backgroundColor: '#f8f9fa',
//     borderRadius: 12,
//     padding: 16,
//   },
//   sectionHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 15,
//   },
//   subheading: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#333',
//     flex: 1,
//   },
//   viewAllButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   viewAllButtonText: {
//     color: '#4285F4',
//     marginRight: 4,
//   },
//   noteCard: {
//     backgroundColor: 'white',
//     borderRadius: 8,
//     padding: 16,
//     marginBottom: 10,
//     borderLeftWidth: 3,
//     borderLeftColor: '#4285F4',
//     elevation: 1,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 1,
//   },
//   noteContent: {
//     fontSize: 14,
//     color: '#333',
//     lineHeight: 20,
//   },
//   noteFooter: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginTop: 10,
//   },
//   noteConcepts: {
//     fontStyle: 'italic',
//     fontSize: 12,
//     color: '#666',
//   },
//   readMore: {
//     color: '#4285F4',
//     fontSize: 12,
//     fontWeight: '500',
//   },
//   loadingContainer: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 40,
//   },
//   loadingText: {
//     marginTop: 10,
//     color: '#4285F4',
//   },
//   notesLoading: {
//     marginVertical: 20,
//   },
//   emptyState: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 50,
//   },
//   emptyImage: {
//     width: 120,
//     height: 120,
//     marginBottom: 20,
//     opacity: 0.7,
//   },
//   emptyText: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#666',
//     marginBottom: 10,
//   },
//   emptySubtext: {
//     fontSize: 14,
//     color: '#888',
//     textAlign: 'center',
//     marginHorizontal: 40,
//     marginBottom: 20,
//   },
//   emptyButton: {
//     backgroundColor: '#4285F4',
//     paddingHorizontal: 24,
//     paddingVertical: 12,
//     borderRadius: 25,
//   },
//   emptyButtonText: {
//     color: 'white',
//     fontWeight: 'bold',
//   },
//   emptyNotesContainer: {
//     alignItems: 'center',
//     paddingVertical: 20,
//   },
//   emptyNotesText: {
//     color: '#666',
//     marginBottom: 15,
//   },
//   createButton: {
//     backgroundColor: '#4285F4',
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     borderRadius: 20,
//   },
//   createButtonText: {
//     color: 'white',
//     fontWeight: '500',
//   },
// });

// import React, { useEffect, useState } from 'react';
// import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
// import axios from 'axios';
// import { API } from '../config';

// export default function ConceptClusterScreen({ navigation, route }) {
//   const [concepts, setConcepts] = useState([]);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     if (route.params?.newConcepts && route.params?.fromUpload) {
//       fetchConcepts(route.params.newConcepts);
//     } else {
//       fetchConcepts();
//     }
//   }, [route.params]);

//   const fetchConcepts = async (newConcepts = []) => {
//     setLoading(true);
//     try {
//       const res = await axios.get(`${API}/concepts`);
//       let conceptsData = res.data.concepts || [];
//       const existingConceptNames = conceptsData.map(c => c.name);
      
//       newConcepts.forEach(concept => {
//         if (!existingConceptNames.includes(concept)) {
//           conceptsData.push({ name: concept, isNew: true });
//         } else {
//           const index = conceptsData.findIndex(c => c.name === concept);
//           if (index !== -1) {
//             conceptsData[index].isNew = true;
//           }
//         }
//       });

//       setConcepts(groupSimilarConcepts(conceptsData));
//     } catch (err) {
//       Alert.alert("Failed to fetch concepts");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const groupSimilarConcepts = (concepts) => {
//     let groupedConcepts = {};
//     concepts.forEach(concept => {
//       const key = findSimilarConceptKey(concept.name, Object.keys(groupedConcepts)) || concept.name;
//       if (!groupedConcepts[key]) {
//         groupedConcepts[key] = [];
//       }
//       groupedConcepts[key].push(concept);
//     });
//     return Object.entries(groupedConcepts).map(([key, values]) => ({ name: key, variations: values.map(c => c.name) }));
//   };

//   const findSimilarConceptKey = (concept, keys) => {
//     return keys.find(key => key.toLowerCase().includes(concept.toLowerCase()) || concept.toLowerCase().includes(key.toLowerCase()));
//   };

//   return (
//     <ScrollView style={styles.container}>
//       <Text style={styles.heading}>Concept Clusters</Text>
//       {loading ? (
//         <Text>Loading concepts...</Text>
//       ) : (
//         concepts.map((item, index) => (
//           <TouchableOpacity key={index} style={styles.card} onPress={() => navigation.navigate('LinkedNotes', { topic: item.name })}>
//             <Text style={styles.cardText}>{item.name}</Text>
//             {item.variations.length > 1 && <Text style={styles.variationText}>Includes: {item.variations.join(', ')}</Text>}
//           </TouchableOpacity>
//         ))
//       )}
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 16 },
//   heading: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
//   card: { backgroundColor: '#e8f0fe', padding: 16, marginBottom: 10, borderRadius: 8 },
//   cardText: { fontSize: 18, fontWeight: 'bold' },
//   variationText: { fontSize: 14, color: '#555', marginTop: 5 }
// });

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
    // Create a similarity map for concepts
    const similarityMap = {};
    
    // First pass - normalize names (lowercase, trim)
    const normalizedConcepts = conceptsData.map(c => {
      return {
        ...c,
        normalizedName: c.name.toLowerCase().trim(),
        keywords: c.keywords || []
      };
    });
    
    // Second pass - find similar concepts
    normalizedConcepts.forEach(concept => {
      const similar = [];
      normalizedConcepts.forEach(otherConcept => {
        // Skip self-comparison
        if (concept.normalizedName === otherConcept.normalizedName) return;
        
        // Check for similar concepts based on:
        // 1. Levenshtein distance (simplified here with includes)
        // 2. One being substring of another
        // 3. Sharing keywords
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
      
      // Add keywords to existing concepts if they don't have them
      conceptsData = conceptsData.map(concept => {
        if (!concept.keywords) {
          // Generate keywords from the concept name
          const keywords = generateKeywords(concept.name);
          return { ...concept, keywords };
        }
        return concept;
      });
      
      // Add new concepts if they don't already exist
      newConcepts.forEach(conceptName => {
        // Check if the concept already exists (case insensitive)
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
          // Mark existing concepts as updated if they were re-uploaded
          conceptsData[existingConceptIndex] = { 
            ...conceptsData[existingConceptIndex], 
            isUpdated: true 
          };
          
          // If the existing concept doesn't have keywords, add them
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
      if (word.length > 2) {  // Only add words with more than 2 chars
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