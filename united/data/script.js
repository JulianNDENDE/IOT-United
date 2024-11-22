// Supabase credentials
const SUPABASE_URL = "https://erleqynqrwqnethwqglb.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVybGVxeW5xcndxbmV0aHdxZ2xiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyOTM2MzY4MywiZXhwIjoyMDQ0OTM5NjgzfQ.K5kBsmWsTeW4iyQ2AsCYSXX9w32oq21_dvAGnj-RK4Q";

// L'ID de l'utilisateur, à récupérer après l'inscription
let USER_ID = null; // Tu dois le définir après que l'utilisateur se soit inscrit ou connecté

// Fonction pour récupérer le chipId automatiquement depuis le microcontrôleur
async function fetchChipId() {
    try {
        // Faire une requête à l'ESP8266/ESP32 pour obtenir le chipId
        const chipIdResponse = await fetch("http://esp8266.local/getChipId");
        const chipIdData = await chipIdResponse.json();
        return chipIdData.chipId;
    } catch (error) {
        console.error("Erreur lors de la récupération du chipId : ", error);
        throw new Error("Impossible de récupérer le chipId.");
    }
}

// Lors du chargement de la page, récupérer automatiquement le chipId
document.addEventListener("DOMContentLoaded", async function() {
    let chipId;

    try {
        // Récupérer automatiquement le chipId
        chipId = await fetchChipId();
        console.log("ChipID récupéré : ", chipId);
    } catch (error) {
        alert("Erreur lors de la récupération du chipId : " + error.message);
        return; // Arrêter le processus si le chipId ne peut pas être récupéré
    }

    // Formulaire pour l'inscription de l'utilisateur
    document.getElementById("signupForm").addEventListener("submit", async function(event) {
        event.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        try {
            // Appel à l'API REST de Supabase pour l'inscription de l'utilisateur
            const response = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "apikey": SUPABASE_KEY,
                    "Authorization": `Bearer ${SUPABASE_KEY}`
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            });

            const data = await response.json();
            console.log("Réponse d'inscription utilisateur :", data);

            if (!response.ok) {
                throw new Error(data.error.message || "Erreur lors de la création du compte");
            }

            // Sauvegarder l'ID de l'utilisateur
            USER_ID = data.id;

            alert("Compte créé avec succès !");
            
            // Afficher le formulaire d'ajout de microcontrôleur après la création du compte
            document.getElementById("addDeviceForm").style.display = "block";

        } catch (error) {
            console.error("Erreur lors de la création du compte : ", error);
            alert("Erreur lors de la création du compte : " + error.message);
        }
    });

    // Formulaire pour ajouter un microcontrôleur (dispositif)
    document.getElementById("addDeviceForm").addEventListener("submit", async function(event) {
        event.preventDefault();
        const deviceName = document.getElementById("deviceName").value || null; // Nom facultatif

        try {
            // Envoi du chipId et du nom du microcontrôleur à Supabase
            const response = await fetch(`${SUPABASE_URL}/rest/v1/devices`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "apikey": SUPABASE_KEY,
                    "Authorization": `Bearer ${SUPABASE_KEY}`
                },
                body: JSON.stringify({
                    chip_id: chipId,  // Utilisation du chipId récupéré automatiquement
                    name: deviceName,
                    user_id: USER_ID  // Lier le microcontrôleur à l'utilisateur
                })
            });

            if (!response.ok) {
                throw new Error("Erreur lors de l'ajout du microcontrôleur");
            }

            alert("Microcontrôleur ajouté avec succès !");
        } catch (error) {
            console.error("Erreur lors de l'ajout du microcontrôleur : ", error);
            alert("Une erreur est survenue lors de l'ajout du microcontrôleur : " + error.message);
        }
    });
});