import React, { useState, useEffect, createContext, useContext } from 'react';
import { View, ScrollView, StyleSheet, Image, Text } from 'react-native';
import { Button } from 'react-native-elements';
import { getDatabase, ref, onValue } from "firebase/database";
import { router } from 'expo-router';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [employeeId, setEmployeeId] = useState(null);

  return (
    <AuthContext.Provider value={{ employeeId, setEmployeeId }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
const EmployeePage = () => {
  const auth = useAuth();
  const employeeId = auth ? auth.employeeId : null;
    const [schedule, setSchedule] = useState(null);


  useEffect(() => {
    const db = getDatabase();
    const today = new Date();
    const scheduleRef = ref(db, `schedules/${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`);

    // Listen for schedule updates
    const unsubscribe = onValue(scheduleRef, (snapshot) => {
      const schedules = snapshot.val() || {};
      const employeeSchedule = Object.values(schedules).find(sch => sch.employeeId === employeeId);
      setSchedule(employeeSchedule);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, [employeeId]);

  function handleLogout(){
    router.push('/');
  }

  // Render the employee's schedule
  const renderSchedule = () => {
    if (!schedule) return <Text>No schedule available</Text>;
    // Render the schedule details, e.g., as a list of shifts
  };

  return (
    <ScrollView style={{ flex: 1, padding: 10 }}>
       
      {/* This is the Top Bar with Logo and Logout */}
      <View style={styles.topBar}>
        
        {/* Logo goes hereeeee*/}
        <Image
          source={{ uri: 'https://cdn.glitch.global/1c8d8485-d588-4c98-aa36-65523065f7c6/thumbnails%2Fideogram%20(7).jpeg?1695770167340' }}
          style={{ width: 50, height: 50, borderRadius: 25 }}
        />
        <Button
          title="Logout"
          onPress={handleLogout}
          buttonStyle={{ backgroundColor: 'red' }} // Customize button styles
        />
      </View>
      
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
      {features && features.map((feature, index) => (
          <Button 
            key={index} 
            containerStyle={{ width: '30%', margin: 5 }}
            buttonStyle={{ padding: 10, backgroundColor: '#BFF5BF' }} 
            titleStyle={{ fontSize: 14, color: '#058C42' }} 
            icon={
              <Icon 
                name={feature.icon} 
                size={40} 
                color="#058C42" 
                style={{ marginBottom: 5 }}
              />
            }
            title={feature.name}
            onPress={() => {
                router.push(feature.route);
            }}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    contentContainer: {
      flex: 1,
      width: '70%', 
      alignSelf: 'center',
      paddingHorizontal: 20,
    },
    topBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 10,
      backgroundColor: 'rgba(50, 50, 50, 0.7)',  
      borderRadius: 20,
      margin: 10,
      overflow: 'hidden'
    }
});

export default EmployeePage;