// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title CyberSlotsVaultAdapter
 * @notice Flap.sh Vault Adapter for CyberSlots game contract
 * @dev Implements the description() interface to display dynamic vault status
 * 
 * Vault Address: 0x0817E30b64a085022963B23c762001718D57B3f0
 * This adapter reads the CyberSlots contract state and returns a formatted description
 */
interface ICyberSlots {
    function totalSpins() external view returns (uint256);
    function totalPaidOut() external view returns (uint256);
    function totalCreditsDeposited() external view returns (uint256);
}

contract CyberSlotsVaultAdapter {
    // CyberSlots game contract address on BSC Mainnet
    address public constant CYBER_SLOTS = 0x0817E30b64a085022963B23c762001718D57B3f0;
    
    event BNBReceived(uint256 amount);
    
    /**
     * @notice Returns dynamic description of the CyberSlots vault status
     * @dev Required by Flap.sh vault interface
     * @return Dynamic string containing vault information
     */
    function description() external view returns (string memory) {
        uint256 prizePool = CYBER_SLOTS.balance;
        uint256 prizePoolBNB = prizePool / 1 ether;
        uint256 prizePoolDecimals = (prizePool % 1 ether) / 1e14; // 4 decimal places
        
        ICyberSlots slots = ICyberSlots(CYBER_SLOTS);
        uint256 totalSpins = slots.totalSpins();
        uint256 totalPaidOut = slots.totalPaidOut();
        uint256 totalPaidOutBNB = totalPaidOut / 1 ether;
        uint256 totalPaidOutDecimals = (totalPaidOut % 1 ether) / 1e14;
        
        uint256 totalBurned = slots.totalCreditsDeposited();
        uint256 totalBurnedTokens = totalBurned / 1e18;
        
        return string(
            abi.encodePacked(
                "CyberSlots - Burn-to-Play Slot Machine on BSC. ",
                "Current Jackpot Pool: ",
                _uint2str(prizePoolBNB),
                ".",
                _padLeft(_uint2str(prizePoolDecimals), 4),
                " BNB. ",
                "Total Spins: ",
                _uint2str(totalSpins),
                ". Total Paid Out: ",
                _uint2str(totalPaidOutBNB),
                ".",
                _padLeft(_uint2str(totalPaidOutDecimals), 4),
                " BNB. ",
                "Tokens Burned: ",
                _formatLargeNumber(totalBurnedTokens),
                " CYBER. ",
                "Win up to 50% of the jackpot!"
            )
        );
    }
    
    /**
     * @dev Convert uint to string
     */
    function _uint2str(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
    
    /**
     * @dev Pad string with leading zeros
     */
    function _padLeft(string memory str, uint256 length) internal pure returns (string memory) {
        bytes memory strBytes = bytes(str);
        if (strBytes.length >= length) {
            return str;
        }
        bytes memory result = new bytes(length);
        uint256 padLength = length - strBytes.length;
        for (uint256 i = 0; i < padLength; i++) {
            result[i] = "0";
        }
        for (uint256 i = 0; i < strBytes.length; i++) {
            result[padLength + i] = strBytes[i];
        }
        return string(result);
    }
    
    /**
     * @dev Format large numbers with K/M/B suffix
     */
    function _formatLargeNumber(uint256 value) internal pure returns (string memory) {
        if (value >= 1_000_000_000) {
            return string(abi.encodePacked(_uint2str(value / 1_000_000_000), "B"));
        } else if (value >= 1_000_000) {
            return string(abi.encodePacked(_uint2str(value / 1_000_000), "M"));
        } else if (value >= 1_000) {
            return string(abi.encodePacked(_uint2str(value / 1_000), "K"));
        }
        return _uint2str(value);
    }
    
    /**
     * @dev Receive BNB - forwards to CyberSlots prize pool
     */
    receive() external payable {
        emit BNBReceived(msg.value);
        // Forward any received BNB to the CyberSlots contract
        (bool success, ) = CYBER_SLOTS.call{value: msg.value}("");
        require(success, "Forward failed");
    }
}
