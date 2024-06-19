import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { startOfWeek, endOfWeek, eachDayOfInterval, format, addMonths } from 'date-fns';
import { Fontisto, Ionicons, FontAwesome, Entypo } from '@expo/vector-icons';

// Dummy data, fill in with real data andrew & alejandro this is all you
const shiftsData = {
    '2024-04-15': [
        { name: 'Aidan K', role: 'LEAD', start: '9:00 am', end: '12:00 pm', break: 'No breaks' },
        { name: 'Ahmad S', role: 'CASHIER', start: '12:00 pm', end: '8:00 pm', break: '30 minute break' },
        { name: 'MY SHIFT', role: 'STORE MANAGER', start: '8:00 pm', end: '11:00 pm', break: 'No breaks' },
    ],
    '2024-04-16': [
        { name: 'Michael B', role: 'JANITOR', start: '12:00 am', end: '8:00 am', break: '30 minute break' },
    ],
    '2024-04-17': [
        { name: 'Andrew G', role: 'CASHIER', start: '1:00 pm', end: '6:00 pm', break: '15 minute break' },
        { name: 'Alejandro C', role: 'CASHIER', start: '4:00 pm', end: '9:00 pm', break: '10 minute break' },
    ],
    '2024-04-18': [
        { name: 'MY SHIFT', role: 'STORE MANAGER', start: '8:00 pm', end: '11:00 pm', break: 'No breaks' },
    ],
    // ...additional dates and their shifts
};

// fill this in with real data using an api
const weatherData = {
    '2024-04-15': { temperature: '73°F', condition: 'sunny' },
    '2024-04-16': { temperature: '65°F', condition: 'cloudy' },
    '2024-04-17': { temperature: '60°F', condition: 'rain' },
    '2024-04-18': { temperature: '68°F', condition: 'sunny' },
    '2024-04-19': { temperature: '75°F', condition: 'sunny' },
    '2024-04-20': { temperature: '77°F', condition: 'cloudy' },
    '2024-04-21': { temperature: '70°F', condition: 'snow' },
};

const getWeatherIcon = (condition) => {
    switch (condition) {
        case 'sunny':
            return <Fontisto name="day-sunny" size={24} color="orange" />;
        case 'rain':
            return <Ionicons name="rainy" size={24} color="blue" />;
        case 'snow':
            return <FontAwesome name="snowflake-o" size={24} color="#ADD8E6" />;
        case 'cloudy':
            return <Entypo name="cloud" size={24} color="gray" />;
        default:
            return null; // Or a default icon?
    }
};




