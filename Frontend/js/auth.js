import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-analytics.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, sendPasswordResetEmail, validatePassword, signOut, sendSignInLinkToEmail } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { getFirestore, setDoc, doc, getDoc, collection, addDoc } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";
import { getDatabase, ref, set, get, child } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js"

// https://firebase.google.com/docs/web/setup#available-libraries
const firebaseConfig = {
    apiKey: "AIzaSyBy4jU14CCvcTXBo6eTB104PVPAuDT5Aow",
    authDomain: "journalpublishing-harshad.firebaseapp.com",
    projectId: "journalpublishing-harshad",
    storageBucket: "journalpublishing-harshad.firebasestorage.app",
    messagingSenderId: "300945253831",
    appId: "1:300945253831:web:ed3ad229f0e4b41e2425e2",
    measurementId: "G-6EVL2F9CBJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth();
const db = getFirestore(app);
const jdb = getDatabase(app);

// Show alerts using string
function showAlert(message) {
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


onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById('logoutUser').classList.remove('d-none');
        document.getElementById('loginLink').classList.add('d-none');
        document.getElementById('signupLink').classList.add('d-none');
        document.querySelector('.profileDropdown').classList.remove('d-none');
        const profileName = document.getElementById('profileName');
        const profileEmail = document.getElementById('profileEmail');
        profileName.textContent = localStorage.getItem('profileUserName');
        profileEmail.textContent = user.email;
    } else {
        document.getElementById('logoutUser').classList.add('d-none');
        document.getElementById('loginLink').classList.remove('d-none');
        document.getElementById('signupLink').classList.remove('d-none');
        document.querySelector('.profileDropdown').classList.add('d-none');
        localStorage.clear('profileUserName');
    }
});


document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('createAccount').addEventListener('click', async (event) => {
        //event.preventDefault();
        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const signupEmail = document.getElementById('signupEmail').value;
        const userName = document.getElementById('userName').value;
        const signupPassword = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const agreeTerms = document.getElementById('agreeTerms').checked;
        const createAccountButton = document.getElementById('createAccount');

        if (firstName === "" || lastName === "" || signupEmail === "" || userName === "" || signupPassword === "" || confirmPassword === "") {
            showAlert("Please fill all fields!");
            return;
        }
        if (!agreeTerms) {
            showAlert("Please agree to the terms and conditions!");
            return;
        }
        createAccountButton.style.cursor = 'not-allowed';
        createAccountButton.disabled = true;

        if (signupPassword !== confirmPassword) {
            showAlert("Passwords do not match!");
            createAccountButton.disabled = false;
            createAccountButton.style.cursor = 'default';
            return;
        }

        createUserWithEmailAndPassword(auth, signupEmail, signupPassword)
            .then((userCredential) => {
                const user = userCredential.user;
                const userRef = doc(db, "users", user.uid);
                setDoc(userRef, {
                    firstname: firstName,
                    lastname: lastName,
                    username: userName,
                    email: signupEmail,
                    created: new Date().toISOString(),
                    uid: user.uid
                })
                    .then(() => {
                        // showAlert("Account created successfully! Username: " + userName);
                        localStorage.setItem('profileUserName', userName);
                        window.location.href = 'index.html';
                        document.getElementById('signupForm').reset();
                        createAccountButton.disabled = false;
                        createAccountButton.style.cursor = 'default';
                    })
                    .catch((error) => {
                        console.error("Error adding document: ", error);
                    });
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                createAccountButton.disabled = false;
                createAccountButton.style.cursor = 'default';

                if (errorCode === 'auth/email-already-in-use') {
                    showAlert('Email already in use! Try with another email.');
                    document.getElementById('signupEmail').focus();
                } else if (errorCode === 'auth/weak-password') {
                    showAlert('Weak password! The password must contain at least 6 letters.');
                } else if (errorCode === 'auth/invalid-email') {
                    showAlert('Invalid Email! Please check your email.');
                } else {
                    showAlert(errorMessage);
                }
            });
    });
});


// Login to account
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('loginButton').addEventListener('click', async () => {
        const loginEmail = document.getElementById('loginEmail').value;
        const loginPassword = document.getElementById('loginPassword').value;

        if (loginEmail === "" || loginPassword === "") {
            showAlert("Please fill all fields!");
            return;
        }

        const loginButton = document.getElementById('loginButton');
        loginButton.disabled = true;

        try {
            // Sign in the user
            const userCredential = await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
            const user = userCredential.user;

            const userRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(userRef);

            if (docSnap.exists()) {
                const userData = docSnap.data();
                localStorage.setItem('profileUserName', userData.username);
            } else {
                showAlert("User data not found in Firestore!");
                loginButton.disabled = false;
                return;
            }

            window.location.href = 'index.html';
        } catch (error) {
            const errorCode = error.code;

            if (errorCode === 'auth/user-not-found') {
                showAlert('User not found! Please create an account.');
            } else if (errorCode === 'auth/wrong-password') {
                showAlert('Wrong password! Please check your password.');
            } else if (errorCode === 'auth/invalid-email') {
                showAlert('Invalid email! Please check your email.');
            } else {
                showAlert(error.message);
            }
        } finally {
            loginButton.disabled = false;
        }
    });
});


document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('resetPassword').addEventListener('click', async (event) => {
        event.preventDefault();
        const resetEmail = document.getElementById('resetEmail').value;
        if (resetEmail === "") {
            showAlert("Please enter your email!");
            return;
        }
        document.getElementById('resetPassword').disabled = true;
        sendPasswordResetEmail(auth, resetEmail)
            .then(() => {
                showAlert("Password reset email sent! Check your inbox.");
                document.getElementById('resetForm').reset();
                document.getElementById('resetPassword').disabled = false;
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                document.getElementById('resetPassword').disabled = false;
                if (errorCode === 'auth/user-not-found') {
                    showAlert('User not found! Please create an account.');
                }
                else if (errorCode === 'auth/invalid-email') {
                    showAlert('Invalid Email! Please check your email.');
                }
                else {
                    showAlert(errorMessage);
                }
            });
    });
});

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('logoutUser').addEventListener('click', () => {
        signOut(auth).then(() => {
            showAlert('Logged Out Successfully!');
            document.getElementById('logoutUser').classList.add('d-none');
            localStorage.clear('profileUserName');
        }).catch((error) => {
            const errorMessage = error.message;
            showAlert(errorMessage);
        });
    });

    document.getElementById('inviteBtn').addEventListener('click', async (event) => {
        event.preventDefault();
        const inviteMail = document.getElementById('inviteMail').value;
        const inviteType = document.getElementById('inviteType').value;
        if (inviteMail === "" || inviteType === "") {
            showAlert("Please fill all fields!");
            return;
        }
        // generate unique code
        const inviteToken = crypto.randomUUID();
        try {
            await setDoc(doc(db, "pending_invites", inviteMail), {
                email: inviteMail,
                role: inviteType,
                token: inviteToken,
                createdAt: new Date().toISOString()
            });
        } catch (error) {
            showAlert("Error updating firebase: " + error.message);
        }
        const inviteLink = `http://localhost:5173/signup.html&role=${inviteType}?invite=${inviteToken}`;
        const emailParams = {
            email: inviteMail,
            user_name: inviteMail,
            role: inviteType,
            invite_link: inviteLink
        };
    });
});