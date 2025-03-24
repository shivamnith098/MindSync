// server/blockchain/contracts/PaperRegistry.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PaperRegistry {
    struct Paper {
        address author;
        string metadataHash;
        uint256 timestamp;
        bool exists;
    }
    
    // Mapping from paper hash to paper details
    mapping(string => Paper) private papers;
    
    // Events
    event PaperRegistered(string paperHash, address author, uint256 timestamp);
    event PaperCited(string paperHash, string citedByHash, uint256 timestamp);
    
    /**
     * @dev Register a new paper on the blockchain
     * @param paperHash Cryptographic hash of the paper content
     * @param metadata JSON string containing paper metadata
     */
    function registerPaper(string memory paperHash, string memory metadata) public {
        require(!papers[paperHash].exists, "Paper already registered");
        
        // Create paper record
        papers[paperHash] = Paper({
            author: msg.sender,
            metadataHash: metadata,
            timestamp: block.timestamp,
            exists: true
        });
        
        // Emit registration event
        emit PaperRegistered(paperHash, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Verify if a paper exists and return its details
     * @param paperHash Cryptographic hash of the paper to verify
     */
    function verifyPaper(string memory paperHash) public view 
        returns (address author, uint256 timestamp, string memory metadataHash, bool registered) {
        Paper memory paper = papers[paperHash];
        return (paper.author, paper.timestamp, paper.metadataHash, paper.exists);
    }
    
    /**
     * @dev Register a citation between two papers
     * @param paperHash Hash of the paper being cited
     * @param citedByHash Hash of the paper doing the citing
     */
    function recordCitation(string memory paperHash, string memory citedByHash) public {
        require(papers[paperHash].exists, "Cited paper does not exist");
        require(papers[citedByHash].exists, "Citing paper does not exist");
        
        // Emit citation event
        emit PaperCited(paperHash, citedByHash, block.timestamp);
    }
}