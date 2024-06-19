import React from 'react';
import {Stack} from 'expo-router';
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";


//header: () => null
const Layout = () => {
    return (
        <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false }}>
        </Stack>
        </SafeAreaProvider>

    );
};

export default Layout;
