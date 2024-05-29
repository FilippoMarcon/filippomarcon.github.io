document.addEventListener("DOMContentLoaded", function() {
    const urlParams = new URLSearchParams(window.location.search);
    const enteredUsername = urlParams.get('username');

    if (enteredUsername) {
        var userSkinImg = document.getElementById("user-skin-img");
        userSkinImg.src = "https://mc-heads.net/body/" + enteredUsername + "/250px";
        
        var usernameParagraph = document.getElementById("username");
        usernameParagraph.textContent = enteredUsername;

        var rankParagraph = document.querySelector(".rank");

        // Controllo dell'username e impostazione del testo del rank
        if (enteredUsername === "Ph1llyOn_") {
            rankParagraph.textContent = "Manager";
        } else if (enteredUsername === "Auraft") {
            rankParagraph.textContent = "Owner";
        } else if (enteredUsername === "zeno201") {
            rankParagraph.textContent = "Sr. Helper";
        } else if (enteredUsername === "Koi_II_") {
            rankParagraph.textContent = "Developer";
        } else {
            rankParagraph.textContent = "Rank";
        }
    }
});
