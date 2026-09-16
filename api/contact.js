module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ success: false, message: 'Method not allowed' });
    return;
  }

  var body = req.body || {};
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (err) { body = {}; }
  }

  if (body.website) {
    res.status(200).json({ success: true });
    return;
  }

  var firstName = String(body.firstName || '').trim();
  var lastName = String(body.lastName || '').trim();
  var email = String(body.email || '').trim();
  var subject = String(body.subject || '').trim();
  var message = String(body.message || '').trim();

  if (!firstName || !lastName || !email || !message) {
    res.status(400).json({ success: false, message: 'Please fill in name, email, and a message.' });
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({ success: false, message: 'That email address doesn’t look quite right.' });
    return;
  }
  if (firstName.length > 100 || lastName.length > 100 || email.length > 200 || subject.length > 200 || message.length > 5000) {
    res.status(400).json({ success: false, message: 'One of those fields is a bit long. Trim it and try again.' });
    return;
  }

  var apiKey = process.env.SENDGRID_API_KEY;
  var fromEmail = process.env.SENDGRID_FROM_EMAIL;
  var toEmail = process.env.CONTACT_TO_EMAIL || 'littlejonny1@mac.com';

  if (!apiKey || !fromEmail) {
    console.error('Contact form missing SENDGRID_API_KEY or SENDGRID_FROM_EMAIL');
    res.status(500).json({ success: false, message: 'Email isn’t configured on the server yet.' });
    return;
  }

  var visitorName = firstName + ' ' + lastName;
  var mailSubject = 'jonlawton.net: ' + (subject || 'Website inquiry');
  var textBody = [
    visitorName + ' wrote via jonlawton.net',
    'Email: ' + email,
    subject ? 'Subject: ' + subject : null,
    '',
    message
  ].filter(Boolean).join('\n');

  var htmlBody =
    '<p><strong>' + escapeHtml(visitorName) + '</strong> wrote via jonlawton.net</p>' +
    '<p>Email: ' + escapeHtml(email) + '</p>' +
    (subject ? '<p>Subject: ' + escapeHtml(subject) + '</p>' : '') +
    '<p>' + escapeHtml(message).replace(/\n/g, '<br>') + '</p>';

  var sgRes;
  try {
    sgRes = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: toEmail }] }],
        from: { email: fromEmail, name: 'Jon Lawton website' },
        reply_to: { email: email, name: visitorName },
        subject: mailSubject,
        content: [
          { type: 'text/plain', value: textBody },
          { type: 'text/html', value: htmlBody }
        ],
        categories: ['jon-lawton-website', 'contact-form']
      })
    });
  } catch (err) {
    console.error('SendGrid request failed', err);
    res.status(502).json({ success: false, message: 'Could not reach the mail service.' });
    return;
  }

  if (sgRes.status !== 202) {
    var detail = await sgRes.text();
    console.error('SendGrid rejected the send', sgRes.status, detail.slice(0, 500));
    res.status(502).json({ success: false, message: 'The mail service didn’t accept that message.' });
    return;
  }

  res.status(200).json({ success: true });
};

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
