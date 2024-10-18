var retrievedData = {}; // Define a global variable to store the retrieved data
    
    function searchReceipt() {
      const searchValue = document.getElementById('searchValue').value.trim();
      if (!searchValue) {
        document.getElementById('search-error').style.display = 'block';
        return;
      } else {
        document.getElementById('search-error').style.display = 'none';
      }


      
      document.getElementById('loading-spinner').style.display = 'block';
      google.script.run.withSuccessHandler(showForm).searchReceiptData(searchValue);
    }
    
    function showForm(data) {
      document.getElementById('loading-spinner').style.display = 'none';
      if (data) {
        retrievedData = data; // Store the retrieved data for later use
        document.getElementById('form-section').style.display = 'block';

       //Hide Search Form and buttons

        document.querySelector('.container3').style.display = 'none';
        document.querySelector('.btn-search').style.display = 'none';
        document.querySelector('.btn-manual').style.display = 'none';
        //End Hide Search Form and buttons

        // Populate read-only fields
        document.getElementById('consigneeFirstName').value = data.consigneeFirstName;
        document.getElementById('consigneeLastName').value = data.consigneeLastName;
        document.getElementById('consigneeAddress').value = data.consigneeAddress.replace(/, /g, "\n");
        document.getElementById('consigneeTelephone').value = data.consigneeTelephone;
        document.getElementById('comments').value = data.comments;
        document.getElementById('DRnumber').value = data.DRnumber;
        document.getElementById('forwardingCarrier').value = data.forwardingCarrier;
        document.getElementById('totalPieces').value = data.pieceCount;
      } else {
        showMessage("No records found...",2000);
        document.getElementById('form-section').style.display = 'none';
        document.querySelector('.container3').style.display = 'block';
        document.querySelector('.btn-search').style.display = 'block';
        document.querySelector('.btn-manual').style.display = 'block';
      }
    }
    
    function SubmitPrintShippingLabelForm() {
      const currentPieces = document.getElementById('currentPieces').value.trim();
      const totalPieces = document.getElementById('totalPieces').value.trim();
      const drControl = document.getElementById('drControl').value.trim();
      const forwarder = document.getElementById('forwarder').value.trim();
    

      let valid = true;

      if (!/^\d+$/.test(currentPieces)) {
        document.getElementById('currentPieces-error').style.display = 'block';
        valid = false;
      } else {
        document.getElementById('currentPieces-error').style.display = 'none';
      }

      if (!/^\d+$/.test(totalPieces)) {
        document.getElementById('totalPieces-error').style.display = 'block';
        valid = false;
      } else {
        document.getElementById('totalPieces-error').style.display = 'none';
      }

      if (!/^\d+$/.test(drControl)) {
        document.getElementById('drControl-error').style.display = 'block';
        valid = false;
      } else {
        document.getElementById('drControl-error').style.display = 'none';
      }

      if (!forwarder) {
        document.getElementById('forwarder-error').style.display = 'block';
        valid = false;
      } else {
        document.getElementById('forwarder-error').style.display = 'none';
      }

      if (!valid) {
        return;
      }

      const userInputs = { currentPieces, totalPieces, drControl, forwarder };

      google.script.run.withSuccessHandler(function(success) {
        if (success) {
          document.getElementById('confirmation-message').style.display = 'block';

          // Hide the submit button
          const submitButton = document.querySelector('.btn-update');
          submitButton.style.display = 'none';

          // Show the print and reset buttons
          showPrintAndResetButtons();

          setTimeout(() => {
            document.getElementById('confirmation-message').style.display = 'none';
          }, 3000);
        } else {
          document.getElementById('error-message').style.display = 'block';
          setTimeout(() => {
            document.getElementById('error-message').style.display = 'none';
          }, 3000);
        }
      }).updateFormattedSheet(retrievedData, userInputs);
    }

    function showPrintAndResetButtons() {
      // Create and style the reset button
   //*   let resetButton = document.querySelector('.btn-reset');
   //*   if (!resetButton) {
   //*     resetButton = document.createElement('button');
  //*      resetButton.textContent = 'Reset Form';
  //*      resetButton.className = 'btn btn-reset';
  //*      resetButton.onclick = resetForm;
  //*      document.querySelector('.button-container').appendChild(resetButton);
  //*    }
 //*     resetButton.style.display = 'inline-block'; // Ensure it's visible

      // Create and style the print button
      let printButton = document.querySelector('.btn-print');
      if (!printButton) {
        printButton = document.createElement('button');
        printButton.textContent = 'Print Labels';
        printButton.className = 'btn btn-print';
        printButton.onclick = function() {
          printLabels(Infinity);
        };
        document.querySelector('.button-container').appendChild(printButton);
      }
      printButton.style.display = 'inline-block'; // Ensure it's visible

      // Create and style the print current label button
      let printCurrentButton = document.querySelector('.btn-print-current');
      if (!printCurrentButton) {
        printCurrentButton = document.createElement('button');
        printCurrentButton.textContent = 'Print Current Label';
        printCurrentButton.className = 'btn btn-print-current';
        printCurrentButton.onclick = function() {
          printLabels(1);
        };
        document.querySelector('.button-container').appendChild(printCurrentButton);
      }
      printCurrentButton.style.display = 'inline-block'; // Ensure it's visible

      // Position the buttons correctly
 //*     resetButton.style.marginRight = '10px';
      printButton.style.marginRight = '10px';
    }

    function printLabels(labelCount) {
      document.getElementById('loading-spinner').style.display = 'block';
     // Display the message showing the current label being printed
      google.script.run.withSuccessHandler(function(printData) {
        if (printData) {
          showMessage('Printing Label ' + printData.currentLabel + ' of ' + printData.totalLabels, 2000);
          // Trigger the PDF download directly without opening a new window
          const link = document.createElement('a');
          link.href = printData.pdfUrl;
          link.download = 'ShippingLabel.pdf';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          // Simulate download time (2 seconds)
          setTimeout(function() {
            // Hide the spinner
            document.getElementById('loading-spinner').style.display = 'none';

            // Update label count and proceed with the next label if needed
            google.script.run.withSuccessHandler(function(success) {
              if (success) {
                if (printData.currentLabel < printData.totalLabels && printData.currentLabel < labelCount) {
                  printLabels(labelCount); // Continue printing the next label
                } else {
                  document.getElementById('confirmation-message').textContent = 'Print Complete';
                  document.getElementById('confirmation-message').style.display = 'block';

                  // After print is complete, reset the form
                  resetForm();

                  setTimeout(() => {
                    document.getElementById('confirmation-message').style.display = 'none';
                  }, 3000);
                }
              } else {
                document.getElementById('error-message').textContent = 'Failed to update label count.';
                document.getElementById('error-message').style.display = 'block';
                setTimeout(() => {
                  document.getElementById('error-message').style.display = 'none';
                }, 3000);
              }
            }).updateLabelCount(printData.currentLabel);
          }, 4000); // 2-second delay for the simulated download time
        } else {
          document.getElementById('error-message').textContent = 'Failed to retrieve print data.';
          document.getElementById('error-message').style.display = 'block';
          setTimeout(() => {
            document.getElementById('error-message').style.display = 'none';
          }, 3000);
        }
      }).preparePrintData();
    }

    function resetForm() {
      // Hide or remove buttons
 //*     const resetButton = document.querySelector('.btn-reset');
 //*     if (resetButton) resetButton.style.display = 'none'; // Hide the reset button
     
  //    document.querySelector('.container2').classList.remove('hidden');

       resetManualForm()

      const printButton = document.querySelector('.btn-print');
      if (printButton) printButton.style.display = 'none'; // Hide the print button

      const printCurrentButton = document.querySelector('.btn-print-current');
      if (printCurrentButton) printCurrentButton.style.display = 'none'; // Hide the print current label button

      const submitButton = document.querySelector('.btn-update');
      submitButton.style.display = 'inline-block'; // Show the submit button again

      // Clear all fields
      document.getElementById('form-section').style.display = 'none';
      document.getElementById('searchValue').value = '';
      document.getElementById('consigneeFirstName').value = '';
      document.getElementById('consigneeLastName').value = '';
      document.getElementById('consigneeAddress').value = '';
      document.getElementById('consigneeTelephone').value = '';
      document.getElementById('comments').value = '';
      document.getElementById('DRnumber').value = '';
      document.getElementById('currentPieces').value = '';
      document.getElementById('totalPieces').value = '';
      document.getElementById('drControl').value = '';
      document.getElementById('forwardingCarrier').value = '';
      document.getElementById('totalPieces').value = '';

      //*********** show search **************
      document.querySelector('.container3').style.display = 'block';
      document.querySelector('.btn-search').style.display = 'block';
      document.querySelector('.btn-manual').style.display = 'block';
      //****************************************

    }
    function showMessage(message, duration) {
    // Create a div element for the message
    const messageDiv = document.createElement('div');
    
    // Style the message div (you can adjust the styles as needed)
    messageDiv.style.position = 'fixed';
    messageDiv.style.top = '50%';
    messageDiv.style.left = '50%';
    messageDiv.style.transform = 'translate(-50%, -50%)';
    messageDiv.style.backgroundColor = '#333';
    messageDiv.style.color = '#fff';
    messageDiv.style.padding = '20px';
    messageDiv.style.borderRadius = '5px';
    messageDiv.style.zIndex = '1000';
    messageDiv.style.textAlign = 'center';
    
    // Set the message content
    messageDiv.textContent = message;
    
    // Append the message div to the body
    document.body.appendChild(messageDiv);
    
    // Remove the message after the specified duration
    setTimeout(() => {
        document.body.removeChild(messageDiv);
    }, duration);
 }

