import { useState } from "react";
import server from "./server";
import { secp256k1 } from "@noble/curves/secp256k1";
import { utf8ToBytes } from "@noble/hashes/utils";
import { sha256 } from '@noble/hashes/sha256';

function Transfer({ privateKey, setBalance, address }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function transfer(evt) {
    evt.preventDefault();

    console.log(address);
    console.log(recipient);

    //create sign
    const msg = sha256(utf8ToBytes(`send ${recipient} ${parseInt(sendAmount)}`));
    const sign = secp256k1.sign(msg, privateKey);

    //serialized sign
    const serializedSignature = JSON.stringify({
      r: sign.r.toString(),
      s: sign.s.toString(),
      recovery: sign.recovery
    });

    try {
      const {
        data: { balance },
      } = await server.post(`send`, {
        sender: address,
        sign: serializedSignature,
        amount: parseInt(sendAmount),
        recipient,
      });
      setBalance(balance);
    } catch (ex) {
      alert(ex.response.data.message);
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
