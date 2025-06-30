rom algopy import ARC4Contract, arc4, ABIReturnSubroutine, Global, Txn, itxn

class IPTokens(ARC4Contract):
    ip_owner: arc4.Address
    ip_locked: arc4.Bool
    ip_name: arc4.String
    licensee: arc4.Address

    @arc4.abimethod(create="required")
    def create_ip(self, ip_name: arc4.String) -> arc4.Bool:
        self.ip_owner = Txn.sender
        self.ip_locked = False
        self.ip_name = ip_name
        return True

    @arc4.abimethod
    def lock_ip(self) -> arc4.Bool:
        assert Txn.sender == self.ip_owner, "Only owner can lock"
        self.ip_locked = True
        return True

    @arc4.abimethod
    def unlock_ip(self) -> arc4.Bool:
        assert Txn.sender == self.ip_owner, "Only owner can unlock"
        self.ip_locked = False
        return True

    @arc4.abimethod
    def transfer_ip(self, new_owner: arc4.Address) -> arc4.Bool:
        assert not self.ip_locked, "IP is locked, can't transfer"
        assert Txn.sender == self.ip_owner, "Only owner can transfer"
        self.ip_owner = new_owner
        return True

    @arc4.abimethod
    def license_ip(self, licensee_address: arc4.Address) -> arc4.Bool:
        assert self.ip_locked, "Lock the IP before licensing"
        self.licensee = licensee_address
        return True

    @arc4.abimethod
    def get_ip_metadata(self) -> tuple[arc4.String, arc4.Address, arc4.Bool, arc4.Address]:
        return (self.ip_name, self.ip_owner, self.ip_locked, self.licensee)


