// SPDX-License-Identifier: MIT
pragma solidity 0.8.25;

contract Example {
  uint public x;

  event XChanged(uint);

  function changeX(uint _x) external {
    x = _x;
    emit XChanged(_x);
  }
}