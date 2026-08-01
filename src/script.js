const menuButton = document.querySelector('.menu-button');
const nav = document.querySelector('.site-nav');

menuButton?.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
});

nav?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    nav.classList.remove('open');
    menuButton?.setAttribute('aria-expanded', 'false');
  });
});

function encodeFormData(formData) {
  return new URLSearchParams(formData).toString();
}

async function submitNetlifyForm(form) {
  const response = await fetch('/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: encodeFormData(new FormData(form)),
  });

  if (!response.ok) {
    throw new Error(`Form submission failed with status ${response.status}`);
  }
}

document.querySelectorAll('form[data-netlify="true"]').forEach((form) => {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const message = form.querySelector('.form-message');
    const submitButton = form.querySelector('[type="submit"]');
    const firstName = form.querySelector('[name="firstName"]')?.value.trim();

    if (message) {
      message.textContent = 'Submitting…';
      message.classList.remove('form-status-success', 'form-status-error');
    }
    if (submitButton) submitButton.disabled = true;

    try {
      await submitNetlifyForm(form);
      const download = form.dataset.download;
      if (message) {
        message.textContent = firstName
          ? `Thank you, ${firstName}. Your information has been received.`
          : 'Thank you. Your information has been received.';
        message.classList.add('form-status-success');
      }
      form.reset();

      if (download) {
        window.setTimeout(() => window.open(download, '_blank', 'noopener'), 350);
      }
    } catch (error) {
      console.error(error);
      if (message) {
        message.textContent = 'The form could not be submitted. Please try again or email hello@daddyhunger.org.';
        message.classList.add('form-status-error');
      }
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  });
});
