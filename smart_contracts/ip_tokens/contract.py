from pyteal import *
from beaker.application import Application
from beaker.state import ApplicationStateValue
from beaker.decorators import create, delete, external
from beaker.lib.storage import BoxMapping

class IPTokenizationPlatform(Application):
    # === Global State Variables ===
    assetid = ApplicationStateValue(TealType.uint64)
    creator_account = ApplicationStateValue(TealType.bytes)
    royalty_percent = ApplicationStateValue(TealType.uint64)
    kyc_verified = BoxMapping(TealType.bytes, TealType.uint64)

    def __init__(self) -> None:
        super().__init__()

    # === Create Application ===
    @create
    def create_application(self, asset_id: abi.Asset, royalty_percent: abi.Uint64) -> Expr:
        return Seq([
            self.assetid.set(asset_id.asset_id()),
            self.creator_account.set(Txn.sender()),
            self.royalty_percent.set(royalty_percent.get())
        ])

    # === Module 1: Tokenize IP Asset ===
    @external
    def tokenize_asset(self, mbrpay: abi.PaymentTransaction) -> Expr:
        return Seq([
            Assert(Txn.sender() == self.creator_account.get()),
            Assert(Not(AssetHolding.balance(Global.current_application_address(), self.assetid.get()))),
            Assert(mbrpay.get().receiver() == Global.current_application_address()),
            Assert(mbrpay.get().amount() == Global.min_balance() + Global.asset_min_balance()),
            InnerTxnBuilder.Begin(),
            InnerTxnBuilder.SetFields({
                TxnField.type_enum: TxnType.AssetTransfer,
                TxnField.xfer_asset: self.assetid.get(),
                TxnField.asset_receiver: Global.current_application_address(),
                TxnField.asset_amount: Int(0),
            }),
            InnerTxnBuilder.Submit(),
        ])

    # === Module 2: Marketplace: Buy Fraction ===
    @external
    def buy_ip_fraction(self, buyer_payment: abi.PaymentTransaction, fraction_amount: abi.Uint64) -> Expr:
        return Seq([
            Assert(self.kyc_verified[Txn.sender()].get() == Int(1)),
            Assert(buyer_payment.get().receiver() == Global.current_application_address()),
            Assert(buyer_payment.get().amount() > Int(0)),
            Assert(fraction_amount.get() > Int(0)),
            InnerTxnBuilder.Begin(),
            InnerTxnBuilder.SetFields({
                TxnField.type_enum: TxnType.AssetTransfer,
                TxnField.xfer_asset: self.assetid.get(),
                TxnField.asset_receiver: Txn.sender(),
                TxnField.asset_amount: fraction_amount.get(),
            }),
            InnerTxnBuilder.Submit(),
        ])

    # === Module 2: Marketplace: Atomic Swap ===
    @external
    def atomic_swap(self, buyer: abi.Account, seller: abi.Account, amount: abi.Uint64) -> Expr:
        return Seq([
            Assert(self.assetid.get() != Int(0)),
            Assert(amount.get() > Int(0)),
            Assert(self.kyc_verified[buyer.address()].get() == Int(1)),
            Assert(self.kyc_verified[seller.address()].get() == Int(1)),
            InnerTxnBuilder.Begin(),
            InnerTxnBuilder.SetFields({
                TxnField.type_enum: TxnType.AssetTransfer,
                TxnField.xfer_asset: self.assetid.get(),
                TxnField.asset_receiver: buyer.address(),
                TxnField.asset_amount: amount.get(),
                TxnField.sender: seller.address(),
                TxnField.fee: Int(1000),
            }),
            InnerTxnBuilder.Submit(),
        ])

    # === Module 3: Legal Compliance: Verify KYC ===
    @external
    def verify_kyc(self, user: abi.Account, is_verified: abi.Bool) -> Expr:
        return Seq([
            Assert(Txn.sender() == self.creator_account.get()),
            self.kyc_verified[user.address()].set(Int(1) if is_verified.get() else Int(0)),
        ])

    # === Module 3: Legal Compliance: Revoke KYC ===
    @external
    def revoke_kyc(self, user: abi.Account) -> Expr:
        return Seq([
            Assert(Txn.sender() == self.creator_account.get()),
            self.kyc_verified[user.address()].set(Int(0)),
        ])

    # === Module 4: Royalty Distribution ===
    @external
    def distribute_royalty(self, usage_payment: abi.PaymentTransaction) -> Expr:
        return Seq([
            Assert(usage_payment.get().receiver() == Global.current_application_address()),
            Assert(usage_payment.get().amount() > Int(0)),
            InnerTxnBuilder.Begin(),
            InnerTxnBuilder.SetFields({
                TxnField.type_enum: TxnType.Payment,
                TxnField.receiver: self.creator_account.get(),
                TxnField.amount: usage_payment.get().amount() * self.royalty_percent.get() / Int(100),
                TxnField.fee: Int(1000),
            }),
            InnerTxnBuilder.Submit(),
        ])

    # === Module 5: Wallet Connection (Ping) ===
    @external
    def connect_wallet(self) -> Expr:
        return Assert(Txn.sender() != Global.zero_address())

    # === Admin: Delete Application ===
    @delete
    def delete_application(self) -> Expr:
        return Seq([
            Assert(Txn.sender() == self.creator_account.get()),
            InnerTxnBuilder.Begin(),
            InnerTxnBuilder.SetFields({
                TxnField.type_enum: TxnType.AssetTransfer,
                TxnField.xfer_asset: self.assetid.get(),
                TxnField.asset_receiver: self.creator_account.get(),
                TxnField.asset_amount: Int(0),
                TxnField.fee: Int(1000),
            }),
            InnerTxnBuilder.Submit(),
        ])
