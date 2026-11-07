const express = require("express");
const { error } = require("node:console");
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/auth/callback", async (req, res) => {
    const { code, error } = req.query;

    if (error) {
        return res.status(400).send("discord auth failed")
    }

    if (!code) {
        return res.status(400).json({
            isSuccess: false,
            error: "discord callback code is needed"
        })
    }

    try {
        const cres = await fetch("https://discord.com/api/v10/oauth2/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },

            body: new URLSearchParams({
                client_id: process.env.clientID,
                client_secret: process.env.clientSecret,
                redirect_uri: process.env.redirectUri,
                grant_type: "authorization_code",
                code: code
            })
        })

        const data = await cres.json();

        res.send(`
        <!DOCTYPE html>
        <html>
        <body>
            <h3>Login Success!</h3>
            <p>You can close this window.</p>

            <script>
                window.opener.postMessage(
                    {
                        type: "peekr_discord_success",
                        data: ${JSON.stringify(data)}
                    },
                    "*"
                );

                window.close();
            </script>
        </body>
        </html>
    `);

    } catch (error) {
        console.error("callback err:", error);
        res.status(500).json({
            isSuccess: false,
            error: "token exch failed"
        })
    }
})

app.post("/auth/token/refresh", async (req, res) => {
    const { refresh_token } = req.body;

    if (!refresh_token) return res.status(400).json({
        isSuccess: false,
        error: "refresh token is required..."
    })

    const rres = await fetch("https://discord.com/api/v10/oauth2/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            client_id: process.env.clientID,
            client_secret: process.env.clientSecret,
            grant_type: "refresh_token",
            refresh_token
        })
    })

    const data = await rres.json();

    res.status(rres.status).json({
        isSuccess: rres.ok,
        data
    })
})

app.get("/auth", async (req, res) => {
    const param = new URLSearchParams({
        client_id: process.env.clientID,
        redirect_uri: process.env.redirectUri,
        response_type: "code",
        scope: "identify openid sdk.social_layer_presence"
    })

    res.redirect(`https://discord.com/oauth2/authorize?${param.toString()}`)
})


app.listen(3000, () => {
    console.log("server started")
})