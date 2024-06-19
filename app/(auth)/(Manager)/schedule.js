import React, { useState, useEffect } from 'react';
import { View, Button, TextInput, Modal, StyleSheet, TouchableOpacity, Text, Picker } from 'react-native';
import { Table, Row } from 'react-native-table-component';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import { getDatabase, ref, onValue, get, update } from "firebase/database";
import { set as firebaseSet, update as firebaseUpdate } from "firebase/database";
import { BudgetProvider, useBudget, ADD_EMPLOYEE_EXPENSE } from './BudgetContext';
import { Calendar } from 'react-native-calendars';
import WeatherForm from './WeatherForm';

const headers = ["Employee Name", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday", "Hours scheduled"];


const fetchEmployees = () => {
    return new Promise((resolve, reject) => {
        const db = getDatabase();
        const employeesRef = ref(db, 'employees'); 

        onValue(employeesRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                resolve(Object.values(data));
            } else { 
                reject('No data available');
            }
        }, (error) => {
            reject(error);
        });
    });
};

const budget = {
    income: [
    { description: 'Total Monthly Budget', amount: 2000 }, 
    ],
    expenses: [
      { description: 'Employee Wages', amount: 0 },
    ],
  };

  const Schedule = () => {
    return (
      <BudgetProvider>
        <ScheduleComponent />
      </BudgetProvider>
    );
  };

  const getWeekStart = (date) => {
    const dateCopy = new Date(date.getTime());
    const dayOfWeek = dateCopy.getDay();
    const difference = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; 
    dateCopy.setDate(dateCopy.getDate() + difference);
    return dateCopy;
  };
  
      
const weekDates = (startOfWeek) => {
    return Array.from({ length: 7 }).map((_, index) => {
        const day = new Date(startOfWeek.getTime());
        day.setDate(day.getDate() + index);
        return day;
    });
}; 
const getWeekDatesArray = (startOfWeek) => {
    return Array.from({ length: 7 }).map((_, index) => {
        const day = new Date(startOfWeek.getTime());
        day.setDate(day.getDate() + index);
        return day;
    });
}; 

const getWeekdayFromDate = (date) => {
    const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return weekdays[date.getDay()];
  };
