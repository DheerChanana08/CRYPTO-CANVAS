import Navbar from "./Navbar";
import axie from "../tile.jpeg";
import { useLocation, useParams } from "react-router-dom";
import MarketplaceJSON from "../Marketplace.json";
import axios from "axios";
import { useState } from "react";
import { GetIpfsUrlFromPinata } from "../utils";

export default function NFTPage(props) {
  const [data, updateData] = useState({});
  const [dataFetched, updateDataFetched] = useState(false);
  const [message, updateMessage] = useState("");
  const [currAddress, updateCurrAddress] = useState("0x");

  async function getNFTData(tokenId) {
    const ethers = require("ethers");
    //After adding your Hardhat network to your metamask, this code will get providers and signers
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const addr = await signer.getAddress();
    //Pull the deployed contract instance
    let contract = new ethers.Contract(
      MarketplaceJSON.address,
      MarketplaceJSON.abi,
      signer
    );
    //create an NFT Token
    var tokenURI = await contract.tokenURI(tokenId);
    const listedToken = await contract.getListedTokenForId(tokenId);
    tokenURI = GetIpfsUrlFromPinata(tokenURI);
    let meta = await axios.get(tokenURI);
    meta = meta.data;
    console.log(listedToken);

    let item = {
      price: meta.price,
      tokenId: tokenId,
      seller: listedToken.seller,
      owner: listedToken.owner,
      image: meta.image,
      name: meta.name,
      description: meta.description,
    };
    console.log(item);
    updateData(item);
    updateDataFetched(true);
    console.log("address", addr);
    updateCurrAddress(addr);
  }

  async function buyNFT(tokenId) {
    try {
      const ethers = require("ethers");
      //After adding your Hardhat network to your metamask, this code will get providers and signers
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      //Pull the deployed contract instance
      let contract = new ethers.Contract(
        MarketplaceJSON.address,
        MarketplaceJSON.abi,
        signer
      );
      const salePrice = ethers.utils.parseUnits(data.price, "ether");
      updateMessage("Buying the NFT... Please Wait (Upto 5 mins)");
      //run the executeSale function
      let transaction = await contract.executeSale(tokenId, {
        value: salePrice,
      });
      await transaction.wait();

      alert("You successfully bought the NFT!");
      updateMessage("");
    } catch (e) {
      alert("Upload Error" + e);
    }
  }

  const params = useParams();
  const tokenId = params.tokenId;
  if (!dataFetched) getNFTData(tokenId);
  if (typeof data.image == "string")
    data.image = GetIpfsUrlFromPinata(data.image);

  return (
    <div>
      <Navbar></Navbar>
      <div className="">
        
        <div className="rounded-2xl flex flex-col m items-center justify-center w-screen py-20 drop-shadow-xl bg-black bg-opacity-10">
        <label className="inline-flex items-center cursor-pointer">
    <input type="checkbox" defaultValue="" className="sr-only peer" />
    <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600" />
    <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
    Force profit Mode
    </span>
    </label>
<p>

  .
</p>
          <img src={data.image} alt="" className="w-3/5 rounded-lg" />
          
          <div className="rounded-2xl bg-white text-xl m-14 space-y-2 text-gray-500  p-5">
            <div>
              {" "}
              <strong className="pr-16">Name </strong>
              {data.name}
            </div>
            <div>
              {" "}
              <strong className="pr-3">Description</strong> {data.description}
            </div>
            <div>
              <strong className="pr-20"> Price</strong>
              <span className="">{data.price + " ETH"}</span>
            </div>
            <div>
              <strong className="pr-16">Owner</strong>
              <span className="text-sm">{data.owner}</span>
            </div>
            <div>
              <strong className="pr-16">Seller </strong>{" "}
              <span className="text-sm">{data.seller}</span>
            </div>
            <div>
              {currAddress != data.owner && currAddress != data.seller ? (
                <button
                  className="enableEthereumButton bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm"
                  onClick={() => buyNFT(tokenId)}
                >
                  Buy this NFT
                </button>
              ) : (
                <div className="text-emerald-700 flex items-center justify-center m-4 mt-8">
                  <strong className="bg-green-100 p-4 rounded-xl ">
                    In your Collection 🎉
                  </strong>
                </div>
              )}

              <div className="text-green text-center mt-3">{message}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
