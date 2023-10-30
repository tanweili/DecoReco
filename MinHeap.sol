// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MinHeap {
    struct Bid {
        address studentAddress;
        uint16 amount;
    }

    Bid[] private minHeap;
    uint16 maxCapacity;
    mapping(address => bool) private admins;

    constructor(uint16 _maxCapacity) {
        admins[0x386703857E714284e154a7d937348d2d88a702D8] = true; // Wei Li
        admins[0xF3454f923316E665C16C4591D7c0B5aA2b12a201] = true; // Winnie
        admins[0xaB066AeA51c007923885d8949128325198467F67] = true; // Wraine
        admins[0xb1B880657Bb40A28c6f1e7E05197B7bc51894ad2] = true; // Chi Lin
        maxCapacity = _maxCapacity;
    }

    modifier onlyOwner() {
        require(admins[msg.sender], "Only admins can call this function.");
        _;
    }
    
    function getHeap() onlyOwner public view returns (Bid[] memory) {
        return minHeap;
    }

    function insert(uint16 _amount, address _studentAddress) public {
        if (minHeap.length >= maxCapacity && _amount <= minHeap[0].amount) {
            return;
        }
        if (minHeap.length >= maxCapacity) {
            extractMin();
        }
        minHeap.push(Bid(_studentAddress, _amount));
        uint16 currentIndex = (uint16)(minHeap.length) - 1;
        bubbleUp(currentIndex);
    }

    function extractMin() public returns (uint16) {
        require(minHeap.length > 0, "Heap is empty");
        uint16 minValue = minHeap[0].amount;
        uint16 lastIndex = (uint16)(minHeap.length) - 1;
        minHeap[0] = minHeap[lastIndex];
        minHeap.pop();
        bubbleDown(0);
        return minValue;
    }

    function removeByAddress(address addressToRemove) public {
        uint16 indexToRemove = (uint16)(minHeap.length);
        for (uint16 i = 0; i < minHeap.length; i++) {
            if (minHeap[i].studentAddress == addressToRemove) {
                indexToRemove = i;
                break;
            }
        }
        if (indexToRemove != minHeap.length) {
            uint16 lastIndex = (uint16)(minHeap.length) - 1;
            minHeap[indexToRemove] = minHeap[lastIndex];
            minHeap.pop();
            bubbleDown(indexToRemove);
        }
    }

    function bubbleUp(uint16 index) private {
        while (index > 0) {
            uint16 parentIndex = (index - 1) / 2;
            if (minHeap[index].amount < minHeap[parentIndex].amount) {
                Bid memory temp = minHeap[index];
                minHeap[index] = minHeap[parentIndex];
                minHeap[parentIndex] = temp;
                index = parentIndex;
            } else {
                break;
            }
        }
    }

    function bubbleDown(uint16 index) private {
        uint16 leftChildIndex;
        uint16 rightChildIndex;
        uint16 smallestChildIndex;

        while (true) {
            leftChildIndex = 2 * index + 1;
            rightChildIndex = 2 * index + 2;
            smallestChildIndex = index;

            if (leftChildIndex < minHeap.length && minHeap[leftChildIndex].amount < minHeap[smallestChildIndex].amount) {
                smallestChildIndex = leftChildIndex;
            }
            if (rightChildIndex < minHeap.length && minHeap[rightChildIndex].amount < minHeap[smallestChildIndex].amount) {
                smallestChildIndex = rightChildIndex;
            }

            if (smallestChildIndex != index) {
                Bid memory temp = minHeap[index];
                minHeap[index] = minHeap[smallestChildIndex];
                minHeap[smallestChildIndex] = temp;
                index = smallestChildIndex;
            } else {
                break;
            }
        }
    }
}
