const loginB = document.getElementById("loginB");
const logoutB = document.getElementById("logoutB");
const profileC = document.getElementById("profileC");
const profile = document.getElementById("profile");
const profilePanel = document.getElementById("profilePanel");

const apiurl = "http://localhost:3000";

loginB.addEventListener("click", () => {
    window.open(
        `${apiurl}/auth`,
        "PeekrDiscordLogin",
        "width=500,height=700"
    );
})

logoutB.addEventListener("click", () => {
    logout()
})

profile.addEventListener("click", () => {
    profilePanel.hidden = !profilePanel.hidden;
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
    profileC.hidden = true;
    loginB.hidden = false;
    await chrome.storage.local.remove("auth");
    await chrome.storage.local.remove("user");
}

async function loadUser() {
    const { auth } = await chrome.storage.local.get("auth");

    if (!auth) return logout();

    if (Date.now() >= auth.expiresAt) return refreshToken();

    let { user } = await chrome.storage.local.get("user");

    if (!user) {
        try {
            const res = await fetch("https://discord.com/api/v10/users/@me", {
                headers: {
                    Authorization: `Bearer ${auth.access_token}`
                }
            });

            user = await res.json();

            if (!res.ok) {
                console.error("error fetching user:", user);
                return;
            }

            console.log(user)
            await chrome.storage.local.set({ user })

        } catch (error) {
            console.error("error fetching user:", error);
            logout();
            return;
        }
    }


    profile.src = user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128` : "";

    profileC.hidden = false;
    loginB.hidden = true;

}

loadUser();



function glitch(el, text) {
    const chars = "!@#$%123456789<>?";
    let i = 0;

    const inter = setInterval(() => {
        el.textContent = text.split("").map((c, n) =>
            n < i ? c : chars[Math.random() * chars.length | 0]
        ).join("");

        if (i++ >= text.length) clearInterval(inter);
    }, 100);
}


glitch(document.getElementById("peekrtitle"), "Peekr");