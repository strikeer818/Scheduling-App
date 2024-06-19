import React from 'react';

const Pops = ({ isOpen, onIgnore }) => {
  const popupStyle = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '250px', // Increased width to accommodate two buttons side by side
    height: '250px',
    backgroundColor: '#ffffff',
    border: '1px solid #ccc',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    flexDirection: 'column', // Align buttons vertically
    justifyContent: 'center',
    alignItems: 'center',
    visibility: isOpen ? 'visible' : 'hidden',
  };

  const buttonContainerStyle = {
    display: 'flex',
    justifyContent: 'space-around', // Space buttons evenly
    width: '100%',
    marginTop: '15px', // Add margin between buttons and the message
  };

  const buttonStyle = {
    margin: '5px',
    padding: '8px 16px',
  };

  const handleIgnore = () => {
    onIgnore();
  };

  return (
    <div style={popupStyle}>
      {isOpen && (
        <>
          <p>You are above budget!</p>
          <div style={buttonContainerStyle}>
          
            <button style={buttonStyle} onClick={handleIgnore}>
              Ignore this Warning
            </button>
          </div>
        </>
      )}
    </div>
  );
};
export default Pops;