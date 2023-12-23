# Kondor Elementus (NFT collection)

The goal is to create an NFT collection that celebrates the first upgrade in Koinos network led by an external collaborator. This update symbolizes the Koinos ability to adapt, transform and evolve, surpassing even the visions of its creators and the expectations of any individual developer. Thanks to the infinite scalability of Koino, each user has the poer to take advantage of true decentralization to freely create whatever they want, without restrictions, using the network according to their own needs.

# Compilation

```
yarn install
yarn build
```

The WASM file will be generated in `src/build/release/nft.wasm`. To deploy it run:

```
yarn deploy
```

or for mainnet run:

```
yarn deploy mainnet
```
