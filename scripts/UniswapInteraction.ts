import { ethers } from "hardhat";
import { BigNumber } from "ethers";
import { providers } from "ethers";

async function main() {
  //uniswap router address
  const ROUTER = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
  //dai token address
  const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
  //uni token address
  const UNI = "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984";
  //dai holder
  const DAIHolder = "0x748dE14197922c4Ae258c7939C7739f3ff1db573";


  const paths = [DAI, "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0", UNI];
  const path2 = ["0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", DAI];
  const path3 = [DAI, UNI];
  let time = 1676669022;
  const amountToSwap = await ethers.utils.parseEther("100");
  const amountToSwap2 = await ethers.utils.parseEther("0");
  const sent = ethers.utils.parseEther("1");


  /////////////////////////////////////////////////////////////
  // LINK CONTRACT AND INTERFACES
  //////////////////////////////////////////////////////////////
  const Uniswap = await ethers.getContractAt("IUniswap", ROUTER);
  const DaiContract = await ethers.getContractAt("IToken", DAI);
  const UniContract = await ethers.getContractAt("IToken", UNI);

  /////////////////////////////////////////////////////////////
  // IMPERSONATE A DAI HOLDER
  //////////////////////////////////////////////////////////////
  const helpers = require("@nomicfoundation/hardhat-network-helpers");
  await helpers.impersonateAccount(DAIHolder);
  const impersonatedSigner = await ethers.getSigner(DAIHolder);


  /////////////////////////////////////////////////////////////
  // CHECK THE DAI AND UNI BALANCE OF THE DAI HOLDER
  //////////////////////////////////////////////////////////////
  const holderBalance = await DaiContract.balanceOf(DAIHolder);
  console.log(`DaiBalance ${holderBalance}`);

  const uniBalance = await UniContract.balanceOf(DAIHolder);
  console.log(`uniBalance ${uniBalance}`);


  /////////////////////////////////////////////////////////////
  // APPROVE THE ROUTER TO USE THE DAI AND UNI.
  //////////////////////////////////////////////////////////////
  await DaiContract.connect(impersonatedSigner).approve(ROUTER, amountToSwap);
  await UniContract.connect(impersonatedSigner).approve(ROUTER, amountToSwap);
    console.log("approved the two coins sucessfully");


  /////////////////////////////////////////////////////////////
  // ADD LIQUDITY FOR THE DAI AND UNI PAIR
  //////////////////////////////////////////////////////////////
    const addLiquidity =await Uniswap.connect(impersonatedSigner).addLiquidity(DAI, UNI, 50000, 10000, 1400, 200, DAIHolder,time);
    console.log("Successfully added liquidity to the dai and uni pair")
    console.log(`your liquidity token is ${await addLiquidity.wait()}`)
    console.log(await addLiquidity.wait());

    const uniBalAftLiq = await UniContract.balanceOf(DAIHolder);
    const daiBalAftLiq = await DaiContract.balanceOf(DAIHolder);
    console.log(`DaiBalance after added Liquidity = ${daiBalAftLiq}`);
    console.log(`uniBalance after added Liquidity = ${uniBalAftLiq}`);



  /////////////////////////////////////////////////////////////
  // ADD LIQUIDITY ETH FROM THE DAI HOLDER
  //////////////////////////////////////////////////////////////
   await DaiContract.connect(impersonatedSigner).approve(ROUTER, amountToSwap);
    const addEthLiquidity = await Uniswap.connect(impersonatedSigner).addLiquidityETH(DAI, amountToSwap, 0, amountToSwap2, DAIHolder, time,  
    {
    value: sent,
  } );

/////////////////////////////////////////////////////////////
 // REMOVE LIQUIDITY FROM UNISWAP TO THE DAI HOLDER.
 //////////////////////////////////////////////////////////////
    const removeLiquidity = await Uniswap.connect(impersonatedSigner).removeLiquidity(DAI, UNI, 10, 0, 0, DAIHolder, time);
  console.log("ether liquidity removed");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });