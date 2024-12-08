import { ethers } from "ethers";
import { createObjectCsvWriter } from "csv-writer";

const provider = new ethers.JsonRpcProvider("https://mainnet.infura.io/v3/2f846fbed89740ccad6d4641db129b02");
const contractAddress = "0xe591293151fFDadD5E06487087D9b0E2743de92E";
const blockTag = "latest";
const minimumBalance = ethers.parseEther("0.1");

const tokenAbi = ["function balanceOf(address) view returns (uint256)"];
const knownHolders = [];

async function main() {
    const tokenContract = new ethers.Contract(contractAddress, tokenAbi, provider);

    console.log(`Taking snapshot at block: ${blockTag}`);
    const snapshot = [];

    for (const holder of knownHolders) {
        const balance = await tokenContract.balanceOf(holder, { blockTag });
        if (balance >= minimumBalance) {
            snapshot.push({ address: holder, balance: ethers.formatEther(balance) });
        }
    }

    console.log(`Filtered to ${snapshot.length} holders with at least 0.1 tokens.`);

    const csvWriter = createObjectCsvWriter({
        path: "snapshot.csv",
        header: [
            { id: "address", title: "Address" },
            { id: "balance", title: "Balance" },
        ],
    });

    await csvWriter.writeRecords(snapshot);
    console.log("Snapshot saved to snapshot.csv");
}

main().catch(console.error);

