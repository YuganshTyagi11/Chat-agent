const chat = document.getElementById('chat');
const form = document.getElementById('chat-form');
const input = document.getElementById('message');
const template = document.getElementById('message-template');

function addMessage(role, text, sources = []) {
  const node = template.content.firstElementChild.cloneNode(true);
  node.querySelector('.role').textContent = role;
  node.querySelector('.text').textContent = text;

  if (sources.length) {
    const sourceWrap = document.createElement('div');
    sourceWrap.className = 'sources';
    sourceWrap.innerHTML = `<strong>Sources</strong><ul>${sources
      .map((src) => `<li><a href="${src.url}" target="_blank" rel="noreferrer">${src.title}</a> (${src.source})</li>`)
      .join('')}</ul>`;
    node.appendChild(sourceWrap);
  }

  chat.appendChild(node);
  chat.scrollTop = chat.scrollHeight;
}

addMessage(
  'assistant',
  'Hi! I use free search APIs (DuckDuckGo + Wikipedia) and cite sources in each answer.'
);

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const message = input.value.trim();
  if (!message) return;

  addMessage('you', message);
  input.value = '';

  const button = form.querySelector('button');
  button.disabled = true;
  button.textContent = 'Searching...';

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }

    addMessage('assistant', data.answer, data.sources || []);
  } catch (error) {
    addMessage('assistant', `Sorry, I hit an error: ${error.message}`);
  } finally {
    button.disabled = false;
    button.textContent = 'Ask';
  }
});
