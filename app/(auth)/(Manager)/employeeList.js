import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Picker, CheckBox, TextInput, FlatList, Modal, Button } from 'react-native';
import { router } from 'expo-router';
import { useEffect, button } from 'react';
import { getDatabase, ref, set, onValue, off, update} from "firebase/database";

const ELComponent = () => {

  const navigateToAdminPage = () => {
    router.push('/adminPage');
  };

  const navigateToIndex = () => {
    router.push('/'); 
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={navigateToAdminPage}>
          <Text style={styles.roundedButton}>Home</Text>
        </TouchableOpacity>
        <Text style={styles.center}>Employee List</Text>
        <TouchableOpacity onPress={navigateToIndex}>
          <Text style={styles.roundedButton}>Logout</Text>
        </TouchableOpacity>
      </View>
      <EmployeeList />
    </View>
  );
};

const generateEmployeeID = () => {
    // Generate two random letters (ASCII values for uppercase letters range from 65 to 90)
  const letters = Array.from({ length: 2 }, () => String.fromCharCode(Math.floor(Math.random() * 26) + 65)).join('');
  // Generate four random digits
  const numbers = Array.from({ length: 4 }, () => Math.floor(Math.random() * 10)).join('');
  // Combine and return the ID
  return letters + numbers;
};

  const EmployeeList = () => {
    const [employees, setEmployees] = useState([]);
    const [locations, setLocations] = useState([]);
    const [editedEmployees, setEditedEmployees] = useState({});
    const [currentEmployee, setCurrentEmployee] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [newEmployee, setNewEmployee] = useState({
      companyID: '',
      lastName: '',
      firstName: '',
      id: '',
      position: '',
      location: '',
      socialSecurity: '',
      pay: '',
      status: '',
    });
  const handleInputChange = (fieldName, value) => {
    setNewEmployee({ ...newEmployee, [fieldName]: value });
  };

  const submitEmployees = () => {
    const db = getDatabase();
    const employeesRef = ref(db, 'employees');

    set(employeesRef, employees)
      .then(() => {
        console.log('Employee list saved successfully!');
      })
      .catch((error) => {
        console.error('Error saving employee list:', error);
      });
  };
 
    useEffect(() => {
      const db = getDatabase();
      const employeesRef = ref(db, 'employees');
      const locationsRef = ref(db, 'locations');
  
      const unsubscribeEmployees = onValue(employeesRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const employeeArray = Object.keys(data).map((key) => ({
            ...data[key],
            id: key,
          }));
          setEmployees(employeeArray);
        } else {
          setEmployees([]);
        }
      });
  
      const unsubscribeLocations = onValue(locationsRef, (snapshot) => {
        const locationsData = snapshot.val();
        const loadedLocations = locationsData
          ? Object.keys(locationsData).map((key) => ({
              id: key,
              name: locationsData[key].name,
            }))
          : [];
        setLocations(loadedLocations);
      }, { onlyOnce: true });
  
      return () => {
        off(employeesRef);
        off(locationsRef);
      };
    }, []);
  
    const handleEditEmployee = (employee) => {
      setCurrentEmployee(employee);
      setModalVisible(true);
    };
  
    const handleSaveEmployee = () => {
      if (!currentEmployee) return;
      const db = getDatabase();
      const employeeRef = ref(db, 'employees/' + currentEmployee.id);
  
      update(employeeRef, currentEmployee)
        .then(() => {
          setModalVisible(false);
          setCurrentEmployee(null);
          setEditedEmployees((prevEditedEmployees) => ({
            ...prevEditedEmployees,
            [currentEmployee.employeeID]: false,
          }));
        })
        .catch((error) => {
          console.error('Error updating employee:', error);
        });
    };
  
  const handleModalInputChange = (field, value) => {
    setCurrentEmployee({ ...currentEmployee, [field]: value });
  };

    const addEmployee = () => {
        if (newEmployee.lastName && newEmployee.firstName && newEmployee.position) {
          const uniqueID = generateEmployeeID();
          const employeeToAdd = { ...newEmployee, companyID: uniqueID };
          const db = getDatabase();
          const newEmployeeRef = ref(db, 'employees').push();
      
          set(newEmployeeRef, employeeToAdd)
            .then(() => {
              console.log('New employee added successfully!');
              // Reset newEmployee state to clear the form
              setNewEmployee({
                companyID: '',
                lastName: '',
                firstName: '',
                employeeID: '',
                position: '',
                location: '',
                socialSecurity: '',
                pay: '',
                status: '',
              });
            })
            .catch((error) => {
              console.error('Failed to add new employee:', error);
            });
        }
      };

    const renderHeader = () => (
      <View style={styles.tableHeader}>
        <Text style={styles.headerItem}>Company ID</Text>
        <Text style={styles.headerItem}>Last Name</Text>
        <Text style={styles.headerItem}>First Name</Text>
        <Text style={styles.headerItem}>ID</Text>
        <Text style={styles.headerItem}>Position</Text>
        <Text style={styles.headerItem}>Location</Text>
        <Text style={styles.headerItem}>Social Security</Text>
        <Text style={styles.headerItem}>Salary</Text>
        <Text style={styles.headerItem}>Status</Text>
      </View>
    );
    const renderEmployeeRow = ({ item }) => (
      <TouchableOpacity onPress={() => handleEditEmployee(item)} style={styles.tableRow}>
         {item.id === currentEmployee?.id && editedEmployees[item.id] ? (
              <TextInput
                style={styles.cell}
                value={currentEmployee.companyID}
                onChangeText={(text) => handleModalInputChange('companyID', text)}
                placeholder="Company ID"
              />
            ) : (
              <Text style={styles.cell}>{item.companyID}</Text>
              )}
          
            {item.id === currentEmployee?.id && editedEmployees[item.id] ? (
              <TextInput
                style={styles.cell}
                value={currentEmployee.lastName}
                onChangeText={(text) =>
                  handleModalInputChange('lastName', text)
                }
                placeholder="Last Name"
              />
            ) : (
              <Text style={styles.cell}>{item.lastName}</Text>
              )}
          
           {item.id === currentEmployee?.id && editedEmployees[item.id] ? (
              <TextInput
                style={styles.cell}
                value={currentEmployee.firstName}
                onChangeText={(text) =>
                  handleModalInputChange('firstName', text)
                }
                placeholder="First Name"
              />
            ) : (
              <Text style={styles.cell}>{item.firstName}</Text>
              )}
            {item.id === currentEmployee?.id && editedEmployees[item.id] ? (
              <TextInput
                style={styles.cell}
                value={currentEmployee.employeeID}
                onChangeText={(text) => handleModalInputChange('employeeID', text)}
                placeholder="Employee ID"
              />
            ) : (
              <Text style={styles.cell}>{item.employeeID}</Text>
              )}
            {item.id === currentEmployee?.id && editedEmployees[item.id] ? (
              <TextInput
                style={styles.cell}
                value={currentEmployee.position}
                onChangeText={(text) =>
                  handleModalInputChange('position', text)
                }
                placeholder="Position"
              />
            ) : (
              <Text style={styles.cell}>{item.position}</Text>
              )}
            {item.id === currentEmployee?.id && editedEmployees[item.id] ? (
              <Picker
                selectedValue={currentEmployee.location}
                onValueChange={(itemValue, itemIndex) =>
                  handleModalInputChange('location', itemValue)
                }
              >
                <Picker.Item label="Select a Location" value="" />
                {locations.map((location) => (
                  <Picker.Item
                    key={location.id}
                    label={location.name}
                    value={location.name}
                  />
                ))}
              </Picker>
            ) : (
              <Text style={styles.cell}>{item.location}</Text>
              )}
            {item.id === currentEmployee?.id && editedEmployees[item.id] ? (
              <TextInput
                style={styles.cell}
                value={currentEmployee.socialSecurity}
                onChangeText={(text) =>
                  handleModalInputChange('socialSecurity', text)
                }
                placeholder="Social Security"
              />
            ) : (
              <Text style={styles.cell}>{item.socialSecurity}</Text>
              )}
            {item.id === currentEmployee?.id && editedEmployees[item.id] ? (
              <TextInput
              style={styles.cell}
                value={String(currentEmployee.salary)}
                onChangeText={(text) => handleModalInputChange('salary', text)}
                placeholder="Salary"
              />
            ) : (
              <Text style={styles.cell}>{item.salary}</Text>
              )}
            {item.id === currentEmployee?.id && editedEmployees[item.id] ? (
              <TextInput
                style={styles.cell}
                value={currentEmployee.status}
                onChangeText={(text) =>
                  handleModalInputChange('status', text)
                }
                placeholder="Status"
              />
            ) : (
              <Text style={styles.cell}>{item.status}</Text>
              )}
         </TouchableOpacity>
    );
