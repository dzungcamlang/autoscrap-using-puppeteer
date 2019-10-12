var fs = require('fs');
var jwt = require('jsonwebtoken');

const privateKeyName = 'privatekey.pem'; // Should be valid path to the private key
const issuer = 'revolut.nudacy-records.com'; // Issuer for JWT, should be derived from your redirect URL
const client_id = 'iCf0Mkua7fYfbwBS88RDBrk8eZRlcXxfpyMQMy_DTes'; // Your client ID
const aud = 'https://revolut.com'; // Constant
const payload = {
    "iss": issuer,
    "sub": client_id,
    "aud": aud
};
const privateKey = fs.readFileSync(privateKeyName);
const token = jwt.sign(payload, privateKey, { algorithm: 'RS256', expiresIn: 60 * 60});
console.log(token);
