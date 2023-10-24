// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./MinHeap.sol";

contract DecoReco {
    mapping(address => bool) private admins;
    mapping(address => Student) private registeredStudents;
    mapping(string => Module) private modules;
    mapping(string => MinHeap) private Bids;
    mapping(string => mapping (address => uint16)) BidMade;

    constructor() {
        admins[0x386703857E714284e154a7d937348d2d88a702D8] = true; // Wei Li
        admins[0xF3454f923316E665C16C4591D7c0B5aA2b12a201] = true; // Winnie
        admins[0xaB066AeA51c007923885d8949128325198467F67] = true; // Wraine
        modules["EE4032"] = Module("Blockchain Engineering", "This module provides an introduction to blockchain.", 70, true);
        Bids["EE4032"] = new MinHeap(70);
    }

    modifier onlyOwner() {
        require(admins[msg.sender], "Only admins can call this function.");
        _;
    }

    modifier onlyRegisteredStudents() {
        require(registeredStudents[msg.sender].isRegistered, "Only registered students can call this function.");
        _;
    }

    function registerStudent() public {
        require(registeredStudents[msg.sender].isRegistered == false, "You have already registered for course registration.");
        registeredStudents[msg.sender] = Student(msg.sender, 1000, true);
    }

    function deregisterStudent() public {
        require(registeredStudents[msg.sender].isRegistered == true, "You have not yet registered for course registration.");
        registeredStudents[msg.sender] = Student(msg.sender, 0, false);
    }

    function createModule(string calldata _moduleCode, string calldata _moduleName, string calldata _moduleDescription, uint16 _maxCapacity) public onlyOwner {
        require(modules[_moduleCode].isAvailable == false, "Module already exists.");
        modules[_moduleCode] = Module(_moduleName, _moduleDescription, _maxCapacity, true);
        Bids[_moduleCode] = new MinHeap(_maxCapacity);
    }

    function updateModule(string calldata _moduleCode, string calldata _moduleName, string calldata _moduleDescription, uint16 _maxCapacity) public onlyOwner {
        require(modules[_moduleCode].isAvailable == true, "Module does not exists.");
        modules[_moduleCode] = Module(_moduleName, _moduleDescription, _maxCapacity, true);
        Bids[_moduleCode] = new MinHeap(_maxCapacity);
    }

    function deleteModule(string calldata _moduleCode) public onlyOwner {
        require(modules[_moduleCode].isAvailable == true, "Module does not exist or has been deleted before.");
        modules[_moduleCode].isAvailable = false;
        Bids[_moduleCode] = new MinHeap(0);
    }

    function viewModule(string calldata _moduleCode) public view returns (string memory, string memory, uint16) {
        require(modules[_moduleCode].isAvailable == true, "Module does not exists.");
        return (modules[_moduleCode].moduleName, modules[_moduleCode].moduleDescription, modules[_moduleCode].maxCapacity);
    }

    function bidForModule(string calldata _moduleCode, uint16 _amount) public onlyRegisteredStudents() {
        require(_amount > 0, "Bid amount must be more than 0.");
        require(modules[_moduleCode].isAvailable == true, "Cannot bid for a non existent module.");
        require(registeredStudents[msg.sender].eDollars > _amount, "Your bid amount is more than your current remaining eDollars.");
        Bids[_moduleCode].insert(_amount, msg.sender);
        registeredStudents[msg.sender].eDollars -= _amount;
    }

    function withdrawBidForModule(string calldata _moduleCode) public onlyRegisteredStudents() {
        require(BidMade[_moduleCode][msg.sender] > 0, "You do not have a bid for the requested module.");
        registeredStudents[msg.sender].eDollars += BidMade[_moduleCode][msg.sender];
        BidMade[_moduleCode][msg.sender] = 0;
        Bids[_moduleCode].removeByAddress(msg.sender);
    }

    struct Student {
        address studentAddress;
        uint16 eDollars;
        bool isRegistered;
    }

    struct Module {
        string moduleName;
        string moduleDescription;
        uint16 maxCapacity;
        bool isAvailable;
    }

    struct Bid {
        address studentAddress;
        uint16 amount;
    }
}