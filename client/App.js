import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './screens/HomeScreen';
import UploadAINoteScreen from './screens/UploadAiNoteScreen';
import LinkedNotesScreen from './screens/LinkedNotesScreen';
import ConceptClusterScreen from './screens/ConceptClusterScreen';






const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="LinkedNotes" component={LinkedNotesScreen} />
        <Stack.Screen name="ConceptCluster" component={ConceptClusterScreen} />
        <Stack.Screen name="UploadAINote" component={UploadAINoteScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
// checking for upload