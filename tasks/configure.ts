import { task } from "hardhat/config";
const chainsConfig = require("@cryptolink/contracts/config/chains");
const networks = require("../networks-testnet.json");
const fs = require("fs");
import * as bs58 from "bs58";
task("configure", "")
  .addParam("solanaNftContract", "Contract address of solana NFT collection")
  .addOptionalParam("signer", "Custom signer (private key)")
  .addOptionalParam("provider", "Custom provider RPC url")
  .setAction(async (args, hre: any) => {
    const ethers = hre.ethers;
    const [deployer] = await ethers.getSigners();

    let signer = deployer;
    if (args.signer)
      signer = new ethers.Wallet(
        args.signer,
        new ethers.providers.JsonRpcProvider(args.provider)
      );

    const solanaContract = args.solanaNftContract;
    const solanaId = 19999999991;
    let addresses = [];
    let chainids = [];
    let confirmations = [];
    for (let x = 0; x < networks.length; x++) {
      const helloERC20 = require(process.cwd() +
        "/deployments/" +
        networks[x] +
        "/HelloERC721.json");
      const chainId = fs
        .readFileSync(
          process.cwd() + "/deployments/" + networks[x] + "/.chainId"
        )
        .toString();
      addresses.push(helloERC20.address);
      chainids.push(chainId);
      confirmations.push(1);
    }

    console.log(
      "setting remote contract addresses .. CLT message address:",
      chainsConfig[hre.network.config.chainId].message
    );
    const helloERC721 = await ethers.getContract("HelloERC721");
    const coder = new ethers.AbiCoder();

    const encoded = coder.encode(
      ["bytes[]"],
      [[bs58.decode(args.solanaNftContract)]]
    );

    await await helloERC721.configureClientExtended(
      chainsConfig[hre.network.config.chainId].message,
      [solanaId],
      [encoded],
      [1]
    );
    await (
      await helloERC721.configureClient(
        chainsConfig[hre.network.config.chainId].message,
        chainids,
        addresses,
        confirmations
      )
    ).wait();
  });