const ScheduleComponent = () => {
    const [weekDates, setWeekDates] = useState([]);
    const {budgetDispatch} = useBudget();
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [locations, setLocations] = useState([]);
    const [location, setLocation] = useState('');
    const [selectedLocation, setSelectedLocation] = useState(locations.length > 0 ? locations[0].name : '');
    const [locationFilter, setLocationFilter] = useState(''); // this part will let us store or save it for a bit
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isModalVisible, setModalVisible] = useState(false);
    const [modalType, setModalType] = useState('EMPLOYEE'); 
    const [newEmployee, setNewEmployee] = useState({ name: '', location: '' });
    const [selectedRowIndex, setSelectedRowIndex] = useState(null);
    const [selectedDay, setSelectedDay] = useState('');
    const {budgetState} = useBudget();
    const totalIncome = budgetState.income.reduce((total, item) => total + item.amount, 0);
    const totalExpenses = budgetState.expenses.reduce((total, item) => total + item.amount, 0);
    const [weekStart, setWeekStart] = useState(new Date());
    const [weekEnd, setWeekEnd] = useState(new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000)); 
    const totalBalance = totalIncome - totalExpenses;
    const [weekDaysArray, setWeekDaysArray] = useState([]);
    const [wages, setSalaries] = useState([]);
    const [weekWeather, setWeekWeather] = useState([]);
    const [weekWeatherImage, setWeekWeatherImage] = useState([]);
    const { updateEmployeeWagesExpense } = useBudget();
    const [schedule, setSchedule] = useState(null);
    const [isLoading, setIsLoading] = useState(true); // Added a loading state
    const [editedSchedule, setEditedSchedule] = useState([]);
    const [shiftData, setShiftData] = useState({
        startTime: '',
        endTime: '',
        location: ''
    })
    

    useEffect(() => {
        const db = getDatabase();
        const employeesRef = ref(db, 'employees');
        const locationsRef = ref(db, 'locations');
    
        // Subscribe to employees data changes
        const unsubscribeEmployees = onValue(employeesRef, (snapshot) => {
            const employeesData = snapshot.val();
            if (employeesData) {
                const loadedEmployees = Object.keys(employeesData).map(key => ({
                    id: key,
                    name: `${employeesData[key].firstName} ${employeesData[key].lastName}`,
                    employeeID: employeesData[key].employeeID,
                    position: employeesData[key].position,
                    location: employeesData[key].location,
                    hourlyWage: employeesData[key].hourlyWage,
                    shifts: employeesData[key].shifts || {},
                }));
                setData(loadedEmployees);
                setFilteredData(loadedEmployees);
            } else {
                console.log('No employees data available.');
                setData([]);
                setFilteredData([]);
            }
        });
    
        // Subscribe to locations data changes
        const unsubscribeLocations = onValue(locationsRef, (snapshot) => {
            const locationsData = snapshot.val();
            if (locationsData) {
                const loadedLocations = Object.values(locationsData).map(location => ({
                    id: location.id,
                    name: location.name,
                }));
                setLocations(loadedLocations);
            }
        }, {
            onlyOnce: false
        });
    
        // Set up initial state based on the current date
        const calculatedWeekStart = getWeekStart(selectedDate);
        setWeekStart(calculatedWeekStart);
        setWeekEnd(new Date(calculatedWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000));
    
        const datesForWeek = getWeekDatesArray(calculatedWeekStart);
        setWeekDaysArray(datesForWeek);
    
        // Cleanup function
        return () => {
            unsubscribeEmployees(); // Unsubscribe from employees data changes
            unsubscribeLocations(); // Unsubscribe from locations data changes
            setWeekWeather([]); // Optional: Reset weekWeather state on component unmount
        };
    }, [selectedDate]); // Rerun the effect if selectedDate changes
    

    const handleTotalHoursChange = (newTotalHours) => {
        setTotalHoursScheduled(newTotalHours);
        const totalCost = newTotalHours * 15; // Assuming 1 hour costs 15
        updateEmployeeWagesExpense(totalCost);
      };
      
      const handleAddShift = () => {
        const hours = calculateHours(shiftData.startTime, shiftData.endTime);
    
        // Update the shift for the selected day
        const updatedFilteredData = [...filteredData];
        const employeeIndex = selectedRowIndex;
        const employee = updatedFilteredData[employeeIndex];
        const day = selectedDay.toLowerCase();
        const shifts = employee.shifts || {};
    
        // Update the local state with the new shift
        shifts[day] = {
            startTime: shiftData.startTime,
            endTime: shiftData.endTime,
            hours: hours,
            location: shiftData.location,
        };
        employee.shifts = shifts;
        updatedFilteredData[employeeIndex] = employee;
    
        const updatedData = data.map((e) =>
            e.id === employee.id ? employee : e
        );
    
        setData(updatedData);
        setFilteredData(updatedFilteredData);
    
        // Close the modal and reset shiftData
        setModalVisible(false);
        setShiftData({ startTime: '', endTime: '', location: '' });
    
        // Recalculate and update budget
        recalculateAndDispatchBudget(updatedData);
    
        // Update Firebase
        const db = getDatabase();
        const shiftRef = ref(db, `employees/${employee.id}/shifts/${day}`);
        firebaseSet(shiftRef, shifts[day])
            .then(() => console.log('Shift added successfully!'))
            .catch((error) => console.error('Failed to add shift:', error));
    };
    
    
    const recalculateAndDispatchBudget = (updatedData) => {
        let totalHours = 0;
        updatedData.forEach(employee => {
            totalHours += totalHoursForWeek(employee);
        });
    
        const totalCost = totalHours * 15; // Assuming $15/hour
        // Dispatch the new total cost as the updated budget, not adding to the existing budget
        budgetDispatch({
            type: ADD_EMPLOYEE_EXPENSE,
            payload: totalCost
        });
    };
    

    const generateSchedule = () => {
        if (data && data.length > 0) {
          // Calculate the total hours scheduled for the team
          let totalHours = 0;
    
          const updatedData = data.map((employee) => {
            const newEmployee = generateRandomShiftsForEmployee(employee);
            totalHours += totalHoursForWeek(newEmployee);
            return newEmployee;
          });
    
          // Update the budget based on the total hours and a rate of 15 per hour
          const totalCost = totalHours * 15;
    
          // Update the "Employee Wages" expense in the budget
          budgetDispatch({
            type: ADD_EMPLOYEE_EXPENSE,
            payload: totalCost,
          });
    
          setData(updatedData);
          setFilteredData(updatedData);
        } else {
          console.log("No employee data available to generate schedule.");
        }
    };
    
        const generateRandomShifts = (employee) => {
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const shifts = {};

        days.forEach((day) => {
            shifts[day] = assignRandomShift();
        });

        return shifts;
        };

        const predefinedShifts = [
        { startTime: '09:00', endTime: '12:00' },
        { startTime: '12:00', endTime: '16:00' },
        { startTime: '16:00', endTime: '21:00' },
        ];

        const calculateShiftHours = (startTime, endTime) => {
        const start = startTime.split(':').map(Number);
        const end = endTime.split(':').map(Number);
        return (end[0] + end[1] / 60) - (start[0] + start[1] / 60);
        };

        const assignRandomShift = () => {
            const randomIndex = Math.floor(Math.random() * predefinedShifts.length);
            const shift = predefinedShifts[randomIndex];
            return {
                ...shift,
                hours: calculateShiftHours(shift.startTime, shift.endTime),
            };
        };
        
        // Function to generate exactly two random shifts for an employee
        const generateRandomShiftsForEmployee = (employee) => {
            const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
            const newShifts = {};

            // Get two unique random days
            const randomDays = days.sort(() => 0.5 - Math.random()).slice(0, 2);

            randomDays.forEach(day => {
                if (!employee.shifts || !employee.shifts[day]) { // Only add if shift doesn't exist
                    newShifts[day] = assignRandomShift();
                }
            });

            return { ...employee, shifts: { ...employee.shifts, ...newShifts } };
        };

    const getWeekDates = (startOfWeek) => {
        return Array.from({ length: 7 }).map((_, index) => {
          const day = new Date(startOfWeek.getTime());
          day.setDate(day.getDate() + index);
          return day;
        });
      };

      const getWeekStart = (date) => {
        const dateCopy = new Date(date.getTime());
        const dayOfWeek = dateCopy.getDay();
        const difference = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        dateCopy.setDate(dateCopy.getDate() + difference);
        return dateCopy;
      };
    
    const onWeekStartChange = (event, selectedDate) => {
        const startDate = selectedDate || weekStart;
        setWeekStart(startDate);
        setWeekEnd(new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000)); // Set the end of the week
    };

    const onWeekEndChange = (event, selectedDate) => {
        const endDate = selectedDate || weekEnd;
        setWeekEnd(endDate);
    };

    const handleInputChange = (fieldName, value) => {
        setNewEmployee({ ...newEmployee, [fieldName]: value });
    };
    
    const calculateWeeklyCost = (employeeData) => {
        const hourlyWage = wages[employeeData.id];
        const totalHours = totalHoursForWeek(employeeData);
        return totalHours * hourlyWage;
    };
    

    // this function will help when the user is trying to change locations.
    const handleLocationChange = (selectedLocation) => {
        setLocationFilter(selectedLocation);
        setSelectedLocation(selectedLocation);

        if (selectedLocation === '') {
            setFilteredData(data);
        } else {
            const filteredEmployees = data.filter(employee => employee.location === selectedLocation);
            setFilteredData(filteredEmployees);
        }
    };

    const renderShiftForDay = (shifts, day) => {
        const shiftDay = day.toLowerCase();
        const shift = shifts[shiftDay];
        if (shift && shift.hours != null) {
          return `${shift.startTime} - ${shift.endTime} (${shift.hours} hrs)`;
        } else {
          return 'Add Shift';
        }
      };
      
      const totalHoursForWeek = (employeeData) => {
        if (!employeeData.shifts) return 0;
        return Object.values(employeeData.shifts).reduce((total, shift) => {
          if (shift && shift.hours != null) {
            return total + shift.hours;
          } else {
            return total;
          }
        }, 0);
      };

    const formatShiftTime = (startTime, endTime, hours) => {
        if (!startTime || !endTime) return ''; 
    
        let [startH, startM] = startTime.split(':').map(Number);
        let [endH, endM] = endTime.split(':').map(Number);
        
        // Convert 24-hour format to 12-hour format with AM/PM
        let startSuffix = startH >= 12 ? 'PM' : 'AM';
        let endSuffix = endH >= 12 ? 'PM' : 'AM';
        startH = startH > 12 ? startH - 12 : startH;
        endH = endH > 12 ? endH - 12 : endH;
    
        // Format minutes to always show as two digits
        startM = startM.toString().padStart(2, '0');
        endM = endM.toString().padStart(2, '0');
    
        return `${startH}:${startM} ${startSuffix} - ${endH}:${endM} ${endSuffix} (${hours} hrs)`;
    };

    const openModalForEmployee = (index) => {
        setModalType('EMPLOYEE');
        setSelectedRowIndex(index);
        setModalVisible(true);
    };

    const openModalForShift = (day, index) => {
        setModalType('SHIFT');
        setSelectedDay(day);
        setSelectedRowIndex(index);
        setModalVisible(true);
    };

    const addEmployeeToSchedule = () => {
        const updatedData = [...data];
        updatedData.push({
            id: data.length,
            name: newEmployee.name,
            shifts: {}
        });
        setData(updatedData);
        setNewEmployee({ name: '' });
        setModalVisible(false);
    };

    // Function to generate a random time between given hours
