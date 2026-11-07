const loginB = document.getElementById("loginB");
const profileC = document.getElementById("profileC");
const profile = document.getElementById("profile");

const apiurl = "http://localhost:3000";

loginB.addEventListener("click", () => {
    window.open(
        `${apiurl}/auth`,
        "PeekrDiscordLogin",
        "width=500,height=700"
    );
})


window.addEventListener("message", async (event) => {

    console.log(event);
    if (event.origin !== apiurl) return;

    if (event.data?.type == "peekr_discord_success") {
        const expiresAt = Date.now() + (event.data.data.expires_in * 1000);

        await chrome.storage.local.set({
            auth: {
                ...event.data.data,
                expiresAt
            }
        })

        loadUser();
    }
})


async function refreshToken() {

}

async function logout() {
    
}

async function loadUser() {
    const { auth } = await chrome.storage.local.get("auth");

    if (!auth) return logout();

    if (Date.now() >= auth.expiresAt) return refreshToken();

    try {
        const res = await fetch("https://discord.com/api/v10/users/@me", {
            headers: {
                Authorization: `Bearer ${auth.access_token}`
            }
        });

        const user = await res.json();

        if (!res.ok) {
            console.error("error fetching user:", user);
        }

        console.log(user)

        profile.src = user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128` : "";

        profileC.hidden = false;
        loginB.hidden = true;

    } catch (error) {
        console.error("error fetching user:", error);
        logout();
    }

}

loadUser();