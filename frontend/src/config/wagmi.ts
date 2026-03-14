import { clusterApiUrl, Connection } from '@solana/web3.js';

// Treasury wallet that receives inference payments
export const TREASURY_ADDRESS = import.meta.env.VITE_TREASURY_ADDRESS || '';

// Solana connection
export const SOLANA_NETWORK = (import.meta.env.VITE_SOLANA_NETWORK || 'mainnet-beta') as 'mainnet-beta' | 'devnet';
export const SOLANA_RPC = import.meta.env.VITE_SOLANA_RPC || clusterApiUrl(SOLANA_NETWORK);
export const connection = new Connection(SOLANA_RPC, 'confirmed');

// Inference fee in SOL
export const INFERENCE_FEE = 0.00001;
