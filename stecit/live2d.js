function showMessage(text, duration = 3000) {
    console.log('尝试显示气泡:', text);
    const bubble = document.getElementById('message-bubble');
    bubble.textContent = text;
    bubble.classList.add('show');
    setTimeout(() => bubble.classList.remove('show'), duration);
}
