function addAuthor() {
    let authorsDiv = document.getElementById("authors");
    let newFields = `<input type="text" placeholder="Author Name" class="author_name">
                     <input type="text" placeholder="Affiliation" class="author_affiliation">
                     <input type="email" placeholder="Email" class="author_email"><br><br>`;
    authorsDiv.innerHTML += newFields;
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

    alert(await response.text());
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
            alert("Submission successful! A confirmation email has been sent.");
            document.getElementById("journalForm").reset(); // Reset form
        }, function (error) {
            console.error("Error:", error);
            alert("Failed to send email. Please try again.");
        });
});
