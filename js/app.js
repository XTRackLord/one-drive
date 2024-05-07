let textbars = document.querySelectorAll('.textbar');

textbars.forEach(function(textbar) {
    textbar.addEventListener('mouseover', function() {
        this.querySelector('.iconca').style.color = '#0078D4'; 
    });

    textbar.addEventListener('mouseout', function() {
        this.querySelector('.iconca').style.color = ''; 
    });
});
