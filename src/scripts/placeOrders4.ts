import { Signer, Contract, Provider, Transaction } from "koilib";
import { TransactionJson } from "koilib/lib/interface";
import abi from "../build/kondorelementusnft-abi.json";
import koinosConfig from "../koinos.config.js";

const TOTAL_NFTS = 1500;
const NFTS_PER_TX = 30;

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

  const options = {
    payer: accountWithFunds.address,
    payee: contractAccount.address,
    beforeSend: async (tx: TransactionJson) => {
      await accountWithFunds.signTransaction(tx);
    },
    rcLimit: "5000000000",
  };

  const abiMarketPlace = {
    methods: {
      get_order: {
        argument: "marketplace.get_order_arguments",
        return: "marketplace.get_order_result",
        description: "Returns order sell",
        entry_point: 0x45915cb9,
        read_only: true,
      },
      create_order: {
        argument: "marketplace.create_order_arguments",
        return: "marketplace.create_order_result",
        description: "Create order sell",
        entry_point: 0x438c7445,
        read_only: false,
      },
      execute_order: {
        argument: "marketplace.execute_order_arguments",
        return: "marketplace.execute_order_result",
        description: "Execute order sell",
        entry_point: 0xe38a2678,
        read_only: false,
      },
      cancel_order: {
        argument: "marketplace.cancel_order_arguments",
        return: "marketplace.cancel_order_result",
        description: "Cancel order sell",
        entry_point: 0x8442359c,
        read_only: false,
      },
    },
    types:
      "CtMNCiBhc3NlbWJseS9wcm90by9tYXJrZXRwbGFjZS5wcm90bxILbWFya2V0cGxhY2UaFGtvaW5vcy9vcHRpb25zLnByb3RvIvIBCgxvcmRlcl9vYmplY3QSDgoCaWQYASABKAxSAmlkEhwKBnNlbGxlchgCIAEoDEIEgLUYBlIGc2VsbGVyEiQKCmNvbGxlY3Rpb24YAyABKAxCBIC1GAZSCmNvbGxlY3Rpb24SIwoKdG9rZW5fc2VsbBgEIAEoDEIEgLUYBlIJdG9rZW5TZWxsEh8KCHRva2VuX2lkGAUgASgMQgSAtRgCUgd0b2tlbklkEiMKC3Rva2VuX3ByaWNlGAYgASgEQgIwAVIKdG9rZW5QcmljZRIjCgt0aW1lX2V4cGlyZRgHIAEoBEICMAFSCnRpbWVFeHBpcmUiXAoTZ2V0X29yZGVyX2FyZ3VtZW50cxIkCgpjb2xsZWN0aW9uGAEgASgMQgSAtRgGUgpjb2xsZWN0aW9uEh8KCHRva2VuX2lkGAIgASgMQgSAtRgCUgd0b2tlbklkIkUKEGdldF9vcmRlcl9yZXN1bHQSMQoGcmVzdWx0GAEgASgLMhkubWFya2V0cGxhY2Uub3JkZXJfb2JqZWN0UgZyZXN1bHQizgEKFmNyZWF0ZV9vcmRlcl9hcmd1bWVudHMSJAoKY29sbGVjdGlvbhgBIAEoDEIEgLUYBlIKY29sbGVjdGlvbhIjCgp0b2tlbl9zZWxsGAIgASgMQgSAtRgGUgl0b2tlblNlbGwSHwoIdG9rZW5faWQYAyABKAxCBIC1GAJSB3Rva2VuSWQSIwoLdG9rZW5fcHJpY2UYBCABKARCAjABUgp0b2tlblByaWNlEiMKC3RpbWVfZXhwaXJlGAUgASgEQgIwAVIKdGltZUV4cGlyZSItChNjcmVhdGVfb3JkZXJfcmVzdWx0EhYKBnJlc3VsdBgBIAEoCFIGcmVzdWx0ImAKF2V4ZWN1dGVfb3JkZXJfYXJndW1lbnRzEiQKCmNvbGxlY3Rpb24YASABKAxCBIC1GAZSCmNvbGxlY3Rpb24SHwoIdG9rZW5faWQYAiABKAxCBIC1GAJSB3Rva2VuSWQiLgoUZXhlY3V0ZV9vcmRlcl9yZXN1bHQSFgoGcmVzdWx0GAEgASgIUgZyZXN1bHQiXwoWY2FuY2VsX29yZGVyX2FyZ3VtZW50cxIkCgpjb2xsZWN0aW9uGAEgASgMQgSAtRgGUgpjb2xsZWN0aW9uEh8KCHRva2VuX2lkGAIgASgMQgSAtRgCUgd0b2tlbklkIi0KE2NhbmNlbF9vcmRlcl9yZXN1bHQSFgoGcmVzdWx0GAEgASgIUgZyZXN1bHQi+AEKEmNyZWF0ZV9vcmRlcl9ldmVudBIOCgJpZBgBIAEoDFICaWQSHAoGc2VsbGVyGAIgASgMQgSAtRgGUgZzZWxsZXISJAoKY29sbGVjdGlvbhgDIAEoDEIEgLUYBlIKY29sbGVjdGlvbhIfCgh0b2tlbl9pZBgEIAEoDEIEgLUYAlIHdG9rZW5JZBIjCgt0b2tlbl9wcmljZRgFIAEoBEICMAFSCnRva2VuUHJpY2USIwoLdGltZV9leHBpcmUYBiABKARCAjABUgp0aW1lRXhwaXJlEiMKCnRva2VuX3NlbGwYByABKAxCBIC1GAZSCXRva2VuU2VsbCLAAgoTZXhlY3V0ZV9vcmRlcl9ldmVudBIOCgJpZBgBIAEoDFICaWQSGgoFYnV5ZXIYAiABKAxCBIC1GAZSBWJ1eWVyEhwKBnNlbGxlchgDIAEoDEIEgLUYBlIGc2VsbGVyEiQKCmNvbGxlY3Rpb24YBCABKAxCBIC1GAZSCmNvbGxlY3Rpb24SHwoIdG9rZW5faWQYBSABKAxCBIC1GAJSB3Rva2VuSWQSIwoLcHJpY2VfZmluYWwYBiABKARCAjABUgpwcmljZUZpbmFsEiUKDHByb3RvY29sX2ZlZRgHIAEoBEICMAFSC3Byb3RvY29sRmVlEicKDXJveWFsdGllc19mZWUYCCABKARCAjABUgxyb3lhbHRpZXNGZWUSIwoKdG9rZW5fc2VsbBgJIAEoDEIEgLUYBlIJdG9rZW5TZWxsIokBChJjYW5jZWxfb3JkZXJfZXZlbnQSDgoCaWQYASABKAxSAmlkEhwKBnNlbGxlchgDIAEoDEIEgLUYBlIGc2VsbGVyEiQKCmNvbGxlY3Rpb24YBCABKAxCBIC1GAZSCmNvbGxlY3Rpb24SHwoIdG9rZW5faWQYBSABKAxCBIC1GAJSB3Rva2VuSWRiBnByb3RvMw==",
  };

  const contract = new Contract({
    signer: contractAccount,
    provider,
    abi,
    options,
  });

  const kollection = new Contract({
    id: "16tsFkc5RyuwQmXxVABzHHwS513Nu2B9S3",
    provider,
    abi: abiMarketPlace,
    options,
  });

  let current = 1;
  while (current < TOTAL_NFTS) {
    const tx = new Transaction({
      signer: contractAccount,
      provider,
      options,
    });

    for (let i = current; i < current + NFTS_PER_TX; i += 1) {
      const tokenId = `0x${Buffer.from(Number(i).toString()).toString("hex")}`;

      const { result } = await contract.functions.owner_of({
        token_id: tokenId,
      });

      if (result && result.value !== contract.getId()) {
        console.log(`skipping ${i}. Owner: ${result.value}`);
        continue;
      }

      const orderArgs = {
        collection: contract.getId(),
        token_id: tokenId,
      };

      const { result: resultKollection } = await kollection.functions.get_order(
        orderArgs
      );

      if (resultKollection) {
        await tx.pushOperation(kollection.functions.cancel_order, orderArgs);
      }
    }

    if (tx.transaction.operations && tx.transaction.operations.length > 0) {
      const receipt = await tx.send();
      console.log(
        `Transaction submitted: from ${current} to ${current + NFTS_PER_TX - 1}`
      );
      console.log(
        `consumption: ${(Number(receipt.rc_used) / 1e8).toFixed(2)} mana`
      );
      const { blockNumber } = await tx.wait("byBlock", 60000);
      console.log(`mined in block ${blockNumber} (${networkName})`);
    } else {
      console.log(
        `No transaction required: from ${current} to ${
          current + NFTS_PER_TX - 1
        }`
      );
    }
    current += NFTS_PER_TX;
  }
}

main()
  .then(() => {})
  .catch((error) => console.error(error));
