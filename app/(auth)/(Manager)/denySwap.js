
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Picker, CheckBox, TextInput, SafeAreaView, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { getDatabase, ref, onValue, update } from 'firebase/database';

const SSComponent = () => {

  const navigateToAdminPage = () => {
    router.push('/adminPage'); // Navigate to adminPage.js
  };

  const navigateToIndex = () => {
    router.push('/'); // Navigate to index.js
  };
  const navigatetoEmployeeList = () => {
    router.push('/employeeList'); 
  };
  const navigatetoPendingSwap = () => {
    router.push('/pendSwap'); 
  };
  const navigatetoApprovedSwap = () => {
    router.push('/approveSwap'); 
  };
  const navigatetoDeniedSwap = () => {
    router.push('/denySwap');
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={navigateToAdminPage}>
          <Text style={styles.roundedButton}>Home</Text>
        </TouchableOpacity>
        <Text style={styles.center}>Approved Swap </Text>
        <TouchableOpacity onPress={navigatetoEmployeeList}>
          <Text style={styles.roundedButton}>Logout</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={navigatetoPendingSwap}>
            <Text style={[styles.header, styles.roundedButton]}>Pending Swap</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={navigatetoApprovedSwap}>
            <Text style={[styles.header, styles.roundedButton]}>Approved Swap</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={navigatetoDeniedSwap}>
            <Text style={[styles.header, styles.roundedButton]}>Denied Swap</Text>
        </TouchableOpacity>
        </View>
      <DS />
    </View>
  );
};

const DS = () => {
    const [deniedSwaps, setDeniedSwaps] = useState([]);

    useEffect(() => {
        const fetchDeniedSwaps = async () => {
            try {
                const db = getDatabase();
                const deniedSwapsRef = ref(db, 'denied-actions');

                onValue(deniedSwapsRef, (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    const fetchedDeniedSwaps = [];
                    Object.keys(data).forEach((swapKey) => {
                        const swap = data[swapKey];
                        fetchedDeniedSwaps.push({ key: swapKey, ...swap });
                    });
                    setDeniedSwaps(fetchedDeniedSwaps);
                } else {
                setDeniedSwaps([]);
            }
        });
      } catch (error) {
        console.error('Error fetching approved swaps:', error);
      }
    };

    fetchDeniedSwaps();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.swapContainer}>
          <Text style={styles.headerText}>Denied Swaps</Text>
          {deniedSwaps.map((swap, index) => (
            <View key={index} style={styles.deniedSwapItem}>
              {/* Display approved swap details */}
              <Text>Date: {swap.date}</Text>
              <Text>Requester Name: {swap.requesterName}</Text>
              {/*<Text>Shift Key: {swap.shiftKey}</Text>*/}
              <Text>Position: {swap.position}</Text>
              <Text>Location: {swap.location}</Text>
              <Text>Time: {swap.time}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
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
  swapContainer: {
    padding: 20,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  pendingSwapItem: {
    marginBottom: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  deniedSwapItem: {
    marginBottom: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
});

export default SSComponent;
