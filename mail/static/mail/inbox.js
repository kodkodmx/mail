document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  // Send email
  document.querySelector('#compose-form').onsubmit = () => {
    recipients = document.querySelector('#compose-recipients').value,
    subject = document.querySelector('#compose-subject').value,
    body = document.querySelector('#compose-body').value;
    console.log(recipients, subject, body);
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
        recipients : recipients,
        subject : subject,
        body : body
      })
    })
    .then(response => response.json())
    .then(result => {
        // Print result
        console.log(result);
    });
  }
}


function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // headers
  document.querySelector('#emails-view').innerHTML += `
  <table style="background-color: lightgray;">
    <tr>
      <th width="50%">Sender</th>
      <th width="50%">Subject</th>
      <th width="50%">Timestamp</th>
    </tr>
  </table>
  `;

  // Get emails
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    console.log(emails);
    emails.forEach(email => {
      const object = document.createElement('div');
      object.className = 'list-group-item';
      object.innerHTML = `<span class="email"><strong>${email.sender}</strong></span> <span class="subject">${email.subject}</span> <span class="timestamp">${email.timestamp}</span>`;
      object.addEventListener('click', () => load_email(email.id, mailbox));
      object.style.cursor = 'pointer';
      object.style.border = '2px solid black';
      document.querySelector('#emails-view').append(object);
      if (email.read == true) {
        object.style.backgroundColor =  'gray';
      }
      else {
        object.style.backgroundColor =  'white';
      }
    });
  });
}

function load_email(id, mailbox) {
  
    // Show the mailbox and hide other views
    document.querySelector('#emails-view').style.display = 'block';
    document.querySelector('#compose-view').style.display = 'none';
    
    // Get email
    fetch(`/emails/${id}`)
    .then(response => response.json())
    .then(email => {
      console.log(email);
      document.querySelector('#emails-view').innerHTML = `<p><strong>From:</strong> ${email.sender}</p>`;
      document.querySelector('#emails-view').innerHTML += `<p><strong>To:</strong> ${email.recipients}</p>`;
      document.querySelector('#emails-view').innerHTML += `<p><strong>Subject:</strong> ${email.subject}</p>`;
      document.querySelector('#emails-view').innerHTML += `<p><strong>Timestamp:</strong> ${email.timestamp}</p>`;
      document.querySelector('#emails-view').innerHTML += `<button class="btn btn-sm btn-outline-primary" id="reply">Reply</button> `;
      document.querySelector('#reply').addEventListener('click', () => reply_email(email.sender, email.subject, email.body, email.timestamp));
      if (mailbox == 'inbox') {
        document.querySelector('#emails-view').innerHTML += `<button class="btn btn-sm btn-outline-primary" id="archive">Archive</button>`;
        document.querySelector('#archive').addEventListener('click', () => archive_email(id));
      }
      else if (mailbox == 'archive') {
        document.querySelector('#emails-view').innerHTML += `<button class="btn btn-sm btn-outline-primary" id="unarchive">Unarchive</button>`;
        document.querySelector('#unarchive').addEventListener('click', () => unarchive_email(id));
      }
      document.querySelector('#emails-view').innerHTML += `<hr>`;
      document.querySelector('#emails-view').innerHTML += `<p>${email.body}</p>`;
      fetch(`/emails/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          read: true
        })
      })
    });
  }

function archive_email(id) {
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: true
    })
  })
  load_mailbox('inbox');
}