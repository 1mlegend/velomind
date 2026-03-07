// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract PaymentGateway {
    address public owner;
    uint256 public constant INFERENCE_FEE = 0.00001 ether;

    event PaymentReceived(bytes32 indexed jobId, address indexed user, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function payForInference(bytes32 jobId) external payable {
        require(msg.value >= INFERENCE_FEE, "Insufficient fee");
        emit PaymentReceived(jobId, msg.sender, msg.value);
    }

    function withdraw() external onlyOwner {
        (bool ok, ) = owner.call{value: address(this).balance}("");
        require(ok, "Withdraw failed");
    }
}
