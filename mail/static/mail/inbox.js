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
  document.querySelector('#emails-details-view').style.display = 'none';
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
  document.querySelector('#emails-details-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Headers
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
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#emails-details-view').style.display = 'block';
    document.querySelector('#compose-view').style.display = 'none';
    
    // Get email
    fetch(`/emails/${id}`)
    .then(response => response.json())
    .then(email => {
      console.log(email);
      // Headers
      document.querySelector('#emails-details-view').innerHTML = `<p><strong>From:</strong> ${email.sender}</p>`;
      document.querySelector('#emails-details-view').innerHTML += `<p><strong>To:</strong> ${email.recipients}</p>`;
      document.querySelector('#emails-details-view').innerHTML += `<p><strong>Subject:</strong> ${email.subject}</p>`;
      document.querySelector('#emails-details-view').innerHTML += `<p><strong>Timestamp:</strong> ${email.timestamp}</p>`;

      // Body
      document.querySelector('#emails-details-view').innerHTML += `<hr>`;
      document.querySelector('#emails-details-view').innerHTML += `<p>${email.body}</p>`;
      document.querySelector('#emails-details-view').innerHTML += `<hr>`;
    
    // Email readead
    fetch(`/emails/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
          read: true
      })
    })
    console.log(email.read);

    // Reply button
    const reply = document.createElement('button');
    reply.className = 'btn btn-sm btn-outline-primary';
    reply.innerHTML = 'Reply';
    reply.style.marginRight = '10px';
    reply.addEventListener('click', () => {
      compose_email();
      document.querySelector('#compose-recipients').value = email.sender;
      if (email.subject.split(' ')[0] == 'Re:') {
        document.querySelector('#compose-subject').value = email.subject;
      }
      else {
        document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
      }
      document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote: ${email.body}`;
    });
    document.querySelector('#emails-details-view').append(reply);


    // Archive button
    if (mailbox == 'inbox') {
    const archive = document.createElement('button');
    archive.className = 'btn btn-sm btn-outline-primary';
    archive.innerHTML = 'Archive';
    archive.style.marginRight = '10px';
    archive.addEventListener('click', () => {
      fetch(`/emails/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
            archived: true
        })
      })
      console.log('Email archived');
      load_mailbox('inbox');
    });
    document.querySelector('#emails-details-view').append(archive);
    }


    // Unarchive button
    if (mailbox == 'archive') {
      const unarchive = document.createElement('button');
      unarchive.className = 'btn btn-sm btn-outline-primary';
      unarchive.innerHTML = 'Unarchive';
      unarchive.style.marginRight = '10px';
      unarchive.addEventListener('click', () => {
        fetch(`/emails/${id}`, {
          method: 'PUT',
          body: JSON.stringify({
              archived: false
          })
        })
        console.log('Email unarchived');
        load_mailbox('inbox');
      });
      document.querySelector('#emails-details-view').append(unarchive);
    }
  });
}