function submitManualLabel() {
  const form = document.getElementById('shippingForm');
   if (!form.checkValidity()) {
    form.reportValidity();  // This will trigger the native browser validation and show messages
    return; // Exit if the form is invalid
  }

  // Prevent default form submission
  event.preventDefault();

  // Ensure Piece is not greater than Pieces
  var piece = parseInt(document.getElementById('piece').value);
  var pieces = parseInt(document.getElementById('pieces').value);

  if (piece > pieces) {
    alert("Piece cannot be greater than Pieces.");
    return;
  }

  // Format phone number
  var phoneNumber = document.getElementById('mconsigneePhoneNumber').value;
  phoneNumber = phoneNumber.replace(/\D/g,'');  // Remove non-digit characters
  if (phoneNumber.length === 10) {
    phoneNumber = '(' + phoneNumber.substring(0, 3) + ') ' + phoneNumber.substring(3, 6) + '-' + phoneNumber.substring(6);
  }

  var formData = {
    mconsigneeFirstName: document.getElementById('mconsigneeFirstName').value.toUpperCase(),
    mconsigneeLastName: document.getElementById('mconsigneeLastName').value.toUpperCase(),
    mconsigneeAddress: document.getElementById('mconsigneeAddress').value.toUpperCase(),
    mconsigneePhoneNumber: phoneNumber,
    destination: document.querySelector('input[name="destination"]:checked').value.toUpperCase(),
    mdrNumber: document.getElementById('mdrNumber').value.toUpperCase(),
    piece: piece,
    pieces: pieces,
    mforwarder: document.getElementById('mforwarder').value.toUpperCase()
  };

  google.script.run.withSuccessHandler(function(message) {
    alert(message);
  //  resetManualForm();  // Reset the form after successful submission

  document.getElementById('printlabels').style.display = 'inline-block'; // or 'block'
  document.getElementById('printonelabel').style.display = 'inline-block'; // or 'block'
  document.getElementById('onSubmit').style.display = 'none'; // or 'block'
  }).SubmitPrintShippingLabelForm(formData);
  
}

  function resetManualForm() {
    document.getElementById('shippingForm').reset();
    document.querySelector('.container1').classList.add('hidden');
    document.querySelector('.container2').classList.remove('hidden');
  }

  function printForm() {
      showMessage("Printing...",2000);
      resetForm();
  }

  function showManualForm() {
    showMessage("Showing Manual Form.... Stand Back",1000)
    document.querySelector('.container1').classList.remove('hidden');
    document.querySelector('.container2').classList.add('hidden');
  }
