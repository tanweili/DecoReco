// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./MinHeap.sol";

contract DecoReco {
    mapping(address => bool) public admins;
    mapping(address => Student) public registeredStudents;
    string[] public moduleCodes;
    address[] public studentAddresses;
    mapping(string => Module) public modules;
    mapping(string => MinHeap) public Bids;
    mapping(string => mapping (address => uint256)) public BidMade;
    bool public courseRegStarted;
    uint256 public endTime;
    event StartedNotification(uint256 startTime, uint256 endTime);
    event resultsPublished(uint256 time);
    event bidResults(string moduleName, address[] enrolledStudents);

    constructor() {
        admins[0x386703857E714284e154a7d937348d2d88a702D8] = true; // Wei Li
        admins[0xF3454f923316E665C16C4591D7c0B5aA2b12a201] = true; // Winnie
        admins[0xaB066AeA51c007923885d8949128325198467F67] = true; // Wraine
        admins[0xb1B880657Bb40A28c6f1e7E05197B7bc51894ad2] = true; // Chi Lin
        moduleCodes.push("EE4032");
        modules["EE4032"] = Module("Blockchain Engineering", "This module provides an introduction to blockchain.", 70, true);
        Bids["EE4032"] = new MinHeap(70);
        courseRegStarted = false;
    }

    modifier onlyOwner() {
        require(admins[msg.sender], "Only admins can call this function.");
        _;
    }

    modifier onlyRegisteredStudents() {
        require(registeredStudents[msg.sender].isRegistered, "Only registered students can call this function.");
        _;
    }

    function checkAdminStatus(address _address) public view returns (bool) {
        return admins[_address];
    }

    function checkRegisteredStudent(address _address) public view returns (bool) {
        return registeredStudents[_address].isRegistered;
    }

    function checkModuleExist(string memory _module) public view returns (bool) {
        return modules[_module].isAvailable;
    }

    function registerStudent() public {
        require(registeredStudents[msg.sender].isRegistered == false, "You have already registered for course registration.");
        registeredStudents[msg.sender] = Student(msg.sender, 1000, true);
        studentAddresses.push(msg.sender);
    }

    function deregisterStudent() public {
        require(registeredStudents[msg.sender].isRegistered == true, "You have not yet registered for course registration.");
        registeredStudents[msg.sender] = Student(msg.sender, 0, false);
        for (uint256 i = 0; i < studentAddresses.length; i++) {
            if (studentAddresses[i] == msg.sender) {
                studentAddresses[i] = studentAddresses[studentAddresses.length - 1];
                studentAddresses.pop();
                break;
            }
        }
    }

    function createModule(string calldata _moduleCode, string calldata _moduleName, string calldata _moduleDescription, uint256 _maxCapacity) public onlyOwner {
        require(!courseRegStarted, "Cannot modify modules while course registration is active.");
        require(modules[_moduleCode].isAvailable == false, "Module already exists.");
        moduleCodes.push(_moduleCode);
        modules[_moduleCode] = Module(_moduleName, _moduleDescription, _maxCapacity, true);
        Bids[_moduleCode] = new MinHeap(_maxCapacity);
    }

    function viewModule(string calldata _moduleCode) public view returns (string memory, string memory, uint256) {
        require(modules[_moduleCode].isAvailable == true, "Module does not exists.");
        return (modules[_moduleCode].moduleName, modules[_moduleCode].moduleDescription, modules[_moduleCode].maxCapacity);
    }

    function updateModule(string calldata _moduleCode, string calldata _moduleName, string calldata _moduleDescription, uint256 _maxCapacity) public onlyOwner {
        require(!courseRegStarted, "Cannot modify modules while course registration is active.");
        require(modules[_moduleCode].isAvailable == true, "Module does not exists.");
        modules[_moduleCode] = Module(_moduleName, _moduleDescription, _maxCapacity, true);
        Bids[_moduleCode] = new MinHeap(_maxCapacity);
    }

    function deleteModule(string calldata _moduleCode) public onlyOwner {
        require(!courseRegStarted, "Cannot modify modules while course registration is active.");
        require(modules[_moduleCode].isAvailable == true, "Module does not exist or has been deleted before.");
        modules[_moduleCode].isAvailable = false;
        Bids[_moduleCode] = new MinHeap(0);
        uint256 index = moduleCodes.length;
        for (uint256 i = 0; i < moduleCodes.length; i++) {
            if (keccak256(bytes(moduleCodes[i])) == keccak256(bytes(_moduleCode))) {
                index = i;
                break;
            }
        }
        require(index != moduleCodes.length, "Error in attempting to remove module code from moduleCode array.");
        moduleCodes[index] = moduleCodes[moduleCodes.length - 1];
        moduleCodes.pop();
    }

    function bidForModule(string calldata _moduleCode, uint256 _amount) public onlyRegisteredStudents {
        require(courseRegStarted, "Course registration has not started yet.");
        require(block.timestamp <= endTime, "Course registration has ended.");
        require(_amount > 0, "Bid amount must be more than 0.");
        require(modules[_moduleCode].isAvailable == true, "Cannot bid for a non existent module.");
        require(registeredStudents[msg.sender].eDollars >= _amount, "Your bid amount is more than your current remaining eDollars.");
        require(BidMade[_moduleCode][msg.sender] == 0, "You have already bidded for this module. To change your bid, remove your bid first and bid again.");
        Bids[_moduleCode].insert(_amount, msg.sender);
        registeredStudents[msg.sender].eDollars -= _amount;
        BidMade[_moduleCode][msg.sender] = _amount;
    }

    function withdrawBidForModule(string calldata _moduleCode) public onlyRegisteredStudents {
        require(courseRegStarted, "Course registration has not started yet.");
        require(block.timestamp <= endTime, "Course registration has ended.");
        require(BidMade[_moduleCode][msg.sender] > 0, "You do not have a bid for the requested module.");
        registeredStudents[msg.sender].eDollars += BidMade[_moduleCode][msg.sender];
        BidMade[_moduleCode][msg.sender] = 0;
        Bids[_moduleCode].removeByAddress(msg.sender);
    }

    function startCourseReg(uint256 _duration) public onlyOwner {
        courseRegStarted = true;
        endTime = block.timestamp + (_duration * 1 seconds);
        emit StartedNotification(block.timestamp, endTime);
    }

    function endCourseReg() public onlyOwner {
        courseRegStarted = false;

        for (uint256 i = 0; i < studentAddresses.length; i++) {
            address studentAddress = studentAddresses[i];
            registeredStudents[studentAddress].eDollars = 1000;
        }

        for (uint256 i = 0; i < moduleCodes.length; i++) {
            MinHeap.Bid[] memory heap = Bids[moduleCodes[i]].getHeap();
            address[] memory enrolledStudents = new address[](heap.length);
            for (uint256 j = 0; j < heap.length; j++) {
                enrolledStudents[j] = heap[j].studentAddress;
            }
            emit bidResults(moduleCodes[i], enrolledStudents);
            Bids[moduleCodes[i]].resetHeap();
        }

        for (uint256 i = 0; i < moduleCodes.length; i++) {
            for (uint256 j = 0; j < studentAddresses.length; j++) {
                BidMade[moduleCodes[i]][studentAddresses[j]] = 0;
            }
        }
    }

    struct Student {
        address studentAddress;
        uint256 eDollars;
        bool isRegistered;
    }

    struct Module {
        string moduleName;
        string moduleDescription;
        uint256 maxCapacity;
        bool isAvailable;
    }

    struct Bid {
        address studentAddress;
        uint256 amount;
    }
}