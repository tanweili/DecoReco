// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MinHeap {
    struct Bid {
        address studentAddress;
        uint256 amount;
    }

    Bid[] private minHeap;
    uint256 maxCapacity;
    mapping(address => bool) private admins;

    constructor(uint256 _maxCapacity) {
        maxCapacity = _maxCapacity;
    }
    
    function getHeap() public view returns (Bid[] memory) {
        return minHeap;
    }

    function resetHeap() public {
        while (minHeap.length != 0) {
            minHeap.pop();
        }
    }

    function insert(uint256 _amount, address _studentAddress) public {
        if (minHeap.length >= maxCapacity && _amount <= minHeap[0].amount) {
            return;
        }
        if (minHeap.length >= maxCapacity) {
            extractMin();
        }
        minHeap.push(Bid(_studentAddress, _amount));
        uint256 currentIndex = (uint16)(minHeap.length) - 1;
        bubbleUp(currentIndex);
    }

    function extractMin() public returns (uint256) {
        require(minHeap.length > 0, "Heap is empty");
        uint256 minValue = minHeap[0].amount;
        uint256 lastIndex = (uint256)(minHeap.length) - 1;
        minHeap[0] = minHeap[lastIndex];
        minHeap.pop();
        bubbleDown(0);
        return minValue;
    }

    function removeByAddress(address addressToRemove) public {
        uint256 indexToRemove = (uint256)(minHeap.length);
        for (uint256 i = 0; i < minHeap.length; i++) {
            if (minHeap[i].studentAddress == addressToRemove) {
                indexToRemove = i;
                break;
            }
        }
        if (indexToRemove != minHeap.length) {
            uint256 lastIndex = (uint256)(minHeap.length) - 1;
            minHeap[indexToRemove] = minHeap[lastIndex];
            minHeap.pop();
            bubbleDown(indexToRemove);
        }
    }

    function bubbleUp(uint256 index) private {
        while (index > 0) {
            uint256 parentIndex = (index - 1) / 2;
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

    function bubbleDown(uint256 index) private {
        uint256 leftChildIndex;
        uint256 rightChildIndex;
        uint256 smallestChildIndex;

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
