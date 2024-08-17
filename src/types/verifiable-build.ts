export interface VerificationStatus {
    is_verified: boolean;
    message: string;
    on_chain_hash: string;
    executable_hash: string;
    last_verified_at: string;
    repo_url: string;
}