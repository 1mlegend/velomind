export const CONTRACTS = {
  paymentGateway: {
    address: (import.meta.env.VITE_PAYMENT_GATEWAY || "0x0000000000000000000000000000000000000000") as `0x${string}`,
    abi: [
      {
        name: "payForInference",
        type: "function",
        stateMutability: "payable",
        inputs: [{ name: "jobId", type: "bytes32" }],
        outputs: [],
      },
      {
        name: "INFERENCE_FEE",
        type: "function",
        stateMutability: "view",
        inputs: [],
        outputs: [{ name: "", type: "uint256" }],
      },
    ] as const,
  },
  proofRegistry: {
    address: (import.meta.env.VITE_PROOF_REGISTRY || "0x0000000000000000000000000000000000000000") as `0x${string}`,
    abi: [
      {
        name: "submitProof",
        type: "function",
        stateMutability: "nonpayable",
        inputs: [
          { name: "jobId", type: "bytes32" },
          { name: "inputHash", type: "bytes32" },
          { name: "outputHash", type: "bytes32" },
          { name: "model", type: "string" },
        ],
        outputs: [],
      },
      {
        name: "getProof",
        type: "function",
        stateMutability: "view",
        inputs: [{ name: "jobId", type: "bytes32" }],
        outputs: [
          {
            name: "",
            type: "tuple",
            components: [
              { name: "jobId", type: "bytes32" },
              { name: "user", type: "address" },
              { name: "inputHash", type: "bytes32" },
              { name: "outputHash", type: "bytes32" },
              { name: "model", type: "string" },
              { name: "timestamp", type: "uint256" },
            ],
          },
        ],
      },
      {
        name: "getProofsByUser",
        type: "function",
        stateMutability: "view",
        inputs: [{ name: "user", type: "address" }],
        outputs: [{ name: "", type: "bytes32[]" }],
      },
      {
        name: "getProofCount",
        type: "function",
        stateMutability: "view",
        inputs: [{ name: "user", type: "address" }],
        outputs: [{ name: "", type: "uint256" }],
      },
    ] as const,
  },
};
