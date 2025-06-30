from algopy import ARC4Contract, arc4, Txn

class IPTokens(ARC4Contract):
    ip_name: arc4.String
    ip_metadata: arc4.String
    asa_id: arc4.Uint64
    ip_owner: arc4.Address
    is_locked: arc4.Bool
    licensee: arc4.Address

    @arc4.abimethod(create="required")
    def create_ip(self, name: arc4.String, metadata: arc4.String, asa_id: arc4.Uint64) -> arc4.Bool:
        """Register a new IP token with metadata and ASA ID."""
        self.ip_name = name
        self.ip_metadata = metadata
        self.asa_id = asa_id
        self.ip_owner = Txn.sender
        self.is_locked = False
        return True

    @arc4.abimethod
    def lock_ip(self) -> arc4.Bool:
        """Lock IP to prevent transfer (during licensing or fractionalization)."""
        assert Txn.sender == self.ip_owner, "Only owner can lock"
        self.is_locked = True
        return True

    @arc4.abimethod
    def unlock_ip(self) -> arc4.Bool:
        """Unlock IP after licensing ends."""
        assert Txn.sender == self.ip_owner, "Only owner can unlock"
        self.is_locked = False
        return True

    @arc4.abimethod
    def transfer_ip(self, new_owner: arc4.Address) -> arc4.Bool:
        """Transfer IP ownership (only if not locked)."""
        assert Txn.sender == self.ip_owner, "Only owner can transfer"
        assert not self.is_locked, "IP is currently locked"
        self.ip_owner = new_owner
        return True

    @arc4.abimethod
    def license_to(self, licensee_addr: arc4.Address) -> arc4.Bool:
        """Assign a licensee to the IP (requires lock)."""
        assert self.is_locked, "IP must be locked for licensing"
        self.licensee = licensee_addr
        return True

    @arc4.abimethod
    def get_ip_details(self) -> tuple[arc4.String, arc4.String, arc4.Uint64, arc4.Address, arc4.Bool, arc4.Address]:
        """Returns full IP metadata"""
        return (self.ip_name, self.ip_metadata, self.asa_id, self.ip_owner, self.is_locked, self.licensee)
