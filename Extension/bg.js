const appid = "1325565704220704920"

async function getToken() {
    const { auth } = await chrome.storage.local.get("auth");

    if (auth && Date.now() < auth.expiresAt) {
        return auth.access_token
    }
    return null;
}


let ws;
let heartb;
let ready = false;
let seq = null;
let activity = null;


async function connectDc() {
    const token = await getToken();

    ws = new WebSocket("wss://gateway.discord.gg/?v=10&encoding=json")

    ws.addEventListener("open", () => {
        ws.send(JSON.stringify({
            op: 2,
            d: {
                token: `Bearer ${token}`,
                intents: 0,
                properties: {
                    os: "peekr",
                    browser: "peekr",
                    device: appid
                },
                compress: false
            }
        }))
    })


    ws.addEventListener("message", (raw) => {
        const a = JSON.parse(raw.data);

        if (typeof a.s === "number") seq = a.s;


        if (a.op === 10) {
            heartb = setInterval(() => {
                if (ws.readyState === 1) {
                    ws.send(JSON.stringify({
                        op: 1,
                        d: seq
                    }))
                }
            }, a.d.heartbeat_interval)
            return;
        }


        if (a.t === "READY") {
            ready = true;
            ws.send(JSON.stringify({
                op: 3,
                d: {
                    since: 0,
                    status: "online",
                    afk: false,
                    activities: [{ name: "Peekr", type: 0, details: "test" }],
                },
            }));
        }


        if (a.op == 7 || a.op == 9) {
            ws.close()
        }
    })

    ws.addEventListener("close", () => {
        clearInterval(heartb);
        ws = null;
        ready = false;
        
        if (activity) {
            setTimeout(connectDc, 5e3)
        }
    })

}


async function imgToMp(url, token) {
    try {
        const res = await fetch("https://discord.com/api/v10/applications/" + appid + "/external-assets", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                urls: [url]
            })
        })

        const [assets] = await res.json();
        return `mp:${asset.external_asset_path}`;

    } catch (error) {
        console.error(error)
        return null;
    }
}

connectDc();