const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;

const { utf8ToBytes } = require("@noble/hashes/utils");
const { sha256 } = require('@noble/hashes/sha256');
const { secp256k1 } = require( '@noble/curves/secp256k1');

app.use(cors());
app.use(express.json());

/*
Private Key: 789bdc05e07cbb2d06cf91e62cc73d75c298bb046972fbf5e13f72dbba99d8e0
Public Key: 028a21d29458b97e592ada2aae8abfbc03db937afc56cdeccd8cee77b924cd6dec

Private Key: 5c79229c7b4e97bdc3eeb2da1df194fed713d0a6035dbde591bccfef0f6ea6ff
Public Key: 03fc700d607a9a9783a5e6f3c5aab30fc707e5e49576fd524b0300cc89ff8c1481

Private Key: 42a601f09710232a37951367887e147dd9490d4e24257b193e762732284b756c
Public Key: 02190bccb946ba3ed74a1433bdc71fda4689d795d37abb299608533234d2e86624
*/

const balances = {
  "028a21d29458b97e592ada2aae8abfbc03db937afc56cdeccd8cee77b924cd6dec": 100,
  "03fc700d607a9a9783a5e6f3c5aab30fc707e5e49576fd524b0300cc89ff8c1481": 50,
  "02190bccb946ba3ed74a1433bdc71fda4689d795d37abb299608533234d2e86624": 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  //TODO: recieve sign
  const { recipient, amount, sign, sender } = req.body;

  const msg = sha256(utf8ToBytes(`send ${recipient} ${amount}`));

  //convert back
  const receivedSignature = JSON.parse(sign);
  receivedSignature.r = BigInt(receivedSignature.r);
  receivedSignature.s = BigInt(receivedSignature.s);

  //verify the sign
  const isValid = secp256k1.verify(receivedSignature, msg, sender)

  if(!isValid) {
    res.status(400).send({ message: "Wrong!" });
  }

  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
