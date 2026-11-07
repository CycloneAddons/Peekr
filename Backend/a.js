fetch("http://localhost:3000/auth/token/refresh", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        refresh_token: "1tsfOOLeo509Z2dvsBo3OTDeRN4Lsl"
    })
})
.then(a => a.json())
.then(console.log)
.catch(console.error);