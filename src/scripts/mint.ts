import { Signer, Contract, Provider, Transaction } from "koilib";
import fs from "fs";
import { TransactionJson } from "koilib/lib/interface";
import abi from "../build/kondorelementusnft-abi.json";
import koinosConfig from "../koinos.config.js";

const TOTAL_NFTS = 1500;
const NFTS_PER_TX = 5;
const BUCKET_URL =
  "https://storage.googleapis.com/kondor-elementus-nft/elementus";

const [inputNetworkName] = process.argv.slice(2);

async function main() {
  const networkName = inputNetworkName || "harbinger";
  const network = koinosConfig.networks[networkName];
  if (!network) throw new Error(`network ${networkName} not found`);
  const provider = new Provider(network.rpcNodes);
  const accountWithFunds = Signer.fromWif(
    network.accounts.manaSharer.privateKey
  );
  const contractAccount = Signer.fromWif(network.accounts.contract.privateKey);
  accountWithFunds.provider = provider;
  contractAccount.provider = provider;

  const contract = new Contract({
    signer: contractAccount,
    provider,
    abi,
    options: {
      payer: accountWithFunds.address,
      beforeSend: async (tx: TransactionJson) => {
        await accountWithFunds.signTransaction(tx);
      },
      rcLimit: "5000000000",
    },
  });

  let current = 1;
  while (current < TOTAL_NFTS) {
    const tx = new Transaction({
      signer: contractAccount,
      provider,
      options: {
        payer: accountWithFunds.address,
        beforeSend: async (tx: TransactionJson) => {
          await accountWithFunds.signTransaction(tx);
        },
        rcLimit: "500000000",
      },
    });

    for (let i = current; i < current + NFTS_PER_TX; i += 1) {
      const data = fs.readFileSync(`DATA/${i}.json`, "utf8");
      const { attributes, custom_fields } = JSON.parse(data) as {
        attributes: unknown[];
        custom_fields: unknown;
        external_url: string;
      };

      const tokenId = `0x${Buffer.from(Number(i).toString()).toString("hex")}`;
      await tx.pushOperation(contract.functions.mint, {
        token_id: tokenId,
        to: contract.getId(),
      });
      await tx.pushOperation(contract.functions.set_metadata, {
        token_id: tokenId,
        metadata: JSON.stringify({
          name: `Kondor Elementus #${i}`,
          description:
            "This piece of history commemorates the application of the first upgrade on the Koinos network without hardforks led by a community developer",
          file_url: `${BUCKET_URL}/${i}.png`,
          image: `${BUCKET_URL}/${i}.png`,
          attributes,
          custom_fields,
          external_url: `https://kollection.app/collection/${contract.getId()}`,
        }),
      });
    }

    const receipt = await tx.send();
    console.log(
      `Transaction submitted: from ${current} to ${current + NFTS_PER_TX - 1}`
    );
    console.log(
      `consumption: ${(Number(receipt.rc_used) / 1e8).toFixed(2)} mana`
    );
    const { blockNumber } = await tx.wait("byBlock", 60000);
    console.log(`mined in block ${blockNumber} (${networkName})`);
    current += NFTS_PER_TX;
  }
}

main()
  .then(() => {})
  .catch((error) => console.error(error));
