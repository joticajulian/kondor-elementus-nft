const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

module.exports = {
  class: "KondorElementusNft",
  supportAbi1: true,
  proto: ["./proto/empty.proto"],
  files: ["./KondorElementusNft.ts"],
  sourceDir: "./assembly",
  buildDir: "./build",
  filesImport: [
    {
      dependency: "@koinosbox/contracts",
      path: "../node_modules/@koinosbox/contracts/assembly/nft/Nft.ts",
    },
  ],
  protoImport: [
    {
      name: "@koinosbox/contracts",
      path: "../node_modules/@koinosbox/contracts/koinosbox-proto",
    },
    {
      name: "@koinos/sdk-as",
      path: "../node_modules/koinos-precompiler-as/koinos-proto/koinos",
    },
    {
      name: "__",
      path: "../node_modules/koinos-precompiler-as/koinos-proto/google",
    },
  ],
  networks: {
    harbinger: {
      rpcNodes: [
        "https://harbinger-api.koinos.io",
        "https://testnet.koinosblocks.com",
      ],
      accounts: {
        manaSharer: {
          privateKey: process.env.HARBINGER_MANA_SHARER_PRIVATE_KEY,
        },
        contract: {
          privateKey: process.env.HARBINGER_NFT_CONTRACT_PRIVATE_KEY,
          id: process.env.HARBINGER_NFT_CONTRACT_ID,
        },
      },
    },
    mainnet: {
      rpcNodes: ["https://api.koinos.io", "https://api.koinosblocks.com"],
      accounts: {
        manaSharer: {
          privateKey: process.env.MAINNET_MANA_SHARER_PRIVATE_KEY,
        },
        contract: {
          privateKey: process.env.MAINNET_NFT_CONTRACT_PRIVATE_KEY,
          id: process.env.MAINNET_NFT_CONTRACT_ID,
        },
      },
    },
  },
};
