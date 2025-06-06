function deleteContactPerson(button) {
    const uuid = button.dataset.id;
    const modal = new bootstrap.Modal(document.getElementById('deleteModal'));
    const confirmButton = document.getElementById('confirmDelete');
    
    confirmButton.onclick = function() {
        fetch(`/contact-persons/${uuid}/delete`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(response => {
            if (response.ok) {
                window.location.reload();
            } else {
                alert('Произошла ошибка при удалении контактного лица');
            }
        });
    };
    
    modal.show();
} 