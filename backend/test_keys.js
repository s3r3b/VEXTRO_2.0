const http = require('http');

const PORT = process.env.PORT || 5050;

console.log("=== Rozpoczynam Smoke Test X3DH Relay API ===");

// 1. Test POST /api/keys/upload
const uploadData = JSON.stringify({
    phoneNumber: "+48111222333",
    identityKey: "test_identity_key",
    signedPreKey: {
        key: "test_signed_pre_key",
        signature: "test_signature"
    },
    oneTimePreKeys: [
        { id: 1, key: "test_opk_1" },
        { id: 2, key: "test_opk_2" }
    ]
});

const uploadOptions = {
    hostname: '127.0.0.1',
    port: PORT,
    path: '/api/keys/upload',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': uploadData.length
    }
};

const uploadReq = http.request(uploadOptions, (res) => {
    let responseData = '';

    res.on('data', (chunk) => {
        responseData += chunk;
    });

    res.on('end', () => {
        console.log("\n[POST /api/keys/upload] Status Code:", res.statusCode);
        console.log("[POST /api/keys/upload] Response Body:", responseData);
        
        // 2. Test GET /api/keys/fetch/:phone
        testFetch();
    });
});

uploadReq.on('error', (error) => {
    console.error("\n[POST /api/keys/upload] Error:", error.message);
});

uploadReq.write(uploadData);
uploadReq.end();


function testFetch() {
    const fetchOptions = {
        hostname: '127.0.0.1',
        port: PORT,
        path: '/api/keys/fetch/+48111222333',
        method: 'GET'
    };

    const fetchReq = http.request(fetchOptions, (res) => {
        let responseData = '';

        res.on('data', (chunk) => {
            responseData += chunk;
        });

        res.on('end', () => {
            console.log("\n[GET /api/keys/fetch/:phone] Status Code:", res.statusCode);
            console.log("[GET /api/keys/fetch/:phone] Response Body:", responseData);
            console.log("\n=== Smoke Test Zakończony ===");
        });
    });

    fetchReq.on('error', (error) => {
        console.error("\n[GET /api/keys/fetch/:phone] Error:", error.message);
    });

    fetchReq.end();
}
