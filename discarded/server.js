function handleFormSubmit() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value; // WARNING: Sending plain passwords over network can be a security risk.
    const fullName = document.getElementById('fullName').value;
    const phoneNumber = document.getElementById('phoneNumber').value;
    const role = document.getElementById('dropbtn').innerText;

    // Send POST request to the server
    fetch('/saveEmployee', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email: email,
            password: password,
            fullName: fullName,
            phoneNumber: phoneNumber,
            role: role
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}
