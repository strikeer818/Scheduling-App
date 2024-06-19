import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Picker, CheckBox, TextInput } from 'react-native';
import { router } from 'expo-router';

const MComponent = () => {

  const navigateToAdminPage = () => {
    router.push('/adminPage'); // Navigate to adminPage.js
  };

  const navigateToIndex = () => {
    router.push('/'); // Navigate to index.js
  };
  const navigatetoEmployeeList = () => {
    router.push('/employeeList'); 
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={navigateToAdminPage}>
          <Text style={styles.roundedButton}>Home</Text>
        </TouchableOpacity>
        <Text style={styles.center}>Messages </Text>
        <TouchableOpacity onPress={navigatetoEmployeeList}>
          <Text style={styles.roundedButton}>Logout</Text>
        </TouchableOpacity>
      </View>
      <FrontPage />
    </View>
  );
};

const FrontPage = () => {

    return (
        <View style={styles.container}>
          <Text>Hello World</Text>
        </View>
    );

};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f4f4f4',
  },
  newGoal: {
    
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'rgba(50, 50, 50, 0.7)',
    borderRadius: 20,
    margin: 10,
    overflow: 'hidden',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    backgroundColor: '#ff0000',
  },
  roundedButton: {
    borderRadius: 25,
    backgroundColor: '#50C878',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  center: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  newGoalContainer: {
    backgroundColor: '#EDEDED',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
  },
  newGoalHeader: {
    fontSize: 28,
    textDecorationLine: 'underline',
    marginBottom: 10,
  },
  newNewHeader: {
    fontSize: 28,
    textDecorationLine: 'underline',
    marginBottom: 5,
    alignItems: 'center'
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputContainer2: {
    marginBottom: 5,
    alignContent: 'center',
  },
  inputLabel: {
    fontSize: 20,
    marginBottom: 10,
    fontWeight: 'bold',
    marginTop: 15,
    padding: 10,
    
  },
  picker: {
    height: 50,
    width: '100%',
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 10,
  },
  quickGoalsContainer: {
    backgroundColor: '#F4F4F4',
    padding: 20,
    borderRadius: 10,
  },
  quickGoalsHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  checkboxContainer: {
    flexDirection: 'column',
    marginBottom: 20,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  checkbox: {
    marginLeft: 10,
  },
  label: {
    marginLeft: 10,
  },
  middlePageContainer: {
    backgroundColor: 'white',
    borderColor: '#e1e1e1',
    paddingLeft: 10,
    
  },
  middlePageHeader: {
    fontSize: 32,
    padding: 10,
    textDecorationLine: 'underline',
    paddingTop: 20,
    paddingBottom: 20,
  },
  bottomPageContainer: {
    backgroundColor: '#d3d3d3',
  },
  bottomPageHeader: {
    fontSize: 32,
    padding: 10,
    textDecorationLine: 'underline',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 10,
    height: 40,
    paddingLeft: 10,
    flex: 1,
  },
  inputContainer: {
    flex: 1,
    marginRight: 10,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },  
  picker: {
    height: 40,
    width: 150,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 10,
    marginLeft: 10,
    marginRight: 10,
  },  
  halfInput: {
    flex: 1,
    marginRight: 10,
  },
  expenseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  expenseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  expenseAmount: {
    fontSize: 18,
    color: '#50C878',
  },
  greenButton: {
    borderRadius: 25,
    backgroundColor: '#ff0000',
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginTop: 10, 
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    marginTop: 20,
  },
});

export default MComponent;