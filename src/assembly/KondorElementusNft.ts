// SPDX-License-Identifier: MIT
// Kondor Elementus NFT v1.1.0
// Julian Gonzalez (joticajulian@gmail.com)

import { Storage, System, Arrays } from "@koinos/sdk-as";
import { IToken, Nft, common, nft, token } from "@koinosbox/contracts";
import { elementus } from "./proto/elementus";

export class KondorElementusNft extends Nft {
  _name: string = "Kondor Elementus";
  _symbol: string = "KONDOR-ELEMENTUS";
  _uri: string =
    "https://kondor-nft-api-w6enmqacja-uc.a.run.app/kondor-elementus";

  totalDrops: Storage.Obj<common.uint64> = new Storage.Obj(
    this.contractId,
    10,
    common.uint64.decode,
    common.uint64.encode,
    () => new common.uint64(0)
  );

  drops: Storage.Map<Uint8Array, common.boole> = new Storage.Map(
    this.contractId,
    11,
    common.boole.decode,
    common.boole.encode,
    () => new common.boole(false)
  );

  patchLevel: Storage.Obj<common.address> = new Storage.Obj(
    this.contractId,
    999,
    common.address.decode,
    common.address.encode,
    () => new common.address(new Uint8Array(0))
  );

  /**
   * @external
   * @readonly
   */
  get_drops(args: nft.get_tokens_args): nft.token_ids {
    let key = new Uint8Array(0);
    if (args.start) {
      key = args.start!;
    }
    const result = new nft.token_ids([]);
    for (let i = 0; i < args.limit; i += 1) {
      const nextToken = args.descending
        ? this.drops.getPrev(key)
        : this.drops.getNext(key);
      if (!nextToken) break;
      result.token_ids.push(nextToken.key!);
      key = nextToken.key!;
    }
    return result;
  }

  /**
   * @external
   * @readonly
   */
  get_total_drops(): common.uint64 {
    return this.totalDrops.get()!;
  }

  // patch(): void {
  //   const result = this.get_tokens_by_owner(new nft.get_tokens_by_owner_args(this.contractId, null, 50));
  //   const totalDrops = this.totalDrops.get()!;
  //   for (let i = 0; i < result.token_ids.length; i += 1) {
  //     const tokenId = result.token_ids[i];
  //     this._burn(new nft.burn_args(tokenId));
  //     this.drops.put(tokenId, new common.boole(true));
  //     totalDrops.value += 1;
  //   }
  //   this.totalDrops.put(totalDrops);
  // }

  // patch(args: common.uint32): void {
  //   const patchLevel = this.patchLevel.get()!;
  //   let key = patchLevel.value!;
  //
  //   for (let i: u32 = 0; i < args.value; i += 1) {
  //     const nextToken = this.drops.getNext(key);
  //     if (!nextToken) break;
  //
  //     const tokenId = nextToken.key!;
  //     const newTokenId = new Uint8Array(tokenId.length + 1);
  //     newTokenId[0] = 0x30;
  //     newTokenId.set(tokenId, 1);
  //
  //     const metadata = this.metadata_of(new nft.token(tokenId));
  //     this._set_metadata(new nft.metadata_args(newTokenId, metadata.value));
  //
  //     key = nextToken.key!;
  //   }
  //
  //   patchLevel.value = key;
  //   this.patchLevel.put(patchLevel);
  //
  //   if (args.value == 123456) {
  //     this.patchLevel.remove();
  //     System.log("end patch");
  //   }
  // }

  /**
   *
   * @external
   * @entrypoint mint
   */
  mint_drops(args: elementus.mint_args): void {
    System.require(
      args.number_tokens_to_mint > 0,
      "number tokens to mint must be greater than 0"
    );

    const amountPay = 100_0000_0000 * args.number_tokens_to_mint;
    System.require(
      amountPay / args.number_tokens_to_mint == 100_0000_0000,
      "multiplication overflow"
    );

    if (amountPay > 0) {
      const koin = new IToken(System.getContractAddress("koin"));
      koin.transfer(
        new token.transfer_args(args.to, this.contractId, amountPay)
      );
    }

    const totalDrops = this.totalDrops.get()!;
    for (let i: u64 = 0; i < args.number_tokens_to_mint; i += 1) {
      const nextToken = this.drops.getNext(new Uint8Array(0));
      if (!nextToken) System.fail(`there are only ${i} NFTs available`);
      const tokenId = nextToken!.key!;
      this.drops.remove(tokenId);

      // currently Kollection is not tracking burns
      // then it's necessary to mint new token IDs
      const newTokenId = new Uint8Array(tokenId.length + 1);
      newTokenId[0] = 0x30;
      newTokenId.set(tokenId, 1);
      this._mint(new nft.mint_args(args.to, newTokenId));
      totalDrops.value -= 1;
    }
    this.totalDrops.put(totalDrops);
  }
}
