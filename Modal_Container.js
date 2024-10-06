/* 
**************************************
********** Modal Container* **********
**************************************
*/

function checkUsername() {
        const username = document.getElementById('username').value;
        
        google.script.run.withSuccessHandler((isUnique) => {
          if (isUnique) {
            alert('Username is available!');
            document.getElementById('formFields').style.display = 'block';
          } else {
            alert('Username is already taken, please choose another.');
          }
        }).isUsernameUnique(username);
      }

      function modal_submitForm() {
        const modal_formData = {
          username: document.getElementById('username').value,
          firstName: document.getElementById('firstName').value,
          lastName: document.getElementById('lastName').value,
          email: document.getElementById('email').value,
          phone: document.getElementById('phone').value,
          password: document.getElementById('password').value,
          secretWord1: document.getElementById('secretWord1').value,
          secretWord2: document.getElementById('secretWord2').value
        };

        google.script.run.withSuccessHandler(() => {
          alert('Sign up successful!');
          google.script.host.close(); // Close the modal after submission
        }).saveCustomerData(modal_formData);
      }

/*
**************************************
******** End Modal Container* ********
**************************************
*/
