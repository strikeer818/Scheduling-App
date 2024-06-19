import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getDatabase, ref, onValue, set, push } from 'firebase/database';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import DateTimePicker from '@react-native-community/datetimepicker';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';

const users = {
  'PY9646': { uid: '1', name: 'Bob', employeeId: 'PY9646', location: 'Sylmar', position: 'Front of House', shift: '1:00 PM - 5:00 PM' },
  'CL5154': { uid: '2', name: 'Alejandro', employeeId: 'CL5154', location: 'Northridge', position: 'Cashier', shift: '9:00 AM - 5:00 PM' },
};
                  {/* CHANGE THIS FOR VIDEO Alejandro, Cashier, Northridge 9:00 AM - 5:00PM */}
                  {/* CHANGE THIS FOR VIDEO Bob, Front of House, Sylmar 1:00 PM - 5:00PM */}

const ShiftSwap = () => {
  const [myShiftLocations, setMyShiftLocations] = useState([]);
  const [otherShiftLocations, setOtherShiftLocations] = useState([]);
  const [selectedShift, setSelectedShift] = useState(null);
  const [showPendingSwaps, setShowPendingSwaps] = useState(false);
  const [pendingSwaps, setPendingSwaps] = useState([]);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [myShiftDetails, setMyShiftDetails] = useState(null);
  const [loggedInUser, setLoggedInUser] = useState(null);

  useEffect(() => {
    const mockLogin = (employeeId) => {
      const user = users[employeeId];
      if (user) {
        setLoggedInUser(user);
      } else {
        console.log("User not found");
      }
    };

    mockLogin('PY9646');
  }, []);
  
  
  const fetchPendingSwaps = async () => {
    const db = getDatabase();
    const pendingSwapsRef = ref(db, `pending-actions`);
  
    onValue(pendingSwapsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const fetchedPendingSwaps = [];
        snapshot.forEach((childSnapshot) => {
          const swaps = childSnapshot.val();
          Object.values(swaps).forEach((swap) => {
            // Make sure the swap is pending and the logged-in user is not the one who requested it
            if (swap.status === 'pending' && swap.requesterId !== loggedInUser.uid) {
              // Add your own logic here to handle the swap display for the user who needs to respond
              fetchedPendingSwaps.push({ ...swap, key: childSnapshot.key });
            }
          });
        });
        setPendingSwaps(fetchedPendingSwaps);
      } else {
        setPendingSwaps([]);
      }
    });
  };
  
  const cancelSwap = (swapKey) => {
    const userId = 'uniqueUserId'; // Replace with actual logic to get the authenticated user's ID
    const db = getDatabase();
    const swapRef = ref(db, `pending-actions/${userId}/${swapKey}`);
    
    set(swapRef, null) // Setting a Firebase path to null deletes it
      .then(() => {
        alert('Shift swap cancelled.');
        // Remove the swap from the state to update the UI
        setPendingSwaps(prevSwaps => prevSwaps.filter(swap => swap.key !== swapKey));
      })
      .catch((error) => {
        alert('Failed to cancel shift swap: ' + error.message);
      });
  };

  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(false);
    setDate(currentDate);
  };

// This is the useEffect hook where you fetch pending swap requests
useEffect(() => {
  if (loggedInUser) {
    const db = getDatabase();
    // Assuming 'swap-requests' is the path where swap requests are stored
    const swapsRef = ref(db, 'swap-requests');

    onValue(swapsRef, (snapshot) => {
      const allSwaps = snapshot.val() || {};
      // Filter the swaps where the logged-in user is the target
      const relevantSwaps = Object.keys(allSwaps).map(key => {
        const swap = allSwaps[key];
        if (swap.targetId === loggedInUser.uid && swap.status === 'pending') { 
          return { key, ...swap };
        } else {
          return null;
        }
      }).filter(Boolean);

      setPendingSwaps(relevantSwaps);
    });
  }
}, [loggedInUser]);

  useEffect(() => {
    const fetchMyShifts = async () => {
      try {
        const db = getDatabase();
        const schedulesRef = ref(db, 'availability');
        const otherShiftsRef = ref(db, 'employees');
  
        onValue(schedulesRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            const locations = Object.values(data).map((employee) => ({
              firstName: employee.firstName,
              position: employee.position,
              location: employee.location,
              time: employee.monday,
              // status: employee.status
            }));
            setMyShiftLocations(locations);
          } else {
            setMyShiftLocations([]);
          }
        });
        onValue(otherShiftsRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            const otherShifts = Object.values(data).map((shift) => ({
              firstName: shift.firstName,
              location: shift.location,
              position: shift.position,
            }));
            setOtherShiftLocations(otherShifts);
          } else {
            setOtherShiftLocations([]);
          }
        });
      } catch (error) {
        console.error('Error fetching employee shifts:', error);
      }
    };
  
    fetchMyShifts();
  }, []);

