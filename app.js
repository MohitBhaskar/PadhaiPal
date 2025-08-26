const notesEl = document.getElementById('notes');
const countEl = document.getElementById('count');
const langEl = document.getElementById('lang');
const btn = document.getElementById('generate');
const cardsEl = document.getElementById('cards');

btn.addEventListener('click', async () => {
  const text = notesEl.value.trim();
  const n = parseInt(countEl.value || '6', 10);
  const lang = langEl.value;
  if (!text) return alert('Paste some notes first.');

  btn.disabled = true; btn.textContent = 'Generating...';
  cardsEl.innerHTML = '';

  try {
    const res = await fetch('/generate', {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({ text, n, lang })
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    renderCards(data.cards || []);
  } catch (err) {
    console.error(err);
    alert('Error: ' + (err.message || 'Cannot generate'));
  } finally {
    btn.disabled = false; btn.textContent = 'Generate Flashcards';
  }
});

function renderCards(cards) {
  cardsEl.innerHTML = '';
  if (!cards.length) { cardsEl.textContent = 'No cards returned.'; return; }
  cards.forEach((c,i) => {
    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = `<h3>Q${i+1}: ${escapeHTML(c.question)}</h3>
                     <p class="answer" style="display:none">${escapeHTML(c.answer)}</p>
                     <button class="toggle">Show Answer</button>`;
    div.querySelector('.toggle').onclick = () => {
      const a = div.querySelector('.answer');
      a.style.display = a.style.display === 'none' ? 'block' : 'none';
    };
    cardsEl.appendChild(div);
  });
}
function escapeHTML(s){ return s ? s.replace(/[&<>'"]/g,c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[c])) : ''; }
