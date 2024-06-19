import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Picker, CheckBox, TextInput, FlatList, Modal, Button } from 'react-native';
import { router } from 'expo-router';
import { useEffect, button } from 'react';
import { getDatabase, ref, set, onValue, off, update} from "firebase/database";

const availability = () => {

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
        <Text style={styles.center}>Availability</Text>
        <TouchableOpacity onPress={navigateToIndex}>
          <Text style={styles.roundedButton}>Logout</Text>
        </TouchableOpacity>
      </View>
      <EmployeeList />
    </View>
  );
};

  const EmployeeList = () => {
    const [employees, setEmployees] = useState([]);
    const [locations, setLocations] = useState([]);
    const [editedEmployees, setEditedEmployees] = useState({});
    const [currentEmployee, setCurrentEmployee] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [newEmployee, setNewEmployee] = useState({
      lastName: '',
      firstName: '',
      id: '',
      monday: '',
      tuesday: '',
      wednesday: '',
      thursday: '',
      friday: '',
      saturday: '',
      sunday: '',
    });
  const handleInputChange = (fieldName, value) => {
    setNewEmployee({ ...newEmployee, [fieldName]: value });
  };

  const submitEmployees = () => {
    const db = getDatabase();
    const employeesRef = ref(db, 'employee');

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
    const employeesRef = ref(db, 'availability');

    const unsubscribe = onValue(employeesRef, (snapshot) => {
      const data = snapshot.val() || {};
      setEmployees(Object.keys(data).map(key => ({ id: key, ...data[key] })));
    });

    return () => unsubscribe();
  }, []);

  // Function to handle saving availability to a separate path
  const saveAvailability = (employeeId, availability) => {
    const db = getDatabase();
    const availabilityRef = ref(db, `availability/${employeeId}`);

    set(availabilityRef, availability)
      .then(() => console.log('Availability saved successfully!'))
      .catch(error => console.error('Error saving availability:', error));
  };

  // Function to open modal for editing availability
  const handleEditAvailability = (employee) => {
    setCurrentEmployee(employee);
    setModalVisible(true);
  };

  // Function to handle changes in the availability form
  const handleAvailabilityChange = (day, timeType, value) => {
    setCurrentEmployee((prev) => ({
      ...prev,
      [day]: { ...prev[day], [timeType]: value },
    }));
  };
  

  // Function to submit changes and close modal
  const handleSaveChanges = () => {
    if (!currentEmployee) return;

    const { id, ...availability } = currentEmployee;
    saveAvailability(id, availability);
    setModalVisible(false);
    setCurrentEmployee(null); 
  };
  const handleModalInputChange = (field, value) => {
    setCurrentEmployee({ ...currentEmployee, [field]: value });
  };

  const addEmployee = () => {
    if (newEmployee.lastName && newEmployee.firstName) {
      const db = getDatabase();
      // Use push to automatically generate a unique ID for the new employee
      const newEmployeeRef = ref(db, 'employees').push();
      set(newEmployeeRef, newEmployee)
        .then(() => {
          console.log('New employee added successfully!');
          // Reset newEmployee state to clear the form
          setNewEmployee({
            lastName: '',
            firstName: '',
            id: '',
            monday: { start: '', end: '' },
            tuesday: { start: '', end: '' },
            wednesday: { start: '', end: '' },
            thursday:{ start: '', end: '' },
            friday: { start: '', end: '' },
            saturday: { start: '', end: '' },
            sunday: { start: '', end: '' },
          });
        })
        .catch((error) => {
          console.error('Failed to add new employee:', error);
        });
    }
  };
  const renderTimeInput = (day, timeType, value, onChange) => {
    return (
      <View style={styles.timeInputContainer}>
        <TextInput
          style={styles.timeInput}
          value={value}
          onChangeText={(text) => onChange(day, timeType, text)}
          placeholder={`${timeType} Time`}
          keyboardType="numeric"
        />
        <Picker
          selectedValue={value.slice(-2)}
          style={styles.amPmPicker}
          onValueChange={(itemValue, itemIndex) =>
            onChange(day, timeType, `${value.slice(0, -2)}${itemValue}`)
          }>
          <Picker.Item label="AM" value="AM" />
          <Picker.Item label="PM" value="PM" />
        </Picker>
      </View>
    );
  };
  

    const renderHeader = () => (
    <View style={styles.tableHeader}>
        <Text style={styles.headerItem}>Last Name</Text>
        <Text style={styles.headerItem}>First Name</Text>
        <Text style={styles.headerItem}>ID</Text>
        <Text style={styles.headerItem}>Monday</Text>
        <Text style={styles.headerItem}>Tuesday</Text>
        <Text style={styles.headerItem}>Wednesday</Text>
        <Text style={styles.headerItem}>Thursday</Text>
        <Text style={styles.headerItem}>Friday</Text>
        <Text style={styles.headerItem}>Saturday</Text>
        <Text style={styles.headerItem}>Sunday</Text>
      </View>
    );

    const renderEmployeeRow = ({ item }) => (
        <TouchableOpacity onPress={() => handleEditAvailability(item)} style={styles.tableRow}>
          {item.id === currentEmployee?.id && editedEmployees[item.id] ? (
            <TextInput
              style={styles.cell}
              value={currentEmployee.lastName}
              onChangeText={(text) => handleModalInputChange('lastName', text)}
              placeholder="Last Name"
            />
          ) : (
            <Text style={styles.cell}>{item.lastName}</Text>
          )}
          
          {item.id === currentEmployee?.id && editedEmployees[item.id] ? (
            <TextInput
              style={styles.cell}
              value={currentEmployee.firstName}
              onChangeText={(text) => handleModalInputChange('firstName', text)}
              placeholder="First Name"
            />
          ) : (
            <Text style={styles.cell}>{item.firstName}</Text>
          )}
      
          <Text style={styles.cell}>{item.id}</Text>
          
          {item.id === currentEmployee?.id && editedEmployees[item.id] ? (
            <TextInput
              style={styles.cell}
              value={currentEmployee.monday}
              onChangeText={(text) => handleModalInputChange('monday', text)}
              placeholder="Monday"
            />
          ) : (
            <Text style={styles.cell}>{item.monday}</Text>
          )}
          
          {item.id === currentEmployee?.id && editedEmployees[item.id] ? (
            <TextInput
              style={styles.cell}
              value={currentEmployee.tuesday}
              onChangeText={(text) => handleModalInputChange('tuesday', text)}
              placeholder="Tuesday"
            />
          ) : (
            <Text style={styles.cell}>{item.tuesday}</Text>
          )}
          
          {item.id === currentEmployee?.id && editedEmployees[item.id] ? (
            <TextInput
              style={styles.cell}
              value={currentEmployee.wednesday}
              onChangeText={(text) => handleModalInputChange('wednesday', text)}
              placeholder="Wednesday"
            />
          ) : (
            <Text style={styles.cell}>{item.wednesday}</Text>
          )}
          
          {item.id === currentEmployee?.id && editedEmployees[item.id] ? (
            <TextInput
              style={styles.cell}
              value={currentEmployee.thursday}
              onChangeText={(text) => handleModalInputChange('thursday', text)}
              placeholder="Thursday"
            />
          ) : (
            <Text style={styles.cell}>{item.thursday}</Text>
          )}
          
          {item.id === currentEmployee?.id && editedEmployees[item.id] ? (
            <TextInput
              style={styles.cell}
              value={currentEmployee.friday}
              onChangeText={(text) => handleModalInputChange('friday', text)}
              placeholder="Friday"
            />
          ) : (
            <Text style={styles.cell}>{item.friday}</Text>
          )}
          
          {item.id === currentEmployee?.id && editedEmployees[item.id] ? (
            <TextInput
              style={styles.cell}
              value={currentEmployee.saturday}
              onChangeText={(text) => handleModalInputChange('saturday', text)}
              placeholder="Saturday"
            />
          ) : (
            <Text style={styles.cell}>{item.saturday}</Text>
          )}
          
          {item.id === currentEmployee?.id && editedEmployees[item.id] ? (
            <TextInput
              style={styles.cell}
              value={currentEmployee.sunday}
              onChangeText={(text) => handleModalInputChange('sunday', text)}
              placeholder="Sunday"
            />
          ) : (
            <Text style={styles.cell}>{item.sunday}</Text>
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
          value={String(currentEmployee.id)}
          onChangeText={(text) => handleModalInputChange('id', text)}
          placeholder="ID"
        />
        <TextInput
          style={styles.input}
          value={currentEmployee.monday}
          onChangeText={(text) => handleModalInputChange('monday', text)}
          placeholder="monday"
        />
        <TextInput
          style={styles.input}
          value={currentEmployee.tuesday}
          onChangeText={(text) => handleModalInputChange('tuesday', text)}
          placeholder="tuesday"
        />
        <TextInput
          style={styles.input}
          value={currentEmployee.wednesday}
          onChangeText={(text) => handleModalInputChange('wednesday', text)}
          placeholder="wednesday"
        />
        <TextInput
          style={styles.input}
          value={String(currentEmployee.thursday)}
          onChangeText={(text) => handleModalInputChange('thursday', text)}
          placeholder="thursday"
        />
        <TextInput
          style={styles.input}
          value={currentEmployee.friday}
          onChangeText={(text) => handleModalInputChange('friday', text)}
          placeholder="friday"
        />
        <TextInput
          style={styles.input}
          value={String(currentEmployee.saturday)}
          onChangeText={(text) => handleModalInputChange('saturday', text)}
          placeholder="saturday"
        />
        <TextInput
          style={styles.input}
          value={String(currentEmployee.sunday)}
          onChangeText={(text) => handleModalInputChange('sunday', text)}
          placeholder="sunday"
        />
              <Button title="Save Changes" onPress={handleSaveChanges} />
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
                <TextInput
                    style={styles.input}
                    placeholder="ID"
                    value={newEmployee.id}
                    onChangeText={(Number) => handleInputChange('id', Number)}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Monday"
                    value={newEmployee.monday}
                    onChangeText={(text) => handleInputChange('monday', text)}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Tuesday"
                    value={newEmployee.tuesday}
                    onChangeText={(text) => handleInputChange('tuesday', text)}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Wednesday"
                    value={newEmployee.wednesday}
                    onChangeText={(text) => handleInputChange('wednesday', text)}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Thursday"
                    value={newEmployee.thursday}
                    onChangeText={(text) => handleInputChange('thursday', text)}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Friday"
                    value={newEmployee.friday}
                    onChangeText={(text) => handleInputChange('friday', text)}
                />                
                <TextInput
                style={styles.input}
                placeholder="Saturday"
                value={newEmployee.saturday}
                onChangeText={(text) => handleInputChange('saturday', text)}
                />
                 <TextInput
                    style={styles.input}
                    placeholder="Sunday"
                    value={newEmployee.sunday}
                    onChangeText={(text) => handleInputChange('sunday', text)}
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
    borderColor: '#ccc',
    borderWidth: 1,
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
    borderWidth: 1, // Border around the TextInput
    borderColor: '#ccc', // Color of the border
    borderRadius: 5, // Rounded corners of the TextInput
    padding: 8, // Padding inside the TextInput
    textAlign: 'center', // Center the text horizontally
    marginHorizontal: 2, // Margin between cells
    flex: 1, // Take up the space it needs based on flex
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
        flexDirection: 'row', // This should be 'row' to lay items out horizontally
        justifyContent: 'space-start', // Distributes space evenly between the items
        alignItems: 'center', // Align items vertically in the center
        borderBottomWidth: 1, // Add a bottom border to separate rows
        borderColor: '#ccc', // Color for the bottom border
        paddingVertical: 10, // Vertical padding for each row
        paddingHorizontal: 5, // Horizontal padding for each row
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
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  rowText: {
    textAlign: 'center',
  },
});

export default availability;