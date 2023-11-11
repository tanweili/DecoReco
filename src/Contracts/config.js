export const CONTRACT_NAME_ADDRESS = "0xdb90fDc108C846dAB47F9410B5D1a650652750BA";
export const CONTRACT_NAME_ABI = [
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_moduleCode",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "_amount",
				"type": "uint256"
			}
		],
		"name": "bidForModule",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_moduleCode",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_moduleName",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_moduleDescription",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "_maxCapacity",
				"type": "uint256"
			}
		],
		"name": "createModule",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_moduleCode",
				"type": "string"
			}
		],
		"name": "deleteModule",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "deregisterStudent",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "endCourseReg",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "registerStudent",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "startTime",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "endTime",
				"type": "uint256"
			}
		],
		"name": "StartedNotification",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "string",
				"name": "moduleName",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "address[]",
				"name": "enrolledStudents",
				"type": "address[]"
			}
		],
		"name": "bidResults",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "time",
				"type": "uint256"
			}
		],
		"name": "resultsPublished",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_duration",
				"type": "uint256"
			}
		],
		"name": "startCourseReg",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_moduleCode",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_moduleName",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_moduleDescription",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "_maxCapacity",
				"type": "uint256"
			}
		],
		"name": "updateModule",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_moduleCode",
				"type": "string"
			}
		],
		"name": "withdrawBidForModule",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "endTime",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_moduleCode",
				"type": "string"
			}
		],
		"name": "viewModule",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]