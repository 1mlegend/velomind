// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract ProofRegistry {
    struct Proof {
        bytes32 jobId;
        address user;
        bytes32 inputHash;
        bytes32 outputHash;
        string model;
        uint256 timestamp;
    }

    mapping(bytes32 => Proof) public proofs;
    mapping(address => bytes32[]) public userProofs;

    event ProofSubmitted(
        bytes32 indexed jobId,
        address indexed user,
        bytes32 inputHash,
        bytes32 outputHash,
        string model,
        uint256 timestamp
    );

    function submitProof(
        bytes32 jobId,
        bytes32 inputHash,
        bytes32 outputHash,
        string calldata model
    ) external {
        require(proofs[jobId].timestamp == 0, "Proof already exists");

        proofs[jobId] = Proof({
            jobId: jobId,
            user: msg.sender,
            inputHash: inputHash,
            outputHash: outputHash,
            model: model,
            timestamp: block.timestamp
        });

        userProofs[msg.sender].push(jobId);

        emit ProofSubmitted(jobId, msg.sender, inputHash, outputHash, model, block.timestamp);
    }

    function getProof(bytes32 jobId) external view returns (Proof memory) {
        return proofs[jobId];
    }

    function getProofsByUser(address user) external view returns (bytes32[] memory) {
        return userProofs[user];
    }

    function getProofCount(address user) external view returns (uint256) {
        return userProofs[user].length;
    }
}
