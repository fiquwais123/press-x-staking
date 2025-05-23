import { useState, useEffect } from "react";
import { ethers } from "ethers";

const stakingAddress = "0xaCe5BF1C3cb1cAdfAF16E2C7A804Fc80FC751cd3";
const gsxTokenAddress = "0x72653ca02bb94B3ac724D0638911402f5c31c63E";
const gsxAbi = [
  "function approve(address spender, uint256 amount) public returns (bool)",
  "function allowance(address owner, address spender) public view returns (uint256)",
  "function balanceOf(address account) public view returns (uint256)"
];
const stakingAbi = [
  "function stake(uint256 _amount) external",
  "function claim() external",
  "function getStake(address _user) external view returns (uint256 amount, uint256 since)",
  "function totalStaked() external view returns (uint256)"
];

export default function App() {
  const [provider, setProvider] = useState();
  const [signer, setSigner] = useState();
  const [address, setAddress] = useState();
  const [balance, setBalance] = useState("0");
  const [stakeAmount, setStakeAmount] = useState("100000");
  const [userStake, setUserStake] = useState("0");
  const [totalStaked, setTotalStaked] = useState("0");

  useEffect(() => {
    if (!provider || !address) return;
    const fetchData = async () => {
      const token = new ethers.Contract(gsxTokenAddress, gsxAbi, provider);
      const staking = new ethers.Contract(stakingAddress, stakingAbi, provider);
      const bal = await token.balanceOf(address);
      const user = await staking.getStake(address);
      const total = await staking.totalStaked();
      setBalance(ethers.utils.formatUnits(bal, 18));
      setUserStake(ethers.utils.formatUnits(user[0], 18));
      setTotalStaked(ethers.utils.formatUnits(total, 18));
    };
    fetchData();
  }, [provider, address]);

  const connectWallet = async () => {
    if (window.ethereum) {
      const prov = new ethers.providers.Web3Provider(window.ethereum);
      await prov.send("eth_requestAccounts", []);
      const signer = prov.getSigner();
      const addr = await signer.getAddress();
      setProvider(prov);
      setSigner(signer);
      setAddress(addr);
    }
  };

  const approve = async () => {
    const token = new ethers.Contract(gsxTokenAddress, gsxAbi, signer);
    await token.approve(stakingAddress, ethers.utils.parseUnits(stakeAmount, 18));
  };

  const stake = async () => {
    const staking = new ethers.Contract(stakingAddress, stakingAbi, signer);
    await staking.stake(ethers.utils.parseUnits(stakeAmount, 18));
  };

  const claim = async () => {
    const staking = new ethers.Contract(stakingAddress, stakingAbi, signer);
    await staking.claim();
  };

  return (
    <div style={{ backgroundColor: '#fff8dc', minHeight: '100vh', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ maxWidth: '600px', margin: 'auto', padding: '20px', background: 'white', borderRadius: '20px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '20px', color: '#b8860b' }}>Press X Staking (GSX)</h1>
        {!address ? (
          <button onClick={connectWallet} style={{ padding: '10px 20px', background: '#b8860b', color: 'white', border: 'none', borderRadius: '10px' }}>
            Connect Wallet
          </button>
        ) : (
          <>
            <p>Connected: {address}</p>
            <p>GSX Balance: {balance}</p>
            <p>Your Stake: {userStake}</p>
            <p>Total Staked: {totalStaked} GSX</p>
            <input
              type="number"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
              style={{ padding: '10px', width: '100%', marginTop: '10px', marginBottom: '10px' }}
            />
            <button onClick={approve} style={{ padding: '10px', background: '#daa520', color: 'white', border: 'none', borderRadius: '10px', width: '100%', marginBottom: '10px' }}>
              Approve
            </button>
            <button onClick={stake} style={{ padding: '10px', background: '#b8860b', color: 'white', border: 'none', borderRadius: '10px', width: '100%', marginBottom: '10px' }}>
              Stake
            </button>
            <button onClick={claim} style={{ padding: '10px', background: '#8b7500', color: 'white', border: 'none', borderRadius: '10px', width: '100%' }}>
              Claim
            </button>
          </>
        )}
      </div>
    </div>
  );
}