const approveSwap = (swapKey) => {
  const db = getDatabase();
  const swapRef = ref(db, `pending-actions/${loggedInUser.uid}/${swapKey}`);

  // Update only the status property
  set(swapRef, {
    status: 'approved',
  })
  .then(() => {
    alert('Swap approved.');
    // Refresh the pending swaps to reflect the change
    fetchPendingSwaps();
  })
  .catch((error) => {
    alert('Failed to approve swap: ' + error.message);
  });
};

const denySwap = (swapKey) => {
  const db = getDatabase();
  const swapRef = ref(db, `pending-actions/${loggedInUser.uid}/${swapKey}`);

  // Update only the status property
  set(swapRef, {
    status: 'denied',
  })
  .then(() => {
    alert('Swap denied.');
    // Refresh the pending swaps to reflect the change
    fetchPendingSwaps();
  })
  .catch((error) => {
    alert('Failed to deny swap: ' + error.message);
  });
};
  
  const requestSwap = () => {
    if (!selectedShift) {
      alert('Please select a shift to swap with.');
      return;
    }
  
    if (!selectedShift.position || !selectedShift.location || !selectedShift.firstName) {
      alert('Selected shift does not contain all required information.');
      return;
    }
  
    if (!loggedInUser) {
      console.log('User ID is not available');
      return;
    }
  
    const shiftKey = `${selectedShift.firstName}_${selectedShift.position}_${selectedShift.location}`;
    const formattedDate = date.toISOString().split('T')[0];
  
    const db = getDatabase();
    const pendingActionsRef = ref(db, `pending-actions/${loggedInUser.uid}`);
  
    // Create a new pending action entry
    const newPendingActionRef = push(pendingActionsRef);
    set(newPendingActionRef, {
      shiftKey: shiftKey,
      time: "1:00 PM - 5:00 PM", // Use the hardcoded time for the shift
      position: selectedShift.position,
      location: selectedShift.location,
      date: formattedDate, // Save the selected date
      status: 'pending',
      requestedAt: Date.now(),
      requesterId: loggedInUser.uid, // Save the ID of the requester
      requesterName: loggedInUser.name // Save the name of the requester
    })
    .then(() => {
      alert('Request has been submitted.');
    })
    .catch((error) => {
      alert('Failed to save shift swap request: ' + error.message);
    });
  };
  
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.swapSection}>
          <View style={styles.calendarHeader}>
              <TouchableOpacity
                style={styles.calendarButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.calendarButtonText}>
                  Select Date: {date.toLocaleDateString()}
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={date}
                  mode={'date'}
                  is24Hour={true}
                  display="default"
                  onChange={onChangeDate}
                />
              )}
            </View>
            <View style={styles.header}>
    <Text style={styles.headerText}>My Shift</Text>
    <TouchableOpacity
      style={styles.pendingButton}
      onPress={() => {
        setShowPendingSwaps(!showPendingSwaps);
        if (!showPendingSwaps) {
          fetchPendingSwaps();
        }
      }}
    >
      <MaterialIcons name="pending-actions" size={37} color="#04AA6D" />
    </TouchableOpacity>
  </View>
  {myShiftLocations.map((location, index) => (
            <View key={index}>
              <Text style={styles.locationHeader}></Text>
              <View style={styles.employeeRow}>
              <View style={styles.employeeDetail}>
                  <Text style={styles.firstNameLocation}>{loggedInUser.location}</Text>
                  {/* CHANGE THIS FOR VIDEO */}
                  <Text style={styles.positionTime}>{loggedInUser.shift}</Text>
                </View>
                <View style={styles.employeeDetail}>
                  {/* CHANGE THIS FOR VIDEO Alejandro, Cashier, Northridge 9:00 AM - 5:00PM*/}
                  {/* CHANGE THIS FOR VIDEO Bob, Front of House, Sylmar 1:00 PM - 5:00PM */}
                  <Text style={styles.firstNameLocation}>{loggedInUser.name}</Text>         
                  <Text style={styles.positionTime}>{loggedInUser.position}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
        
        {/* Request Swap button */}
        <TouchableOpacity 
          style={[styles.requestButton, !selectedShift && styles.buttonDisabled]}
          onPress={requestSwap}
          disabled={!selectedShift}
        >
          <Text style={styles.requestButtonText}>Request Swap</Text>
        </TouchableOpacity>

        {/* Others Shift section */}
        <View style={styles.swapSection}>
          <View style={styles.header}>
            <Text style={styles.headerText}>Swappable Shifts</Text>
          </View>
          {otherShiftLocations.map((otherShift, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.employeeRow,
                selectedShift === otherShift && styles.selectedRow // Style for selected row
              ]}
              onPress={() => setSelectedShift(otherShift)}
            >
              <View style={styles.employeeDetail}>
                <Text style={styles.positionTimeTWO}>{otherShift.location}</Text>
                <Text style={styles.positionTimeTWO}>1:00 PM - 5:00 PM</Text>   
              </View>
              <View style={{flex: 1}}>
              <Text style={styles.firstNameLocationTWO}>{otherShift.firstName}</Text>
              <Text style={styles.positionTimeTWO}>{otherShift.position}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      {showPendingSwaps && (
          <Modal
            animationType="slide"
            transparent={true}
            visible={showPendingSwaps}
            onRequestClose={() => {
              setShowPendingSwaps(!showPendingSwaps);
            }}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalView}>
                {/* Close button at the top right of the modal */}
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => {
                    setShowPendingSwaps(false);
                  }}
                >
                  <Text style={styles.closeButtonText}>X</Text>
                </TouchableOpacity>
                
                {/* Modal content */}
                <Text style={styles.modalTitle}>Pending Requests</Text>
                <ScrollView style={styles.pendingSwapsList}>
                {pendingSwaps.length > 0 ? (
                  pendingSwaps.map((swap, index) => {
                    const swapDate = new Date(swap.date);
                    const displayDate = swapDate ? swapDate.toLocaleDateString() : 'Unknown date';
                    return (
                      <View key={index} style={styles.pendingSwapItem}>
                        <View style={styles.swapDetails}>
                          <Text style={styles.swapPrimaryText}>
                          <Text>Swap with {swap.requesterName} for {swap.shiftKey}</Text>                          </Text>
                          <Text style={styles.swapSecondaryText}>
                            {swap.position} at {swap.location} on {displayDate}
                          </Text>
                          <Text style={styles.swapSecondaryText}>
                            {swap.time}
                          </Text> 
                          <Text style={styles.swapStatusText}>
                          Status: {swap.status.charAt(0).toUpperCase() + swap.status.slice(1)}
                        </Text>
                        </View>
                        <TouchableOpacity onPress={() => approveSwap(swap.key)}>
                          <MaterialIcons name="check-circle" size={24} color="#4CAF50" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => denySwap(swap.key)}>
                          <MaterialIcons name="cancel" size={24} color="#D32F2F" />
                        </TouchableOpacity>
                      </View>
                    );
                  })
                ) : (
                  <Text style={styles.noSwapsText}>No pending swaps at the moment.</Text>
                )}
              </ScrollView>
              </View>
            </View>
          </Modal>
        )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  swapSection: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    paddingTop: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerText: {
    fontSize: 30,
    fontWeight: 'bold',
  },
  pendingButton: {
    //
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dimmed background
  },
  approveButton: {
    marginHorizontal: 5,
    // Add any additional styling you want for the button
  },
  denyButton: {
    marginHorizontal: 5,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%', // Modal width
  },
  closeButton: {
    alignSelf: 'flex-end', // Position the button to the right
    marginBottom: 10,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#333',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  pendingSwapsList: {
    width: '100%', // Full width of the modal content
  },
  swapPrimaryText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  swapSecondaryText: {
    fontSize: 14,
    color: '#555',
  },
  swapName: {
    fontWeight: 'normal', // or keep it 'bold' if you prefer
  },
  cancelButton: {
    // You might not need absolute positioning now
    padding: 10,
  },
  noSwapsText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  pendingSwapItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    padding: 15,
    marginVertical: 8,
  },
  swapStatusText: {
    fontSize: 14,
    color: '#555',
    marginTop: 5, // Add some space above the status
  },  
  swapDetails: {
    flex: 1,
    marginRight: 10, // Add some space before the cancel button
  },
  employeeRow: {
    flexDirection: 'row-reverse', // Adjusted here
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    alignItems: 'center',
  },
  swapText: {
    fontSize: 16,
    marginBottom: 10,
  },
  noSwapsText: {
    fontSize: 16,
    color: '#666',
  },
  employeeDetail: {
    flexDirection: 'column', 

  },
  firstNameLocation: {
    //fontWeight: 'bold',
    //marginRight: 5,
    textAlign: 'right',

  },
  firstNameLocationTWO: {
    //fontWeight: 'bold',
    //marginRight: 5,
    textAlign: 'left',

  },
  positionTime: {
    color: '#555',
    marginTop: 5,
    textAlign: 'left',
  },
  positionTimeTWO: {
    color: '#555',
    marginTop: 5,
    textAlign: 'left',
  },
 
  requestButton: {
    backgroundColor: '#04AA6D',
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
    margin: 20,
  },
  requestButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  locationHeader: {
    fontSize: 20,
    //fontWeight: 'bold',
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  selectedRow: {
    backgroundColor: '#e0e0e0', // Some color to indicate selection
  },
  calendarHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  calendarButton: {
    backgroundColor: '#e0e0e0',
    padding: 10,
    borderRadius: 5,
  },
  calendarButtonText: {
    fontSize: 18,
  },
});

export default ShiftSwap;