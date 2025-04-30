from algopy import *
from algopy.arc4 import abimethod

class IPTokenizationPlatform(ARC4Contract):
    # === Global State Variables ===
    assetid: UInt64
    creator_account: Account
    royalty_percent: UInt64
    kyc_verified: DynamicMap[Account, Bool]

    # === Create Application ===
    @abimethod(allow_actions=["NoOp"], create="require")
    def create_application(self, asset_id: Asset, royalty_percent: UInt64) -> None:
        self.assetid = asset_id.id
        self.creator_account = Txn.sender
        self.royalty_percent = royalty_percent
        self.kyc_verified = DynamicMap()

    # === Module 1: Tokenize IP Asset ===
    @abimethod()
    def tokenize_asset(self, mbrpay: gtxn.PaymentTransaction) -> None:
        assert Txn.sender == self.creator_account
        assert not Global.current_application_address.is_opted_in(Asset(self.assetid))

        assert mbrpay.receiver == Global.current_application_address
        assert mbrpay.amount == Global.min_balance + Global.asset_opt_in_min_balance

        itxn.AssetTransfer(
            xfer_asset=self.assetid,
            asset_receiver=Global.current_application_address,
            asset_amount=0,
        ).submit()

    # === Module 2: Marketplace: Buy Fraction ===
    @abimethod()
    def buy_ip_fraction(self, buyer_payment: gtxn.PaymentTransaction, fraction_amount: UInt64) -> None:
        assert self.kyc_verified.get(Txn.sender, False)
        assert buyer_payment.receiver == Global.current_application_address
        assert buyer_payment.amount > 0
        assert fraction_amount > 0

        itxn.AssetTransfer(
            xfer_asset=self.assetid,
            asset_receiver=Txn.sender,
            asset_amount=fraction_amount,
        ).submit()

    # === Module 2: Marketplace: Atomic Swap ===
    @abimethod()
    def atomic_swap(self, buyer: Account, seller: Account, amount: UInt64) -> None:
        assert self.assetid != UInt64(0)
        assert amount > 0
        assert self.kyc_verified.get(buyer, False)
        assert self.kyc_verified.get(seller, False)

        itxn.AssetTransfer(
            xfer_asset=self.assetid,
            asset_receiver=buyer,
            asset_amount=amount,
            sender=seller,
            fee=1_000,
        ).submit()

    # === Module 3: Legal Compliance: Verify KYC ===
    @abimethod()
    def verify_kyc(self, user: Account, is_verified: Bool) -> None:
        assert Txn.sender == self.creator_account
        self.kyc_verified[user] = is_verified

    # === Module 3: Legal Compliance: Revoke KYC ===
    @abimethod()
    def revoke_kyc(self, user: Account) -> None:
        assert Txn.sender == self.creator_account
        self.kyc_verified[user] = False

    # === Module 4: Royalty Distribution ===
    @abimethod()
    def distribute_royalty(self, usage_payment: gtxn.PaymentTransaction) -> None:
        assert usage_payment.receiver == Global.current_application_address
        assert usage_payment.amount > 0

        royalty_fee = (usage_payment.amount * self.royalty_percent) // 100

        itxn.Payment(
            receiver=self.creator_account,
            amount=royalty_fee,
            fee=1_000,
        ).submit()

    # === Module 5: Wallet Connection (Ping) ===
    @abimethod()
    def connect_wallet(self) -> None:
        assert Txn.sender != Global.zero_address

    # === Admin: Delete Application ===
    @abimethod(allow_actions=["DeleteApplication"])
    def delete_application(self) -> None:
        assert Txn.sender == self.creator_account

        itxn.AssetTransfer(
            xfer_asset=self.assetid,
            asset_receiver=self.creator_account,
            asset_amount=0,
            asset_close_to=self.creator_account,
            fee=1_000,
        ).submit()

        itxn.Payment(
            receiver=self.creator_account,
            amount=0,
            close_remainder_to=self.creator_account,
            fee=1_000,
        ).submit()
        
