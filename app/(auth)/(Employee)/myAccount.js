import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';

const MyAccount = () => {

  const TimePickerComponent = ({ day, index, startOrEnd, value, onChange }) => {
    const [showPicker, setShowPicker] = useState(false);
  
    const handleTimeChange = (event, selectedTime) => {
      setShowPicker(Platform.OS === 'ios');
      if (selectedTime) {
        onChange(day, index, startOrEnd, selectedTime);
      }
    };
  
    return (
    <View style={styles.timePickerComponentContainer}>
      <TouchableOpacity onPress={() => setShowPicker(true)} style={styles.timeButton}>
        <Text>
          {value ? value.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : 'Select time'}
        </Text>
      </TouchableOpacity>
      {showPicker && (
        <DateTimePicker
          value={value || new Date()}
          mode="time"
          is24Hour={false}
          display="default"
          onChange={handleTimeChange}
        />
      )}
    </View>
  );
  };
  
  const [editMode, setEditMode] = useState(false);
  const [availability, setAvailability] = useState({
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: [],
  });

  const toggleEditMode = () => {
    if (editMode) {
    
      const filteredAvailability = Object.entries(availability).reduce((acc, [day, timeSlots]) => {
        const filteredTimeSlots = timeSlots.filter(slot => slot.start && slot.end);
        acc[day] = filteredTimeSlots;
        return acc;
      }, {});
  
      setAvailability(filteredAvailability);
    }
    setEditMode(!editMode);
  };
  

  const handleAvailabilityChange = (day, index, startOrEnd, value) => {
    const updatedDay = availability[day].map((timeSlot, i) => {
      if (i === index) {
        return { ...timeSlot, [startOrEnd]: value };
      }
      return timeSlot;
    });

    setAvailability({
      ...availability,
      [day]: updatedDay,
    });
  };

  const addTimeSlot = (day) => {
    const updatedDay = [...availability[day], { start: null, end: null }];
    setAvailability({ ...availability, [day]: updatedDay });
  };
  
  const deleteTimeSlot = (day, index) => {
    const updatedDay = availability[day].filter((_, i) => i !== index);
    setAvailability({ ...availability, [day]: updatedDay });
  };

  return (
    <SafeAreaView style={styles.container}>
    <ScrollView>
      <View style={styles.header}>
        <Text style={styles.title}>My Availability</Text>
        <TouchableOpacity style={styles.editButton} onPress={toggleEditMode}>
          <Text style={styles.editButtonText}>{editMode ? 'Save' : 'Edit'}</Text>
        </TouchableOpacity>
      </View>

      {Object.entries(availability).map(([day, timeSlots]) => (
  <View key={day} style={styles.dayContainer}>
    <Text style={styles.dayText}>{day}</Text>
    {timeSlots.length === 0 && !editMode ? (
      <Text style={styles.unavailableText}>Unavailable</Text>
    ) : (
      <>
        {timeSlots.map((times, index) => (
          <View key={index} style={styles.availabilityRow}>
            <TimePickerComponent
              day={day}
              index={index}
              startOrEnd="start"
              value={times.start}
              onChange={handleAvailabilityChange}
            />
            <Text style={styles.toText}>to</Text>
            <TimePickerComponent
              day={day}
              index={index}
              startOrEnd="end"
              value={times.end}
              onChange={handleAvailabilityChange}
            />
            {editMode && (
              <TouchableOpacity onPress={() => deleteTimeSlot(day, index)} style={styles.deleteButton}>
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
        {editMode && (
          <TouchableOpacity style={styles.addButton} onPress={() => addTimeSlot(day)}>
            <Text style={styles.addButtonText}>+ Add Availability</Text>
          </TouchableOpacity>
        )}
      </>
    )}
  </View>
))}



      <View style={styles.section}>
        <Text style={styles.sectionTitle}>My Position</Text>
        <View style={styles.card}>
          <Text style={styles.sectionContent}>Senior Developer</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>My Salary</Text>
        <View style={styles.card}>
          <Text style={styles.sectionContent}>$100,000/year</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>My Information</Text>
        <View style={styles.card}>
          <Text style={styles.sectionContent}>First Name: John</Text>
          <Text style={styles.sectionContent}>Last Name: Doe</Text>
          <Text style={styles.sectionContent}>Address: 123 White house St, oval office, DC 12345</Text>
          <Text style={styles.sectionContent}>Phone Number: (123) 456-7890</Text>
          <Text style={styles.sectionContent}>Email: joe@gmail.com</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} >
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //paddingVertical: 20
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
  },
  availabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  unavailableText: {
    fontStyle: 'italic',
    marginLeft: 20,
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: 'green',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginLeft: 20,
    marginTop: 5,
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
  },
  dayContainer: {
    backgroundColor: '#f7f7f7', 
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 5,
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2, // for Android
  },
  dayText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333', 
    marginBottom: 10, 
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc', 
    padding: 10,
    width: 90, 
    borderRadius: 5, 
    backgroundColor: '#fff', 
    marginRight: 5,
  },
  addButton: {
    backgroundColor: '#04AA6D', 
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 5,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: '#FF3B30', 
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginLeft: 10,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 14,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 15, 
  },
  
  sectionTitle: {
    fontSize: 30,
    fontWeight: '600',
    marginBottom: 15, 
  },
  
  card: {
    backgroundColor: '#f7f7f7', 
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 4, // may cause something to look funky so if it does it's this
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2, // for android shadow effect
    marginBottom: 10, 
  },
  
  sectionContent: {
    fontSize: 18,
    marginBottom: 5, 
  },
  logoutButton: {
    backgroundColor: 'red',
    paddingHorizontal: 55,
    paddingVertical: 12,
    borderRadius: 30,
    alignSelf: 'center',
    marginTop: 50,
    marginBottom: 80,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 18,
  },
  timePickerComponentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  timeButton: {
    padding: 10,
    backgroundColor: '#DDD', 
    borderRadius: 5,
    minWidth: 45, 
    alignItems: 'center', 
  },
  
  toText: {
    marginHorizontal: 10, 
    fontSize: 16,
  },
});

export default MyAccount;
