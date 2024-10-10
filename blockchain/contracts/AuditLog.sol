pragma solidity ^0.8.2;


contract AuditLog {
    string[] private events;

    constructor() {}

    event NewLog(string message);

    function add(string memory message) public {
        events.push(message);
        emit NewLog(message);
    }

    function length() public view returns (uint)   {
        return events.length;
    }

    function get(uint index) public view returns (string memory)   {
        return events[index];
    }
}