const getRandomTime = (startHour, endHour) => {
    const hour = Math.floor(Math.random() * (endHour - startHour + 1)) + startHour;
    const minute = Math.floor(Math.random() * 2) * 30; // 0 or 30 minutes
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
};       


const postSchedule = async () => {
    const db = getDatabase();
    
    // Ensure month and date are correctly formatted as MM and DD
    const formatNumber = num => `0${num}`.slice(-2);
    const calculatedWeekStart = getWeekStart(selectedDate); // Assuming this returns the start of the week
    const weekStartString = formatWeekStartDate(calculatedWeekStart); // Format it as needed
    const weekEnd = new Date(calculatedWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
    const endDateString = formatWeekStartDate(weekEnd); 
    const datesForWeek = getWeekDatesArray(weekStart);

    const formattedSchedule = filteredData.map(employee => {
        if (!employee.employeeID) {
            console.error('Missing employee ID for:', employee);
            // You can decide to throw an error or continue with a default value
            employee.employeeID = 'default-id'; // Just a placeholder
        }
        const shiftsForWeek = datesForWeek.map((date, index) => {
            const weekday = getWeekdayFromDate(date);
            const shift = employee.shifts && employee.shifts[weekday] ? {
                startTime: employee.shifts[weekday].startTime,
                endTime: employee.shifts[weekday].endTime,
                hours: employee.shifts[weekday].hours
            } : {
                startTime: 'n/a',
                endTime: 'n/a',
                hours: 'n/a'
            };
            const weather = weekWeather[index] || {}; // Get weather data for the day
            return {
                [date.toISOString().split('T')[0]]: {
                    shift,
                    weather
                }
            };
        });
    

        const combinedShifts = Object.assign({}, ...shiftsForWeek);

        return {
            employeeId: employee.employeeID,
            employeeName: employee.name,
            position: employee.position || 'Not specified',
            shifts: combinedShifts,
            totalHours: totalHoursForWeek(employee)
        };
    });

    const newSchedule = {
        week: `${weekStartString} to ${endDateString}`,
        location: locationFilter,
        schedule: formattedSchedule
    };

    // Use the formatted start of the week as the key for saving
    const schedulePath = `/schedules/${weekStartString}`;
    try {
        await firebaseSet(ref(db, schedulePath), newSchedule);
        console.log('New schedule posted successfully!');
    } catch (error) {
        console.error('Failed to post new schedule:', error);
    }
};



const formatWeekStartDate = (date) => {
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
};

const updateEmployeeShifts = (employeeIndex, day, startTime, endTime) => {
    setData(currentData => {

        const newData = JSON.parse(JSON.stringify(currentData));

        const selectedEmployee = newData[employeeIndex];
        if (!selectedEmployee.shifts) {
            selectedEmployee.shifts = {};
        }
        selectedEmployee.shifts[day] = {
            startTime,
            endTime,
            hours: calculateHours(startTime, endTime),
        };

        return newData;
    });

    // Update the budget
    setData(currentData => {
        const updatedData = [...currentData];
        const selectedEmployee = updatedData[employeeIndex];

        const totalHours = totalHoursForWeek(selectedEmployee);
        const weeklyCost = totalHours * 15;

        budgetDispatch({
            type: ADD_EMPLOYEE_EXPENSE,
            payload: weeklyCost,
        });

        return updatedData;
    });

    // Update the filteredData
    setFilteredData(currentFilteredData => {
        const updatedFilteredData = currentFilteredData.map((employee, index) => {
            if (index === employeeIndex) {
                return {...employee, shifts: {...employee.shifts}};
            }
            return employee;
        });

        return updatedFilteredData;
    });
};

const saveEditedSchedule = async () => {
    const db = getDatabase(); 
    const scheduleToUpdate = {};
    editedSchedule.forEach((employee, index) => {
        scheduleToUpdate[`employee${index}`] = employee;
    });

    try {
        await update(ref(db, `schedules/${weekStartString}`), scheduleToUpdate);
        console.log("Schedule updated successfully!");
    } catch (error) {
        console.error("Failed to update schedule:", error);
    }
};

const checkAndCreateSchedule = async () => {
    setIsLoading(true);
    const db = getDatabase();
    const calculatedWeekStart = getWeekStart(selectedDate);
    const weekStartString = formatWeekStartDate(calculatedWeekStart);
    const scheduleRef = ref(db, `schedules/${weekStartString}`);

    try {
        const snapshot = await get(scheduleRef);
        if (snapshot.exists()) {
            const existingSchedule = snapshot.val();
            const loadedSchedule = translateScheduleData(existingSchedule.schedule);
            setSchedule({ ...existingSchedule, schedule: loadedSchedule });
            console.log('Loaded schedule:', loadedSchedule);
            alert("Schedule loaded successfully.");
        } else {
            console.log("No schedule found for this week. Creating a new one.");
            alert("No schedule found for this week. A new schedule will be created.");
            const newSchedule = {
                week: `${weekStartString} to ${formatWeekEndDate(calculatedWeekStart)}`,
                location: locationFilter,
                schedule: [] // Initialize with a proper default schedule structure if needed
            };
            await set(ref(db, `schedules/${weekStartString}`), newSchedule);
            setSchedule(newSchedule);
            console.log('Created new schedule:', newSchedule);
        }
    } catch (error) {
        console.error("Failed to fetch or create schedule:", error);
        alert("An error occurred while fetching or creating the schedule. Please try again. Check the console for more details.");
    } finally {
        setIsLoading(false);
    }
};

const translateScheduleData = (scheduleDataFromDB) => {
    return scheduleDataFromDB.map(employeeSchedule => {
        const shifts = Object.keys(employeeSchedule.shifts).reduce((acc, date) => {
            const weekday = getWeekdayFromDate(new Date(date));
            acc[weekday] = employeeSchedule.shifts[date];
            return acc;
        }, {});
        
        return {
            ...employeeSchedule,
            shifts: shifts // Here we replaced the date keys with weekday keys
        };
    });
};



const handleEditShift = (employeeIndex, day, newShift) => {
    if (isLoading) {
        console.error("The schedule is still loading, please wait.");
        return;
    }

    // Ensure editedSchedule is defined and not empty
    if (!editedSchedule || editedSchedule.length === 0) {
        console.error("Edited schedule is undefined or empty.");
        return;
    }

    console.log("Current edited schedule:", editedSchedule);

    // Validate employeeIndex is within the bounds of editedSchedule
    if (employeeIndex < 0 || employeeIndex >= editedSchedule.length) {
        console.error("Employee index out of bounds:", employeeIndex);
        return;
    }

    console.log("Employee at index:", employeeIndex, editedSchedule[employeeIndex]);

    // Proceed with updating the schedule
    const updatedSchedule = editedSchedule.map((employee, index) => {
        if (index === employeeIndex) {
            const updatedShifts = { ...employee.shifts, [day.toLowerCase()]: newShift };
            return { ...employee, shifts: updatedShifts };
        }
        return employee;
    });

    setEditedSchedule(employeeIndex, day, newShift);

    // Additional check for employee object and ID
    const employee = updatedSchedule[employeeIndex];
    if (!employee || typeof employee.employeeId === 'undefined') {
        console.error("Employee or Employee ID not found for index:", employeeIndex);
        return;
    }

    // Firebase update logic remains unchanged
    const db = getDatabase();
    const employeeId = employee.employeeId;
    const shiftUpdatePath = `/schedule/{/*${id}*/}key/${employeeId}/shifts/${day.toLowerCase()}`;
    const updates = { [shiftUpdatePath]: newShift };

    update(ref(db), updates)
        .then(() => console.log("Shift updated successfully in Firebase."))
        .catch((error) => console.error("Error updating shift in Firebase:", error));
};




    const removeEmployee = (employeeId) => {
        // Remove the employee from the data array
        const updatedData = data.filter(employee => employee.id !== employeeId);
    
        // Recalculate the total hours for the remaining employees
        let totalHours = updatedData.reduce((total, employee) => {
            return total + totalHoursForWeek(employee);
        }, 0);
    
        // Calculate the new total cost for the remaining employees
        const totalCost = totalHours * 15;
    
        // Update the budget by subtracting the cost for the removed employee
        budgetDispatch({
            type: ADD_EMPLOYEE_EXPENSE,
            payload: totalCost,
        });
    
        setData(updatedData);
        setFilteredData(updatedData.filter(employee => employee.location === locationFilter));
    };
    

    const removeShift = (employeeIndex, day) => {
        let updatedData = [...data];
        const employee = updatedData[employeeIndex];
    
        // Check if the employee has shifts and the specific day shift exists
        if (employee.shifts && employee.shifts[day.toLowerCase()]) {
            // Delete the shift for the specified day
            delete employee.shifts[day.toLowerCase()];
    
            // Update Firebase
            const db = getDatabase();
            const shiftRef = ref(db, `employees/${employee.id}/shifts/${day.toLowerCase()}`);
            firebaseSet(shiftRef, null) // Deleting the shift in Firebase
                .then(() => console.log('Shift removed successfully!'))
                .catch((error) => console.error('Failed to remove shift:', error));
    
            // Update the local state with the new data
            setData(updatedData);
            setFilteredData(updatedData.filter(e => e.location === locationFilter));
        }
    
        // Recalculate total hours after removing the shift
        recalculateAndDispatchBudget(updatedData);
    };
        
    const calculateHours = (start, end) => {
        if (!start || !end) return 0; // Check for undefined values
    
        const [startH, startM] = start.split(':').map(Number);
        const [endH, endM] = end.split(':').map(Number);
    
        let totalHours = (endH + endM / 60) - (startH + startM / 60);
    
        // Subtract 30 minutes for lunch break if the shift is longer than 6 hours
        if (totalHours > 6) {
            totalHours -= 0.5;
        }
    
        return totalHours;
    };
    
    const navigateToAdminPage = () => {
        router.push('/adminPage'); // Navigate to adminPage.js
    };

    const navigateToIndex = () => {
        router.push('/'); // Navigate to index.js
    };

    const moveToPreviousWeek = () => {
        let newDate = new Date(selectedDate.getTime() - 7*24*60*60*1000+1);
        setSelectedDate(newDate);
    }
    
    const moveToNextWeek = () => {
        let newDate = new Date(selectedDate.getTime() + 7*24*60*60*1000+1);
        setSelectedDate(newDate);
    }
    
    return (
        <View style={styles.container}>
                       <View style={styles.topBar}>
                <TouchableOpacity onPress={navigateToAdminPage}>
                    <Text style={styles.buttonText}>Home</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={navigateToIndex}>
                    <Text style={styles.buttonText}>Logout</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.searchContainer}>
            <Button title="Generate Schedule" onPress={generateSchedule} />
            <TextInput 
                style={styles.searchInput} 
                placeholder="Find an Employee"
            />
        <Picker
            selectedValue={locationFilter}
            onValueChange={(itemValue, itemIndex) => handleLocationChange(itemValue)}
        >
        
        <Picker.Item label={"Select a Location"} value="" />
            {
                locations.map((location) => (
                    <Picker.Item 
                        key={location.id}
                        label={location.name} 
                        value={location.name} 
                    />))
            }
        </Picker>
            <View style={styles.dateDisplay}>
                <TouchableOpacity onPress={moveToPreviousWeek}>
                    <Text>{'<'}</Text>
                </TouchableOpacity>
                <Text>
                    {selectedDate.toLocaleDateString()} - 
                    {new Date(selectedDate.getTime() + 6*24*60*60*1000).toLocaleDateString()}
                </Text>
                <TouchableOpacity onPress={moveToNextWeek}>
                    <Text>{'>'}</Text>
                </TouchableOpacity>
            </View>
            <Button title="Go" onPress={checkAndCreateSchedule} />  {/*Added a Go button just for look need to change the color */} 
            <Button title="Post" onPress={postSchedule} />
            <Button title="Save Changes" onPress={saveEditedSchedule} />
            </View>
          
           {schedule && schedule.schedule && schedule.schedule.length > 0 && (
    <Table borderStyle={{ borderWidth: 1 }}>
        {/* Render the schedule rows based on the schedule data */}
        <Row data={headers} style={styles.header} textStyle={styles.headerText} />
        {schedule.schedule.map((employee, employeeIndex) => (
            <Row key={`schedule-${employeeIndex}`} data={[
                employee.employeeName,
                ...headers.slice(1, -1).map(day => {
                    const shift = employee.shifts && employee.shifts[day.toLowerCase()];
                    return (
                        <TextInput
                            style={styles.input}
                            placeholder="Shift"
                            value={shift ? `${shift.startTime} - ${shift.endTime}` : ''}
                            onChangeText={newShift => handleEditShift(employeeIndex, day, newShift)}
                        />
                    );
                }),
                `${employee.totalHours} hrs`
            ]} textStyle={styles.rowText} />
        ))}
    </Table>
)}

{(!schedule || (schedule && schedule.schedule && schedule.schedule.length === 0)) && (
    <Table borderStyle={{ borderWidth: 1 }}>         
        <Row data={headers} style={styles.header} textStyle={styles.headerText} />
        <div>
        <WeatherForm location={selectedLocation} />
        </div>
        <Row data={["Week of", ...weekDaysArray.map(date => date.toLocaleDateString()), ""]} style={styles.header} textStyle={styles.dateText} />
        {filteredData.map((employeeData, rowIndex) => {
            const rowData = [
                <TouchableOpacity onPress={() => openModalForEmployee(rowIndex)}>
                    <Text style={styles.rowText}>{employeeData.name || 'Add Employee'}</Text>
                    <Text style={styles.rowText}>{employeeData.employeeID || 'Employee ID'}</Text>
                    <Text style={styles.positionText}>{employeeData.position || 'Position'}</Text>
                    <Text style={styles.removeButtonText}>Remove</Text>
                </TouchableOpacity>,
                ...headers.slice(1, -1).map(day => {
                    const shift = employeeData.shifts ? employeeData.shifts[day.toLowerCase()] : null;
                    return (
                        <View>
                            <TouchableOpacity onPress={() => openModalForShift(day, rowIndex)}>
                                <Text style={styles.rowText}>
                                    {shift ? `${shift.startTime} - ${shift.endTime} (${shift.hours} hrs)` : 'Add Shift'}
                                </Text>
                            </TouchableOpacity>
                            {shift && (
                                <TouchableOpacity onPress={() => removeShift(rowIndex, day)}>
                                    <Text style={styles.removeButtonText}>Remove Shift</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    );
                }),
                <Text style={styles.rowText}>{totalHoursForWeek(employeeData)} hrs</Text>
            ];

            return (
                <Row key={`employee-${rowIndex}`} data={rowData} />
            );
        })}
    </Table>
)}
            <Modal visible={isModalVisible} animationType="slide">
                {modalType === 'EMPLOYEE' ? (
                    <>
                        <TextInput 
                            style={styles.input} 
                            placeholder="Employee Name" 
                            onChangeText={text => setNewEmployee(prev => ({ ...prev, name: text }))} 
                            value={newEmployee.name} 
                        />
                        <Button title="Add Employee" onPress={addEmployeeToSchedule} />
                    </>
                ) : (
                    <>
                        <TextInput 
                            style={styles.input} 
                            placeholder="Start Time (e.g. 08:00)" 
                            onChangeText={text => setShiftData(prev => ({ ...prev, startTime: text }))} 
                            value={shiftData.startTime}
                        />
                        <TextInput 
                            style={styles.input} 
                            placeholder="End Time (e.g. 17:00)" 
                            onChangeText={text => setShiftData(prev => ({ ...prev, endTime: text }))} 
                            value={shiftData.endTime}
                        />
                        <TextInput 
                            style={styles.input} 
                            placeholder="Location" 
                            onChangeText={text => setShiftData(prev => ({ ...prev, location: text }))} 
                            value={shiftData.location}
                        />
                        <Button title="Add Shift" onPress={handleAddShift} />
                    </>
                )}
                <Button title="Close" onPress={() => setModalVisible(false)} />
            </Modal>

            <Button title="Add New Employee" onPress={() => openModalForEmployee(data.length)} />
            <View style={styles.budgetContainer}>
                <Text>Total Budget: ${totalIncome}</Text>
                <Text>Total Expenses: ${totalExpenses}</Text>
              {totalBalance < 0 ? (
                <>
                    <Text style={styles.negativeBalance}>Remaining Budget: -${Math.abs(totalBalance)}</Text>
                    <Text style={styles.overBudgetWarning}>Warning: Over Budget!</Text>
                </>
            ) : (
                <Text>Remaining Budget: ${totalBalance}</Text>
            )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#f4f4f4', 
        backgroundColor: "#FFFFFF",
        marginTop: 0, //this was 100 before i changed it. Now it looks normal and it is at the top. 
    },
    contentContainer: {
        flex: 1,
        width: '70%', 
        alignSelf: 'center',
        paddingHorizontal: 20,
      },
    negativeBalance: {
        color: 'red', //Michael--Are you ok with this color
    },
    overBudgetWarning: {
        color: 'orange', //Michael--Are you ok with this color
        fontWeight: 'bold',
    },
    dateText: {
        textAlign: 'center',
        fontSize: 12,
        padding: 5,
      },
    weekSelectionContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
    },
    toText: {
        marginHorizontal: 5, 
    },
    dateDisplay: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
    },
    dateRangeText: {
        textAlign: 'center',
        fontSize: 12,
        padding: 5, 
    },
    budgetContainer: {
        position: 'absolute',
        bottom: '0',
        right: '0',
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 8,
        elevation: 4,
    },
    positionText: {
        padding: 5,
        textAlign: 'center',
        },
        removeButtonText: {
            color: 'red',
            textAlign: 'center',
        },
    searchContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    searchInput: {
        flex: 2,
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 8,
        marginRight: 5
    },
    dateDisplay: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    pickerStyle: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ccc',
    },
    input: {
        marginVertical: 10,
        paddingHorizontal: 5,
        paddingVertical: 6,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd'
    },
    header: {
        backgroundColor: '#e0e0e0',
        padding: 0,
    },
    headerText: {
        fontSize: 15,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    dateText: {
        textAlign: 'center',
        fontSize: 12,
        padding: 5,
    },    
    rowText: {
        padding: 10,
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
        overflow: 'hidden'
    },
    buttonText: {
        color: 'white', 
        fontSize: 16
    }
    
});

export default Schedule;
