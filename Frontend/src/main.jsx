import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

(function () {
  'use strict';
  window.addEventListener('load', function () {
    var forms = document.getElementsByClassName('needs-validation');
    var validation = Array.prototype.filter.call(forms, function (form) {
      form.addEventListener('submit', function (event) {
        if (form.checkValidity() === false) {
          event.preventDefault();
          event.stopPropagation();
        }
        form.classList.add('was-validated');
      }, false);
    });
  }, false);
})();

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

// showAlert("Hello World!");

document.addEventListener('DOMContentLoaded', () => {
  const journalNavLinks = document.querySelectorAll('#journal-nav a');
  journalNavLinks.forEach(link => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const targetTab = link.querySelector('li').getAttribute('data-tab');
      const journalContents = document.querySelectorAll('.journal-content');
      const journalNavItems = document.querySelectorAll('#journal-nav li');

      // Hide all journal content sections
      journalContents.forEach(content => {
        content.classList.add('d-none');
      });

      // Remove active class from all nav items
      journalNavItems.forEach(item => {
        item.classList.remove('journal-nav-active');
      });

      // Show the selected journal content section
      document.getElementById(targetTab).classList.remove('d-none');

      // Add active class to the clicked nav item
      link.querySelector('li').classList.add('journal-nav-active');
    });
  });
});

document.getElementById('forgotPassword').addEventListener('click', async (event) => {
  event.preventDefault();
  document.querySelector('.login-container').style.display = 'none';
  document.querySelector('.forgot-password-container').classList.remove('d-none');
});

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

