function showAlertMessage(message) {
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    document.body.appendChild(overlay);

    const alertBox = document.createElement('div');
    alertBox.className = 'custom-alert';
    alertBox.innerHTML = `
<p>${message}</p>
<button class="btn btn-warning btn-sm" id="alertOkBtn">Okay</button>
`;
    document.body.appendChild(alertBox);

    document.getElementById('alertOkBtn').addEventListener('click', () => {
        alertBox.style.transition = 'opacity 0.5s';
        overlay.style.transition = 'opacity 0.5s';
        alertBox.style.opacity = '0';
        overlay.style.opacity = '0';

        setTimeout(() => {
            alertBox.remove();
            overlay.remove();
        }, 500);
    });
}
// showAlert Function
function showAlert(message, onConfirm, onCancel) {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    document.body.appendChild(overlay);

    // Create custom alert box
    const alertBox = document.createElement('div');
    alertBox.className = 'custom-alert';
    alertBox.innerHTML = `
                <p>${message}</p>
                <div class="button-container">
                    <button class="btn btn-danger btn-sm" id="alertConfirmBtn">Confirm</button>
                    <button class="btn btn-success btn-sm" id="alertCancelBtn">Cancel</button>
                </div>
            `;
    document.body.appendChild(alertBox);

    // Handle Confirm button click
    document.getElementById('alertConfirmBtn').addEventListener('click', () => {
        // Fade out the alert box and overlay
        alertBox.style.transition = 'opacity 0.5s';
        overlay.style.transition = 'opacity 0.5s';
        alertBox.style.opacity = '0';
        overlay.style.opacity = '0';

        // Remove elements after fade-out
        setTimeout(() => {
            alertBox.remove();
            overlay.remove();
        }, 500);

        // Execute the onConfirm callback if provided
        if (typeof onConfirm === 'function') {
            onConfirm();
        }
    });

    // Handle Cancel button click
    document.getElementById('alertCancelBtn').addEventListener('click', () => {
        // Fade out the alert box and overlay
        alertBox.style.transition = 'opacity 0.5s';
        overlay.style.transition = 'opacity 0.5s';
        alertBox.style.opacity = '0';
        overlay.style.opacity = '0';

        // Remove elements after fade-out
        setTimeout(() => {
            alertBox.remove();
            overlay.remove();
        }, 500);

        // Execute the onCancel callback if provided
        if (typeof onCancel === 'function') {
            onCancel();
        }
    });
}

// Add Author Function
function addAuthor() {
    const authorsDiv = document.getElementById("authors");
    const newRow = document.createElement('div');
    newRow.className = 'row g-3 mb-3';
    newRow.innerHTML = `
        <div class="col-md-4">
            <input type="text" placeholder="Author Name" class="form-control author_name" required>
        </div>
        <div class="col-md-4">
            <input type="text" placeholder="Affiliation" class="form-control author_affiliation" required>
        </div>
        <div class="col-md-4">
            <input type="email" placeholder="Email" class="form-control author_email" required>
        </div>
    `;
    showAlert(
        'Are you sure you want to add this author?',
        () => {
            authorsDiv.appendChild(newRow);
        },
        () => {
            // If canceled, do nothing
        }
    );
}

// Show Terms and Conditions PDF
function showTerms() {
    const pdfModal = new bootstrap.Modal(document.getElementById('pdfModal'));
    const pdfViewer = document.getElementById('pdfViewer');
    pdfViewer.src = '/src/assets/Buildsoft_Publications.pdf';
    pdfModal.show();
}

// removeAuthor Function (Fixed)
function removeAuthor(event) {
    // Get the button that was clicked
    const deleteButton = event.target;

    // Find the closest author row
    const authorRow = deleteButton.closest('.row');

    // Show confirmation dialog
    showAlert(
        'Are you sure you want to delete this author?',
        () => {
            // If confirmed, remove the author row
            if (authorRow) {
                authorRow.remove();
            }
        },
        () => {
            // If canceled, do nothing
        }
    );
}

document.getElementById("journalForm").onsubmit = async function (event) {
    event.preventDefault();

    let authors = [];
    document.querySelectorAll(".author_name").forEach((name, index) => {
        authors.push({
            name: name.value,
            affiliation: document.querySelectorAll(".author_affiliation")[index].value,
            email: document.querySelectorAll(".author_email")[index].value
        });
    });

    let formData = new FormData();
    formData.append("title", document.getElementById("title").value);
    formData.append("abstract", document.getElementById("abstract").value);
    formData.append("keywords", document.getElementById("keywords").value);
    formData.append("email", document.getElementById("email").value);
    formData.append("authors", JSON.stringify(authors));
    formData.append("file", document.getElementById("file").files[0]);

    let response = await fetch("http://localhost:3000/submit", {
        method: "POST",
        body: formData
    });

    showAlertMessage(await response.text());
};

document.getElementById("journalForm").addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent default form submission

    // Collect form data
    const title = document.getElementById("title").value;
    const abstract = document.getElementById("abstract").value;
    const keywords = document.getElementById("keywords").value;
    const email = document.getElementById("email").value;

    // Prepare email data
    const emailParams = {
        title: title,
        abstract: abstract,
        keywords: keywords,
        email: email
    };

    // Send email using EmailJS
    emailjs.send("service_kgh8ub1", "template_9iabem3", emailParams)
        .then(function (response) {
            document.getElementById("journalForm").reset();
        }, function (error) {
            console.error("Error:", error);
            alert("An error occurred while sending the confirmation email!");
        });
});