return (
      <View style={styles.container}>
        <View style={styles.tableContainer}>
          <FlatList
            data={employees}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderEmployeeRow}
            ListHeaderComponent={renderHeader}
          />
        </View>
        <View style={styles.addEmployeeContainer}>
          {modalVisible && currentEmployee && (
            <Modal
              animationType="slide"
              transparent={true}
              visible={modalVisible}
              onRequestClose={() => {
                setModalVisible(!modalVisible);
              }}
            >
          <View style={styles.modalOverlay}>
        <View style={styles.modalView}>    
      <View style={styles.modalContent}>
      <TextInput
          style={styles.input}
          value={currentEmployee.companyID}
          onChangeText={(text) => handleModalInputChange('companyID', text)}
          placeholder="Company ID"
        />
        <TextInput
          style={styles.input}
          value={currentEmployee.lastName}
          onChangeText={(text) => handleModalInputChange('lastName', text)}
          placeholder="Last Name"
        />
        <TextInput
          style={styles.input}
          value={currentEmployee.firstName}
          onChangeText={(text) => handleModalInputChange('firstName', text)}
          placeholder="First Name"
        />
        <TextInput
          style={styles.input}
          value={String(currentEmployee.employeeID)}
          onChangeText={(text) => handleModalInputChange('employeeID', text)}
          placeholder="Employee ID"
        />
        <TextInput
          style={styles.input}
          value={currentEmployee.position}
          onChangeText={(text) => handleModalInputChange('position', text)}
          placeholder="Position"
        />
        <TextInput
          style={styles.input}
          value={currentEmployee.location}
          onChangeText={(text) => handleModalInputChange('location', text)}
          placeholder="Location"
        />
        <TextInput
          style={styles.input}
          value={currentEmployee.socialSecurity}
          onChangeText={(text) => handleModalInputChange('socialSecurity', text)}
          placeholder="Social Security"
        />
        <TextInput
          style={styles.input}
          value={String(currentEmployee.salary)}
          onChangeText={(text) => handleModalInputChange('salary', text)}
          placeholder="Salary"
        />
        <TextInput
          style={styles.input}
          value={currentEmployee.status}
          onChangeText={(text) => handleModalInputChange('status', text)}
          placeholder="Status"
        />
              <Button title="Save Changes" onPress={handleSaveEmployee} />
              <Button title="Cancel" onPress={() => setModalVisible(false)} />
            </View>
            </View>
            </View>
          </Modal>
        )}
      </View>
      <View style={styles.addEmployeeContainer}>
            <View style={styles.addEmployeeContainer}>
            <TextInput
                    style={styles.input}
                    placeholder="Company ID"
                    value={newEmployee.companyID}
                    onChangeText={(text) => handleInputChange('companyID', text)}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Last Name"
                    value={newEmployee.lastName}
                    onChangeText={(text) => handleInputChange('lastName', text)}
                />
                <TextInput
                    style={styles.input}
                    placeholder="First Name"
                    value={newEmployee.firstName}
                    onChangeText={(text) => handleInputChange('firstName', text)}
                />
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <TextInput
                  style={[styles.input, { flex: 1, marginRight: 275 }]}  
                  value={String(currentEmployee?.employeeID || '')}
                  editable={false}
                  placeholder="Employee ID"
                />
                <TouchableOpacity
                  style={styles.generateButton}
                  onPress={() => {
                    const newID = generateEmployeeID();
                    handleModalInputChange('employeeID', newID);
                  }}
                >
                  <Text style={[styles.generateButtonText, { marginLeft: -200 }]}>Generate ID</Text>
                </TouchableOpacity>
              </View>
                <TextInput
                    style={styles.input}
                    placeholder="Position"
                    value={newEmployee.position}
                    onChangeText={(text) => handleInputChange('position', text)}
                />
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={newEmployee.location}
                    onValueChange={(itemValue, itemIndex) => handleInputChange('location', itemValue)}
                  >
                    <Picker.Item label="Select a Location" value="" />
                    {locations.map((location) => (
                      <Picker.Item key={location.id} label={location.name} value={location.name} />
                    ))}
                  </Picker>
                </View>
                <TextInput
                    style={styles.input}
                    placeholder="Social Security"
                    value={newEmployee.socialSecurity}
                    onChangeText={(text) => handleInputChange('socialSecurity', text)}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Salary"
                    value={newEmployee.pay}
                    onChangeText={(text) => handleInputChange('pay', text)}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Status"
                    value={newEmployee.status}
                    onChangeText={(text) => handleInputChange('status', text)}
                />
                </View>
                <View style={styles.buttonRow}>
                    <TouchableOpacity onPress={addEmployee}>
                    <Text style={styles.addButton}>Add Employee</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={submitEmployees}>
                    <Text style={styles.submitButton}>Save</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f4f4f4',
  },
  columnHeader: {
    color: 'white',
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
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
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#ccc',
    padding: 10,
  },
  cell: {
    flex: 1,
    padding: 10,
    textAlign: 'center',
    alignItems: 'center',
    flexDirection: 'row', // This should be 'row' to lay items out horizontally
    justifyContent: 'space-start', // Distributes space evenly between the items
    alignItems: 'center', // Align items vertically in the center
    borderBottomWidth: 1, // Add a bottom border to separate rows
    borderColor: '#ccc', // Color for the bottom border
    paddingVertical: 10, // Vertical padding for each row
    paddingHorizontal: 5, // Horizontal padding for each row
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
  tableContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingVertical: 10,
    textAlign: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  tableHeader: {
    margin: 5,
    flexDirection: 'row',
    borderRadius: 20,
    justifyContent: 'space-evenly',
    paddingVertical: 10,
    backgroundColor: '#50C878',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 1,
    borderColor: '#000'
},
submitButton: {
    backgroundColor: '#50C878',
    color: 'white',
    padding: 10,
    borderRadius: 5,
    textAlign: 'center',
},
editButton: {
    backgroundColor: '#50C878',
    color: 'white',
    padding: 10,
    borderRadius: 5,
    textAlign: 'center',
},
headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    backgroundColor: '#50C878', 
    paddingVertical: 10,
    textAlign: 'center',
},
headerItem: {
  flex: 1,
  padding: 10,
  textAlign: 'center',
  fontWeight: 'bold',
},
  addEmployeeContainer: {
    textAlign: 'center',
    marginTop: 20,
    borderBottomWidth: 1,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
    width: '100%',
    padding: 10,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
    height: 40,
    width: '82%',
    justifyContent: 'center',
  },
  employeeRow: { //this is what i need to work on. 
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingVertical: 10,
    textAlign: 'center',
    alignItems: 'center',
    marginTop: 5,
  },
  rowCell: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 10,
  },
  rowText: {
    flex: 1, 
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,

  },
  modalView: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    marginHorizontal: 20, // Adjust as necessary
  },
  modalButton: {
    backgroundColor: "#50C878",
    borderRadius: 5,
    padding: 10,
    elevation: 2,
    marginTop: 10,
    width: '80%',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background for overlay
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '80%', // Adjust width as necessary
  },
  addButton: {
    backgroundColor: '#50C878',
    color: 'white',
    padding: 10,
    borderRadius: 5,
    textAlign: 'center',
  },
  input: {
    flex: 1, 
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    width: '80%', // Example width
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center"
  },
  modalButtonClose: {
    backgroundColor: "#2196F3",
  },
  modalButtonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },
});

export default ELComponent;