import React, { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native'; 
import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Entypo, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const Layout = () => {
    const isMobile = Platform.OS === 'ios' || Platform.OS === 'android';

    

    if (isMobile) {
        return (
            <SafeAreaProvider>
                <Tabs screenOptions={{headerShown: false}} >
                    <Tabs.Screen name="index1" options={{  tabBarLabel: 'Home', tabBarIcon: () =>
                    (<Ionicons name="home" size={24} color="#04AA6D"/>) }} />
                    <Tabs.Screen name="inbox" options={{  tabBarLabel: 'Inbox', tabBarIcon: () =>
                    (<Entypo name="chat" size={24} color="#04AA6D" />) }} />
                    <Tabs.Screen name="shiftSwap" options={{  tabBarLabel: 'Shift Swap', tabBarIcon: () =>
                    (<Entypo name="swap" size={24} color="#04AA6D" />) }} />
                    <Tabs.Screen name="myAccount" options={{  tabBarLabel: 'My Account', tabBarIcon: () =>
                    (<MaterialCommunityIcons name="account" size={24} color="#04AA6D" />) }} />
                </Tabs>
            </SafeAreaProvider>
        );
    } else {
        return null; // Fallback for non-mobile platforms, consider enhancing
    }
};

export default Layout;
