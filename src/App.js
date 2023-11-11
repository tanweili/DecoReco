import React, { Component } from "react";
import Web3 from "web3";
import { CONTRACT_NAME_ABI, CONTRACT_NAME_ADDRESS } from "./Contracts/config.js";
import './App.css';

class DApp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      web3: null,
      account: null,
      contract: null,
      studentName: "",
      courseName: "",
      stakeAmount: "",
      bids: [],
      isAdmin: false
    };
  }

  async componentDidMount() {
    // Check if Metamask is installed and enabled
    if (window.ethereum) {
      await window.ethereum.enable(); // Request account access from the user
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts.length > 0) {
        // Get the first account from Metamask
        const account = accounts[0];

        // Initialize web3 and contract
        const web3 = new Web3(window.ethereum);
        const contract = new web3.eth.Contract(CONTRACT_NAME_ABI, CONTRACT_NAME_ADDRESS);

        this.setState({ web3, account, contract });
      } else {
        console.error("No Ethereum account is connected.");
      }
    } else {
      console.error("Metamask is not installed or not enabled");
    }
  }

  checkAdmin = async () => {
    const { contract, account } = this.state;
    const test = await contract.methods.checkAdminStatus(account).call({ from: account });
    console.log(test);
  };

  // Function to register a student
  registerStudent = async () => {
    const { contract, account } = this.state;
    await contract.methods.registerStudent().send({ from: account });
  };

  // Function to place a bid
  placeBid = async () => {
    const { contract, courseName, stakeAmount, account } = this.state;

    // Validate that the stakeAmount is a valid number
    const parsedStakeAmount = parseFloat(stakeAmount);
    if (isNaN(parsedStakeAmount) || parsedStakeAmount <= 0) {
      console.error("Invalid stake amount");
      return;
    }

    // Convert the stakeAmount to Wei
    const formattedStakeAmount = this.state.web3.utils.toWei(parsedStakeAmount.toString(), "ether");

    // Send the bid to the contract
    await contract.methods.bidForModule(courseName, formattedStakeAmount).send({ from: account });
  };

  // Function to remove a bid
  removeBid = async (courseName) => {
    const { contract, account } = this.state;
    await contract.methods.withdrawBidForModule(courseName).send({ from: account });
  };

  // Function to show current bids
  showBids = async () => {
    const { contract } = this.state;
    const bids = await contract.methods.getBids().call();
    this.setState({ bids });
  };

  // Function to display results
  showResults = async () => {
    // Add your logic to display results here
  };

  render() {
    return (
      <div className="App-header">
        <p>DecoReco</p>
        <p>Metamask Address: {this.state.account}</p>
        <div className="Align-center">
          <button onClick={this.registerStudent}>Register Student</button>
        </div>
        {this.state.bids.length > 0 && (
          <div>
            <h3>Current Bids:</h3>
            <ul>
              {this.state.bids.map((bid, index) => (
                <li key={index}>
                  Course: {bid.courseName}, Stake: {bid.stakeAmount}
                  <button onClick={() => this.removeBid(bid.courseName)}>Remove Bid</button>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="Align-center">
          <input
            type="text"
            placeholder="Course Name"
            onChange={(e) => this.setState({ courseName: e.target.value })}
          />
          <input
            type="text" // Change the type to text to allow decimal values
            placeholder="Stake Amount"
            onChange={(e) => this.setState({ stakeAmount: e.target.value })}
          />
          <br/>
          <button onClick={this.placeBid}>Place Bid</button>
          <br/>
          <button onClick={this.showResults}>Show Results</button>
          <br/>
          <button onClick={this.showBids}>Show Current Bids</button>
          <br/>
          <button onClick={this.checkAdmin}>check admin</button>
        </div>
      </div>
    );
  }
}

export default DApp;
