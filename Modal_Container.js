/* 
**************************************
********** Modal Container* **********
**************************************
*/

    function closeModal() {
      google.script.host.close(); // Close the modal
    }

    function resetForm() {
      document.getElementById("modal-signUpForm").reset(); // Reset the form
      document.getElementById('modal-formFields').style.display = 'none'; // Hide additional fields
      document.getElementById('modal-checkUsernameButton').style.display = 'inline-block'; // Show "Check Username" button again
    }

function checkUsername() {
  console.log('checkUsername function called');

  const usernameField = document.getElementById('modal-username');
  const username = usernameField.value;

  // Validate username: no spaces, at least 4 characters
  if (username.length < 4 || /\s/.test(username)) {
    console.log('Username validation failed');
    alert('Username must be at least 4 characters and not contain spaces.');
    return;
  }

  google.script.run.withSuccessHandler((isUnique) => {
    if (isUnique) {
      console.log('Username is available');
      alert('Username is available!');
      document.getElementById('modal-formFields').style.display = 'block'; // Show additional fields
      document.getElementById('modal-checkUsernameButton').style.display = 'none'; // Hide "Check Username" button
    } else {
      console.log('Username is already taken');
      alert('Username is already taken, please choose another.');
      
      // Focus the username field and select its content
      usernameField.focus();
      usernameField.select();
    }
  }).isUsernameUnique(username);
}

    function submitForm() {
      const formData = {
        username: document.getElementById('modal-username').value,
        firstName: document.getElementById('modal-firstName').value,
        lastName: document.getElementById('modal-lastName').value,
        email: document.getElementById('modal-email').value,
        phone: document.getElementById('modal-phone').value,
        password: document.getElementById('modal-password').value,
        secretWord1: document.getElementById('modal-secretWord1').value,
        secretWord2: document.getElementById('modal-secretWord2').value
      };

      google.script.run.withSuccessHandler(() => {
        alert('Sign up successful!');
        closeModal(); // Close the modal after submission
      }).saveCustomerData(formData);
    }
/*
**************************************
******** End Modal Container* ********
**************************************
*/
