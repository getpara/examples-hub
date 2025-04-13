// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import {ERC20Capped} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import {ERC20Burnable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Multicall} from "@openzeppelin/contracts/utils/Multicall.sol";

contract ParaTestToken is ERC20, ERC20Permit, ERC20Capped, ERC20Burnable, Ownable {
    mapping(address => uint256) public mintedAmount;
    uint256 public constant MINT_LIMIT = 10 * 10**18;

    constructor() 
        ERC20("Para Test Token", "CTT") 
        ERC20Permit("Para Test Token") 
        ERC20Capped(1000000 * 10**decimals())
        Ownable(msg.sender)
    {
        _mint(msg.sender, 10 * 10**decimals());
    }

    function mint(uint256 amount) public {
        if (msg.sender != owner()) {
            require(mintedAmount[msg.sender] + amount <= MINT_LIMIT, "Exceeds per-address mint limit");
            mintedAmount[msg.sender] += amount;
        }
        _mint(msg.sender, amount);
    }

    function _update(address from, address to, uint256 value) internal virtual override(ERC20, ERC20Capped) {
        super._update(from, to, value);
    }
}