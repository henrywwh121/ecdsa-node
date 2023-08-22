const { secp256k1 } = require("@noble/curves/secp256k1");
const utils = require('@noble/curves/abstract/utils');

const priv = secp256k1.utils.randomPrivateKey();
const pub = secp256k1.getPublicKey(priv);

console.log("Private Key:", utils.bytesToHex(priv));
console.log("Public Key:", utils.bytesToHex(pub));
