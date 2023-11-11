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
      isAdmin: false,
      courseRegDuration: "",
      courseRegDeadline: Date.now(),
      results: "",
      resultsString: "No results yet"
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

        // Check admin status and set the state
        const isAdmin = await contract.methods.checkAdminStatus(account).call({ from: account });

        this.setState({ web3, account, contract, isAdmin });

        const listenForEvents = async () => {
          if (contract) {
            // Subscribe to your event
            contract.events.bidResults({ fromBlock: 'latest' })
              .on('data', (event) => {
                // Access event parameters
                const results = event.returnValues;
                console.log('Event data:', results);
                const resultsString = "";
                for (let i = 0; i < results.length; i++) {
                  resultsString += results.moduleName + '\n';
                  for (let j = 0; j < results.enrolledStudents.length; j++) {
                    resultsString += results.enrolledStudents[j] + '\n';
                  }
                }
                console.log("results string is " + resultsString);
                this.setState({results});
                this.setState({resultsString});
              })
              .on('error', (error) => {
                console.error('Error in event subscription:', error);
              });
          }
        };
    
        listenForEvents();
      } else {
        console.error("No Ethereum account is connected.");
      }
    } else {
      console.error("Metamask is not installed or not enabled");
    }
  }

  checkAdmin = async () => {
    const { contract, account } = this.state;
    const isAdmin = await contract.methods.checkAdminStatus(account).call({ from: account });
    const test = await contract.methods.checkAdminStatus(account).call({ from: account });
    console.log(test);
    this.setState({ isAdmin });
  };

  // Function to register a student
  registerStudent = async () => {
    const { contract, account } = this.state;
    await contract.methods.registerStudent().send({ from: account });
  };

  // Function to de-register a student
  deregisterStudent = async () => {
    const { contract, account } = this.state;
    await contract.methods.deregisterStudent().send({ from: account });
  };

  // Function to place a bid
  placeBid = async () => {
    const { contract, courseName, stakeAmount, account } = this.state;

    // Validate that the stakeAmount is a valid number
    const parsedStakeAmount = parseInt(stakeAmount);
    if (isNaN(parsedStakeAmount) || parsedStakeAmount <= 0) {
      console.error("Invalid stake amount");
      return;
    }

    // Convert the stakeAmount to Wei
    const formattedStakeAmount = this.state.web3.utils.toWei(parsedStakeAmount.toString(), "ether");

    // Send the bid to the contract
    await contract.methods.bidForModule(courseName, parsedStakeAmount).send({ from: account });
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

  startCourseReg = async () => {
    const { contract, account, courseRegDuration } = this.state;

    const parsedCourseRegDurationSeconds = parseInt(courseRegDuration);
    if (isNaN(parsedCourseRegDurationSeconds) || parsedCourseRegDurationSeconds <= 0) {
      console.error("Invalid open duration. Must be integer (represent seconds).");
      return;
    }
    await contract.methods.startCourseReg(parsedCourseRegDurationSeconds).send({ from: account });
  };
  
  endCourseReg = async () => {
    const { contract, account } = this.state;
    const courseRegDeadline = await contract.methods.endTime().call();
    const courseRegStarted = await contract.methods.courseRegStarted().call();
    const currentTimestamp = Math.floor(Date.now() / 1000);
    console.log("course reg deadline timestamp is " + courseRegDeadline);
    console.log("current timestamp is " + currentTimestamp);
    if (courseRegDeadline <= currentTimestamp) {
      await contract.methods.endCourseReg().send({ from: account });
    } else {
      console.log("It is not time yet to end course reg.");
    }
  };

  render() {
    const { isAdmin } = this.state;
  
    return (
      <div className="App-header">
        <p>DecoReco</p>
        <p>Metamask Address: {this.state.account}</p>
        <p>Contract Address: {CONTRACT_NAME_ADDRESS}</p>
        <div className="Align-center">
          <button onClick={this.registerStudent}>Register Student</button>
          <button onClick={this.deregisterStudent}>De-register Student</button>
          
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
        </div>

        {isAdmin && (
          <div>
            Admin functions below
          </div>
        )}
        {isAdmin && (
          <div>
            {
              <input length
              type="text"
              placeholder="Open Duration"
              onChange={(e) => this.setState({ courseRegDuration: e.target.value })}
            />
            }
          </div>
        )}
        {isAdmin && (
          <div>
            {
              <button onClick={this.startCourseReg}>Start Course Registration</button>
            }
          </div>
        )}
        {isAdmin && (
          <div>
            {
              <button onClick={this.endCourseReg}>End Course Registration</button>
            }
          </div>
        )}
        <p>Results to be shown below</p>
        <p>{this.state.resultsString}</p>
        <p>{JSON.stringify(this.state.results)}</p>
      </div>
    );
  }
  
}

export default DApp;
