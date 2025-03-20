import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  TextInput,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getGeminiInsights, askGeminiQuestion } from "../services/gemini";

export default function LinkedNotesScreen({ navigation, route }) {
  const [topic, setTopic] = useState(route.params?.topic || "");
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(false);
  const [keywords, setKeywords] = useState([]);
  
  // Question functionality state
  const [question, setQuestion] = useState("");
  const [answerLoading, setAnswerLoading] = useState(false);
  const [questionHistory, setQuestionHistory] = useState([]);
  const scrollViewRef = useRef();

  useEffect(() => {
    if (topic) {
      fetchInsights(topic);
    }
  }, [topic]);

  const fetchInsights = async (searchTopic) => {
    setLoading(true);
    try {
      const data = await getGeminiInsights(searchTopic);
      setInsight(data);
      
      // Extract potential keywords from the insight
      extractKeywords(data);
    } catch (err) {
      setInsight("⚠ Unable to retrieve insights.");
    } finally {
      setLoading(false);
    }
  };

  // Function to extract keywords from the insight text
  const extractKeywords = (text) => {
    if (!text) return;
    
    // Simple keyword extraction - this could be improved with NLP
    // Currently looks for capitalized words or phrases in quotes
    const capitalizedWords = text.match(/\b[A-Z][a-zA-Z]{2,}\b/g) || [];
    const quotedPhrases = text.match(/"([^"]+)"/g) || [];
    
    // Clean up quoted phrases by removing quotes
    const cleanedPhrases = quotedPhrases.map(phrase => phrase.replace(/"/g, ''));
    
    // Combine and remove duplicates
    const extractedKeywords = [...new Set([...capitalizedWords, ...cleanedPhrases])];
    
    // Limit to reasonable number of keywords (10 max)
    setKeywords(extractedKeywords.slice(0, 10));
  };

  // Handler for when a keyword is clicked
  const handleKeywordClick = (keyword) => {
    setTopic(keyword);
    // This will trigger the useEffect to fetch new insights
  };

  // Modified function to render insight as a paragraph
  const renderInsightAsParagraph = () => {
    if (!insight) return null;
    
    // Just return the insight as a paragraph with proper styling
    return (
      <Text style={styles.insightParagraph}>
        {insight}
      </Text>
    );
  };

  // New function to render keywords as a paragraph
  const renderKeywordsAsParagraph = () => {
    if (keywords.length === 0) return null;
    
    return (
      <Text style={styles.keywordsParagraph}>
        {keywords.map((keyword, index) => (
          <Text key={index}>
            <TouchableOpacity onPress={() => handleKeywordClick(keyword)}>
              <Text style={styles.keywordInParagraph}>
                {keyword}
              </Text>
            </TouchableOpacity>
            {index < keywords.length - 1 ? ', ' : ''}
          </Text>
        ))}
      </Text>
    );
  };

  // Function to handle asking a question
  const handleAskQuestion = async () => {
    if (!question.trim()) return;
    
    Keyboard.dismiss();
    setAnswerLoading(true);
    
    const currentQuestion = question.trim();
    setQuestion("");
    
    // Add to question history
    const newQuestion = {
      id: Date.now(),
      question: currentQuestion,
      answer: null
    };
    
    setQuestionHistory([...questionHistory, newQuestion]);
    
    try {
      // Scroll to bottom of the content
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
      
      // Call Gemini API with the context of the topic
      const response = await askGeminiQuestion(topic, currentQuestion);
      
      // Update the question history with the answer
      setQuestionHistory(prevHistory => 
        prevHistory.map(q => 
          q.id === newQuestion.id ? { ...q, answer: response } : q
        )
      );
    } catch (error) {
      // Update with error message
      setQuestionHistory(prevHistory => 
        prevHistory.map(q => 
          q.id === newQuestion.id ? { ...q, answer: "⚠ Unable to get an answer at this time." } : q
        )
      );
    } finally {
      setAnswerLoading(false);
      
      // Scroll to bottom again after answer is received
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  // Render a single Q&A pair
  const renderQAPair = (item) => (
    <View key={item.id} style={styles.qaPairContainer}>
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>
          <Text style={styles.questionLabel}>Q: </Text>
          {item.question}
        </Text>
      </View>
      
      <View style={styles.answerContainer}>
        {item.answer ? (
          <Text style={styles.answerText}>
            <Text style={styles.answerLabel}>A: </Text>
            {item.answer}
          </Text>
        ) : (
          <View style={styles.answerLoadingContainer}>
            <ActivityIndicator size="small" color="#4285F4" />
            <Text style={styles.answerLoadingText}>Getting answer...</Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.heading}>🔎 {topic}</Text>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4285F4" />
          <Text style={styles.loadingText}>Fetching insights...</Text>
        </View>
      ) : (
        <ScrollView ref={scrollViewRef}>
          <View style={styles.insightContainer}>
            <Text style={styles.insightTitle}>Overview:</Text>
            {renderInsightAsParagraph()}
          </View>
          
          {keywords.length > 0 && (
            <View style={styles.keywordsContainer}>
              <Text style={styles.keywordsTitle}>Related Topics:</Text>
              {renderKeywordsAsParagraph()}
            </View>
          )}
          
          {/* Questions and Answers Section */}
          {questionHistory.length > 0 && (
            <View style={styles.qaSection}>
              <Text style={styles.qaSectionTitle}>Questions & Answers:</Text>
              {questionHistory.map(renderQAPair)}
            </View>
          )}
          
          {/* Add some padding at the bottom for scrolling */}
          <View style={{ height: 80 }} />
        </ScrollView>
      )}
      
      {/* Question input area at the bottom */}
      <View style={styles.questionInputContainer}>
        <TextInput
          style={styles.questionInput}
          placeholder="Ask a question about this topic..."
          value={question}
          onChangeText={setQuestion}
          onSubmitEditing={handleAskQuestion}
          returnKeyType="send"
          editable={!answerLoading}
        />
        <TouchableOpacity 
          style={[
            styles.askButton, 
            (!question.trim() || answerLoading) && styles.askButtonDisabled
          ]}
          onPress={handleAskQuestion}
          disabled={!question.trim() || answerLoading}
        >
          {answerLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Ionicons name="send" size={20} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#FFFFFF", 
    padding: 16 
  },
  header: { 
    flexDirection: "row", 
    alignItems: "center", 
    marginBottom: 20 
  },
  backButton: { 
    padding: 5 
  },
  heading: { 
    fontSize: 20, 
    fontWeight: "bold", 
    marginLeft: 10, 
    color: "#333" 
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 10,
    color: '#666'
  },
  insightContainer: {
    marginBottom: 20
  },
  insightTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333"
  },
  // New style for insight paragraph
  insightParagraph: {
    fontSize: 16,
    color: "#333",
    lineHeight: 24,
    textAlign: 'justify'
  },
  keywordsContainer: {
    marginTop: 20,
    marginBottom: 30
  },
  keywordsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333"
  },
  // New style for keywords paragraph
  keywordsParagraph: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333"
  },
  keywordInParagraph: {
    color: "#4285F4",
    fontWeight: "bold",
    textDecorationLine: "underline"
  },
  // Question functionality styles
  questionInputContainer: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0
  },
  questionInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 15,
    marginRight: 10
  },
  askButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4285F4',
    justifyContent: 'center',
    alignItems: 'center'
  },
  askButtonDisabled: {
    backgroundColor: '#A7C8FF'
  },
  qaSection: {
    marginTop: 20,
    marginBottom: 10
  },
  qaSectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333"
  },
  qaPairContainer: {
    marginBottom: 20
  },
  questionContainer: {
    backgroundColor: '#E8F0FE',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 10,
    alignSelf: 'flex-start',
    maxWidth: '90%'
  },
  questionText: {
    fontSize: 15,
    color: '#333'
  },
  questionLabel: {
    fontWeight: 'bold',
    color: '#4285F4'
  },
  answerContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 10,
    alignSelf: 'flex-end',
    maxWidth: '90%'
  },
  answerText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22
  },
  answerLabel: {
    fontWeight: 'bold',
    color: '#333'
  },
  answerLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  answerLoadingText: {
    marginLeft: 10,
    color: '#666',
    fontSize: 14
  }
});