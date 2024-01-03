import { Signer, Contract, Provider, Transaction } from "koilib";
import { TransactionJson } from "koilib/lib/interface";
import abi from "../build/kondorelementusnft-abi.json";
import koinosConfig from "../koinos.config.js";

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

  await tx.pushOperation(contract.functions.transfer_ownership, {
    value: contract.getId(),
  });

  const receipt = await tx.send();
  console.log(receipt);
  console.log(`Transaction submitted`);
  console.log(
    `consumption: ${(Number(receipt.rc_used) / 1e8).toFixed(2)} mana`
  );
  const { blockNumber } = await tx.wait("byBlock", 60000);
  console.log(`mined in block ${blockNumber} (${networkName})`);
}

main()
  .then(() => {})
  .catch((error) => console.error(error));
