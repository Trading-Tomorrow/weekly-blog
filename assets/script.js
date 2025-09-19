// simple client-side filtering by tag (optional extension point)
document.querySelectorAll('[data-filter]').forEach(btn => {
  btn.addEventListener('click', () => {
    const t = btn.dataset.filter;
    document.querySelectorAll('[data-post]').forEach(card => {
      card.style.display = t === 'all' || card.dataset.tags.includes(t) ? '' : 'none';
    });
  });
});