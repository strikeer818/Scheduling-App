import React, { useEffect, useState } from 'react';
import { View, Platform, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';

const Inbox = () => {
    const [messages, setMessages] = useState([
        { id: '1', type: 'message', from: 'Manager', subject: 'Upcoming Shift', body: 'Your next shift starts tomorrow at 9 AM.' },
        { id: '2', type: 'notification', from: 'System', subject: 'Payroll Update', body: 'Your latest payslip is now available.' },
        // More messages can be added here
    ]);

    useEffect(() => {
        registerForNotifications();
    }, []);

    async function registerForNotifications() {
        if (Platform.OS === 'android') {
            // Create or update the notification channel for Android devices
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        }

        // Request permission to send notifications
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            Alert.alert('Permission Denied', 'Failed to get permission for notifications!');
        }
    }

    const scheduleNotification = async (message) => {
        try {
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: message.subject,
                    body: message.body,
                    data: { message },
                },
                trigger: null, // this will trigger the notification immediately
            });
            Alert.alert("Notification Scheduled", `Your notification for "${message.subject}" has been set.`);
        } catch (error) {
            console.error('Error scheduling notification:', error);
            Alert.alert("Error", "Failed to schedule notification.");
        }
    };

    const handleSelectMessage = (message) => {
        console.log('Selected message:', message);
        scheduleNotification(message);
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity style={styles.messageItem} onPress={() => handleSelectMessage(item)}>
            <Text style={styles.subject}>{item.subject}</Text>
            <Text style={styles.from}>{item.from}</Text>
            <Text style={styles.body} numberOfLines={1}>{item.body}</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={messages}
                renderItem={renderItem}
                keyExtractor={item => item.id}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    messageItem: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    subject: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    from: {
        fontSize: 14,
        color: 'grey',
    },
    body: {
        fontSize: 14,
    },
});

export default Inbox;