const EmployeeHomepage = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());

    // get the start and end of the week based on the selected date
    const startOfSelectedWeek = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const endOfSelectedWeek = endOfWeek(selectedDate, { weekStartsOn: 1 });
    const daysOfWeek = eachDayOfInterval({ start: startOfSelectedWeek, end: endOfSelectedWeek });

    //function to navigate to the previous or next week
    const navigateWeeks = (direction) => {
        const oneWeek = 7 * 24 * 60 * 60 * 1000;
        const newDate = new Date(selectedDate.getTime() + oneWeek * direction);
        setSelectedDate(newDate);
    };

    //function to format the displayed week range
    const formatWeekRange = (start, end) => {
        return `${format(start, 'M/d/yyyy')} to ${format(end, 'M/d/yyyy')}`;
    };


    const getMonthFromSelectedWeek = () => {
        return format(startOfSelectedWeek, 'MMMM');
    };

    return (
        <ScrollView style={styles.container}>
            {/* Month Display */}
            <View style={styles.monthDisplay}>
                <Text style={styles.monthText}>{getMonthFromSelectedWeek()}</Text>
            </View>

            {/* Week nav header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigateWeeks(-1)}>
                    <MaterialIcons name="arrow-back-ios" size={24} color="#04AA6D" />
                </TouchableOpacity>
                <Text style={styles.headerText}>{formatWeekRange(startOfSelectedWeek, endOfSelectedWeek)}</Text>
                <TouchableOpacity onPress={() => navigateWeeks(1)}>
                    <MaterialIcons name="arrow-forward-ios" size={24} color="#04AA6D" />
                </TouchableOpacity>
            </View>

            {/* Weather and Days Row */}
            <ScrollView horizontal style={styles.daysRow} showsHorizontalScrollIndicator={false}>
                {daysOfWeek.map(day => {
                    const formattedDate = format(day, 'yyyy-MM-dd');
                    const isSelected = formattedDate === format(selectedDate, 'yyyy-MM-dd');
                    const dayShifts = shiftsData[formattedDate];
                    const hasMyShift = dayShifts?.some(shift => shift.name === 'MY SHIFT');

                    return (
                        <View style={styles.dayContainer} key={formattedDate}>
                            {hasMyShift && (
                                <View style={styles.clockIconContainer}>
                                    <FontAwesome name="clock-o" size={24} color="black" />
                                </View>
                            )}
                            <TouchableOpacity
                                style={isSelected ? [styles.dayItem, styles.dayItemSelected] : styles.dayItem}
                                onPress={() => setSelectedDate(day)}
                            >
                                <Text style={styles.dayNameText}>
                                    {format(day, 'EEE')}
                                </Text>
                                <Text style={isSelected ? styles.dayTextSelected : styles.dayText}>
                                    {format(day, 'd')}
                                </Text>
                                <Text style={styles.temperatureText}>
                                    {weatherData[formattedDate]?.temperature || 'No data'}
                                </Text>
                                {getWeatherIcon(weatherData[formattedDate]?.condition)}
                            </TouchableOpacity>
                        </View>
                    );
                })}
            </ScrollView>

            {/* Shifts List */}
            <View style={styles.shiftsListContent}>
                {shiftsData[format(selectedDate, 'yyyy-MM-dd')]?.map((shift, index) => {
                    // Check if it's the user's shift
                    const isMyShift = shift.name === 'MY SHIFT';
                    return (
                        <View key={index} style={[styles.shiftItem, isMyShift && styles.myShift]}>
                            <View style={styles.shiftSectionLeft}>
                                <Text style={styles.shiftName}>{shift.name}</Text>
                                <Text style={styles.shiftRole}>{shift.role}</Text>
                            </View>
                            <View style={styles.shiftSectionRight}>
                                <Text style={styles.shiftTime}>{`${shift.start} - ${shift.end}`}</Text>
                                <Text style={styles.shiftBreak}>{shift.break}</Text>
                            </View>
                        </View>
                    );
                })}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 55,
        paddingTop: 0,
        //backgroundColor: '#04AA6D',
    },
    headerText: {
        fontSize: 18,
        fontWeight: 'bold',
        //color: 'black',
        textAlign: 'center',
        flex: 1, 
    },
    dayContainer: {
        marginHorizontal: 4,
        paddingTop: 10, 
        alignItems: 'center',
      },
      clockIconContainer: {
        position: 'absolute',
        top: 0, 
        zIndex: 10, //appears above the TouchableOpacity
      },
    daysRow: {
        backgroundColor: '#ffffff',
        paddingVertical: 10,
        paddingHorizontal: 5,

    },
    dayItem: {
        marginTop: 20,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#ddd',
        marginHorizontal: 4,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 50, //touchable area is large enough
    },
    dayItemSelected: {
        backgroundColor: '#04AA6D',
        borderColor: '#04AA6D',
    },
    dayNameText: {
        fontSize: 12, 
        color: 'black', 
        fontWeight: 'bold',
        //color: 'red',
    },
    dayText: {
        color: 'black',
        fontSize: 16,
    },
    dayTextSelected: {
        //color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    shiftsList: {
        flex: 1,
        marginTop: 0,
    },
    shiftItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: 8,
        padding: 20,
        borderWidth: 1,
        borderColor: '#eeeeee',
        marginVertical: 10,
        marginHorizontal: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.5,
        elevation: 2,
    },
    shiftSectionLeft: {
        flexDirection: 'column',
        justifyContent: 'center',
        flex: 1, 
    },
    shiftSectionRight: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-end',
        flex: 1, 
    },
    shiftName: {
        fontSize: 26,
        fontWeight: 'bold',
        textAlign: 'left',
    },
    shiftRole: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'left',
    },
    shiftTime: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'right',
    },
    shiftBreak: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'right',
        color: 'red',
    },
    myShift: {
        backgroundColor: '#04AA6D',
    },
    monthDisplay: {
        paddingVertical: 20,
        alignItems: 'center',
        backgroundColor: '#fff', 
    },
    monthText: {
        fontSize: 52, 
        fontWeight: 'bold',
        color: '#04AA6D',
    },
    weatherIcon: {
        width: 25, 
        height: 25, 
        marginTop: 4,
    },
});

export default EmployeeHomepage;