import React, { createContext, useContext, useReducer } from 'react';

//file routing may break something here
export const ADD_EMPLOYEE_EXPENSE = 'ADD_EMPLOYEE_EXPENSE';
// Define the initial state of the budget
const initialState = {
  income: [
    { description: 'Total Monthly Budget', amount: 2500 },
  ],
  expenses: [
    { description: 'Employee Wages', amount: 0 },
  ],
  hoursWorked: 0,
};

const BudgetContext = createContext();

const budgetReducer = (state, action) => {
  switch (action.type) {
      case ADD_EMPLOYEE_EXPENSE:
          return {
              ...state,
              expenses: state.expenses.map(expense => 
                  expense.description === 'Employee Wages' 
                  ? { ...expense, amount: action.payload } 
                  : expense
              )
          };
      // handle other actions
      default:
          return state;
  }
};


export const BudgetProvider = ({ children }) => {
  const [budgetState, budgetDispatch] = useReducer(budgetReducer, initialState);

  const updateEmployeeWagesExpense = (wageChange) => {
    budgetDispatch({
      type: ADD_EMPLOYEE_EXPENSE,
      payload: wageChange,
    });
  };

  return (
    <BudgetContext.Provider
      value={{ budgetState, budgetDispatch, updateEmployeeWagesExpense }}
    >
      {children}
    </BudgetContext.Provider>
  );
};

export const useBudget = () => {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error('useBudget must be used within a BudgetProvider');
  }
  return context;
};
