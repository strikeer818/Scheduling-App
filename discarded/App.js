import React, { createContext, useState } from 'react';
import { Router, Route } from 'expo-router';
import HomePage from './index';
import Register from './register';
import Login from './login';
import Admin from './adminPage';
import Employee from './employeePage';
import Task from './task';
import Locations from './newLocation';
import Position from './position';
import Goal from './goal';
import InputFinancial from './inputFinancial';
import InputExpense from './inputExpense';
import { BudgetProvider } from './BudgetContext';
import WeatherForm from './WeatherForm';


// Create a UserContext
export const UserContext = createContext();

const UserProvider = ({ children }) => {
  const [userData, setUserData] = useState({});
  return (
    <UserContext.Provider value={{ userData, setUserData }}>
      {children}
    </UserContext.Provider>
  );
};

function App() {
  return (
    <UserProvider>
      <Router>
        <Route exact path="/" component={HomePage} />
        <Route path="/registration" component={Register} />
        <Route path="/login" component={Login} />
        <Route path="/adminPage" component={Admin} />
        <Route path="/employeePage" component={Employee} />
        <Route path="/task" component={Task} />
        <Route path="/newLocation" component={Locations} />
        <Route path="/position" component={Position} />
        <Route path="/goal" component={Goal} />
      </Router>
    </UserProvider>
  );
}

export default App;