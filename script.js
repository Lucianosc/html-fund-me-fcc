import { ethers } from "./ethers-5.1.esm.min.js";
import { abi, contractAddress } from "./constants.js";

window.addEventListener("DOMContentLoaded", () => {
  // DOM elements
  const feedBackMessage = document.getElementById("feedBackMessage");
  const connectButton = document.getElementById("connectButton");
  const fundButton = document.getElementById("fund");
  const fundInput = document.getElementById("fundInput");
  const withdrawButton = document.getElementById("withdrawButton");

  const connectMetamask = async () => {
    if (typeof window.ethereum !== undefined) {
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        feedBackMessage.innerHTML = "Connected!!";
      } catch (error) {
        console.log(error);
        feedBackMessage.innerHTML = error.message;
      }
    } else feedBackMessage.innerHTML = "No Metamask in browser!";
  };

  const listenForTransactionMine = (transactionResponse, provider) => {
    console.log(`Mining ${transactionResponse.hash}...`);
    // return new Promise();

    // Promises has to call resolve or reject
    return new Promise((resolve, reject) => {
      // if it takes too long we reject it (write it after)
      provider.once(transactionResponse.hash, (transactionReceipt) => {
        console.log(
          `Completed with ${transactionReceipt.confirmations} confirmations`
        );
        resolve();
      });
    });
  };

  // fund function
  const fund = async (ethAmount) => {
    console.log(`ethAmount: ${ethAmount}`);
    if (typeof window.ethereum !== undefined) {
      // provider / connection to the blockchain
      // signer / wallet / with gas
      // contract to interact with (ABI & address)
      const provider = new ethers.providers.Web3Provider(window.ethereum); // is metamask
      const signer = provider.getSigner(); // is the account in metamask
      console.log(signer);
      const contract = new ethers.Contract(contractAddress, abi, signer);
      try {
        const transactionResponse = await contract.fund({
          value: ethers.utils.parseEther(ethAmount),
        });
        await listenForTransactionMine(transactionResponse, provider); // await for the tx to finish
        console.log("Done!");
      } catch ({ error }) {
        console.log(error);
        feedBackMessage.innerHTML = error.message;
      }
    }
  };

  // get contract balance
  const getBalance = async () => {
    if (typeof window.ethereum !== undefined) {
      const provider = new ethers.providers.Web3Provider(window.ethereum); // is metamask
      const balance = await provider.getBalance(contractAddress);
      feedBackMessage.innerHTML = ethers.utils.formatEther(balance);
    }
  };

  // withdraw funtion

  const withdraw = async () => {
    if (typeof window.ethereum !== undefined) {
      const provider = new ethers.providers.Web3Provider(window.ethereum); // is metamask
      const signer = provider.getSigner(); // is the account in metamask
      const contract = new ethers.Contract(contractAddress, abi, signer);
      try {
        const transactionResponse = await contract.withdraw();
        await listenForTransactionMine(transactionResponse, provider);
        console.log("Done!");
      } catch ({ error }) {
        console.log(error);
        feedBackMessage.innerHTML = error.message;
      }
    }
  };

  withdrawButton.onclick = withdraw;
  balanceButton.onclick = getBalance;
  connectButton.onclick = connectMetamask;
  fundButton.onclick = () => {
    if (!!fundInput.value) fund(fundInput.value);
    else feedBackMessage.innerHTML = "Please set a f  und value!";
  };
});
