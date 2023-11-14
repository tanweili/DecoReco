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
      moduleCode: "",
      moduleName: "",
      moduleDescription: "",
      maxCapacity: "",
      resultsMap: {},
      results: "",
      moduleName_forView: "",
      moduleDescription_forView: "",
      maxCapacity_forView: ""
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

        this.bidResultsEventListener();
        this.courseRegStartedEventListener();
      } else {
        alert("No Ethereum account is connected.");
      }
    } else {
      alert("Metamask is not installed or not enabled");
    }
  }

  bidResultsEventListener = async () => {
    const { contract } = this.state;
    if (contract) {
      // Subscribe to your event
      contract.events.bidResults({ fromBlock: 'latest' })
      .on('data', (event) => {
        // Access event parameters
        const results = event.returnValues;
        const resultsJSON = JSON.parse(JSON.stringify(results));

        this.setState((prevState) => {
          // Create a shallow copy of the existing resultsMap
          const updatedResultsMap = { ...prevState.resultsMap };

          // Check if the key already exists
          if (!updatedResultsMap.hasOwnProperty(resultsJSON.moduleName)) {
            // Append new key-value pair
            updatedResultsMap[resultsJSON.moduleName] = resultsJSON.enrolledStudents;
          }

          // Return the updated state
          return { resultsMap: updatedResultsMap };
        });
      })
      .on('error', (error) => {
        alert('Error in event subscription:', error);
      });
    }
  };

  courseRegStartedEventListener = async () => {
    const { contract } = this.state;
    if (contract) {
      // Subscribe to your event
      contract.events.StartedNotification({ fromBlock: 'latest' })
      .on('data', (event) => {
        const resultsMap = {};
        this.setState({resultsMap});
        const bids = [];
        this.setState({bids});
      })
      .on('error', (error) => {
        alert('Error in event subscription:', error);
      });
    }
  };

  // Function to register a student
  registerStudent = async () => {
    const { contract, account } = this.state;
    const isRegistered = await contract.methods.checkRegisteredStudent(account).call({ from: account });
    if (isRegistered) {
      alert("You have already registered.");
      return;
    }
    await contract.methods.registerStudent().send({ from: account });
  };

  // Function to de-register a student
  deregisterStudent = async () => {
    const { contract, account } = this.state;
    const isRegistered = await contract.methods.checkRegisteredStudent(account).call({ from: account });
    if (!isRegistered) {
      alert("You have not registered.");
      return;
    }
    await contract.methods.deregisterStudent().send({ from: account });
  };

  // Function to view module details
  viewModuleDetails = async () => {
    try {
      const { moduleCode, contract } = this.state;
      // Add any additional validation for moduleCode if needed
  
      // Call the viewModule function to get details
      const moduleDetails = await contract.methods.viewModule(moduleCode).call();
  
      // Access properties directly from the object
      const moduleName_forView = moduleDetails[0];
      const moduleDescription_forView = moduleDetails[1];
      const maxCapacity_forView = moduleDetails[2];
  
      // Update the state with module details
      this.setState((prevState) => ({
        ...prevState,
        moduleName_forView,
        moduleDescription_forView,
        maxCapacity_forView
      }), () => {
        // Log the state after the update
        console.log(this.state);
        alert("Module Code: " + this.state.moduleCode + '\n' + "Module Name: " + this.state.moduleName_forView + '\n' + "Module Description: " + this.state.moduleDescription_forView  + "\n" + "Max Capacity: " + this.state.maxCapacity_forView);
      });
  
  
    } catch (error) {
      // Catch error and print it
      alert("Error viewing module details:", error.message);
    }
  };
  

  // Function to place a bid
  placeBid = async () => {
    try {
      const { contract, stakeAmount, account, courseRegDeadline, moduleCode } = this.state;
  
      // Check if the course registration is active
      const currentTimestamp = Math.floor(Date.now() / 1000);

      // Check if the student is registered
      const isRegistered = await contract.methods.checkRegisteredStudent(account).call({ from: account });

      // Validate that the stakeAmount is a valid number
      const parsedStakeAmount = parseInt(stakeAmount);
      if (currentTimestamp > courseRegDeadline) {
        alert("Course registration is not open.");
        return;
      }
      else if (!isRegistered) {
        alert("You are not a registered student.");
        return;
      }
      else if (isNaN(parsedStakeAmount) || parsedStakeAmount <= 0) {
        alert("Invalid stake amount");
        return;
      }
      else {
      // Send the bid to the contract
      await contract.methods.bidForModule(moduleCode, parsedStakeAmount).send({ from: account });
      this.setState((prevState) => ({
        bids: [...prevState.bids, { moduleCode, stakeAmount }],
      }));
      alert("Bid placed successfully!");
    }
    } catch (error) {
      alert("Error placing bid:", error.message);
    }
  };
  
  // withdraw bid
  withdrawBid = async () => {
    try {
      const { contract, moduleCode, account, courseRegDeadline, bids } = this.state;
  
      // Check if the course registration is active
      const currentTimestamp = Math.floor(Date.now() / 1000);
  
      // Check if the student is registered
      const isRegistered = await contract.methods.checkRegisteredStudent(account).call({ from: account });
    
      // Check if the student has a bid for the requested module
      const hasBid = bids.some(bid => bid.moduleCode === moduleCode);

      if (currentTimestamp > courseRegDeadline) {
        console.error("Course registration is not open.");
        return;
      }
      else if (!isRegistered) {
        console.error("You are not a registered student.");
        return;
      }
      else if (!hasBid) {
        console.error("You do not have a bid for the requested module.");
        return;
      }
      else {
        // Withdraw the bid from the contract
      await contract.methods.withdrawBidForModule(moduleCode).send({ from: account });
  
      // Update bids state to reflect the bid withdrawal
      const updatedBids = bids.filter(bid => bid.moduleCode !== moduleCode);
      this.setState({ bids: updatedBids });
  
      // Add any additional logic or event handling after a successful bid withdrawal
      alert("Bid withdrawn successfully!");
      }

    } catch (error) {
      console.error("Error withdrawing bid:", error.message);
    }
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
    const courseRegStarted = await contract.methods.courseRegStarted().call();
    if (courseRegStarted) {
      alert("Course registration has already started. Please wait for the current round to finish.");
      return;
    }
    const parsedCourseRegDurationSeconds = parseInt(courseRegDuration);
    if (isNaN(parsedCourseRegDurationSeconds) || parsedCourseRegDurationSeconds <= 0) {
      alert("Invalid open duration. Must be integer (represent seconds).");
      return;
    }
    await contract.methods.startCourseReg(parsedCourseRegDurationSeconds).send({ from: account });
  };
  
  endCourseReg = async () => {
    const { contract, account } = this.state;
    const courseRegStarted = await contract.methods.courseRegStarted().call();
    if (!courseRegStarted) {
      alert("Course registration has not start yet.");
      return;
    }
    const courseRegDeadline = await contract.methods.endTime().call();
    const currentTimestamp = Math.floor(Date.now() / 1000);
    if (courseRegDeadline <= currentTimestamp) {
      await contract.methods.endCourseReg().send({ from: account });
    } else {
      alert("course reg deadline timestamp is " + courseRegDeadline + '\n' + "current timestamp is " + currentTimestamp + '\n' + "It is not time yet to end course reg.");
    }
  };

  createModule = async () => {
    const { contract, account, courseRegStarted, moduleCode, moduleName, moduleDescription, maxCapacity } = this.state;
    if (courseRegStarted) {
      alert("Cannot create module while course registration is ongoing.");
      return;
    }
    const moduleDetails = await contract.methods.modules(moduleName).call();
    const isAvailable = moduleDetails.isAvailable;
    if (isAvailable) {
      alert("Module already exists.");
      return;      
    }
    const maxCapacityInt = parseInt(maxCapacity);
    if (isNaN(maxCapacityInt) || maxCapacityInt <= 0) {
      alert("Invalid module capacity given. Must be positive integer.");
      return;
    }
    await contract.methods.createModule(moduleCode, moduleName, moduleDescription, maxCapacityInt).send({ from: account });
  };

  updateModule = async () => {
    const { contract, account, courseRegStarted, moduleCode, moduleName, moduleDescription, maxCapacity } = this.state;
    if (courseRegStarted) {
      alert("Cannot update module while course registration is ongoing.");
      return;
    }
    const moduleDetails = await contract.methods.modules(moduleCode).call();
    const isAvailable = moduleDetails.isAvailable;
    if (!isAvailable) {
      alert("Module does not exists yet.");
      return;      
    }
    const maxCapacityInt = parseInt(maxCapacity);
    if (isNaN(maxCapacityInt) || maxCapacityInt <= 0) {
      alert("Invalid module capacity given. Must be positive integer.");
      return;
    }
    await contract.methods.updateModule(moduleCode, moduleName, moduleDescription, maxCapacityInt).send({ from: account });
  };

  deleteModule = async () => {
    const { contract, courseRegStarted, moduleName, moduleCode, account } = this.state;
    if (courseRegStarted) {
      alert("Cannot delete module while course registration is ongoing.");
      return;
    }
    const moduleDetails = await contract.methods.modules(moduleName).call();
    const isAvailable = moduleDetails.isAvailable;
    if (!isAvailable) {
      alert("Cannot delete a non-existent module.");
      return;      
    }
    const moduleCodeToDelete = moduleCode;
    await contract.methods.deleteModule(moduleCodeToDelete).send({ from: account });
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
            <p className="Align-center">Current Bids:</p>
            <ul>
              {this.state.bids.map((bid, index) => (
                <li key={index}>
                  Course: {bid.moduleCode}, Stake: {bid.stakeAmount}
                  <button onClick={() => this.withdrawBid(bid.moduleCode)}>Remove Bid</button>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="Align-center">
          <input
            type="text"
            placeholder="Module Code"
            onChange={(e) => this.setState({ moduleCode: e.target.value })}
          />
          <button onClick={this.viewModuleDetails}>View Module Details</button>
          <br/>
          <input
            type="text" // Change the type to text to allow decimal values
            placeholder="Stake Amount"
            onChange={(e) => this.setState({ stakeAmount: e.target.value })}
          />
          <br/>
          <button onClick={this.placeBid}>Place Bid</button>

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
        {isAdmin && (
          <div>
            {
              <input length
              type="text"
              placeholder="Module Name"
              onChange={(e) => this.setState({ moduleName: e.target.value })}
              />
            }
          </div>
        )}
        {isAdmin && (
          <div>
            {
              <input length
              type="text"
              placeholder="Module Code"
              onChange={(e) => this.setState({ moduleCode: e.target.value })}
              />
            }
          </div>
        )}
        {isAdmin && (
          <div>
            {
              <input length
              type="text"
              placeholder="Module Description"
              onChange={(e) => this.setState({ moduleDescription: e.target.value })}
              />
            }
          </div>
        )}
        {isAdmin && (
          <div>
            {
              <input length
              type="text"
              placeholder="Maximum Capacity"
              onChange={(e) => this.setState({ maxCapacity: e.target.value })}
              />
            }
          </div>
        )}
        {isAdmin && (
          <div>
            {
              <button onClick={this.createModule}>Create New Module</button>
            }
          </div>
        )}
        {isAdmin && (
          <div>
            {
              <button onClick={this.updateModule}>Update Existing Module</button>
            }
          </div>
        )}
        {isAdmin && (
          <div>
            {
              <button onClick={this.deleteModule}>Delete Existing Module</button>
            }
          </div>
        )}
        <p>Results to be shown below</p>
        <ul>
        {/* Displaying the hashmap */}
        {Object.keys(this.state.resultsMap).map((key) => (
          <li key={key}>
            {key}: {this.state.resultsMap[key].join(', ')}
          </li>
        ))}
      </ul>
      </div>
    );
  }
  
}

export default DApp;
