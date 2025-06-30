from algopy import ARC4Contract, abi, itxn, Global, GlobalStateValue, Subroutine, Txn, Cond

class FractionalTokenApp(ARC4Contract):
    # Global State
    asset_id = GlobalStateValue(abi.Uint64)              # Stores the ASA ID
    total_supply = GlobalStateValue(abi.Uint64)          # Total token supply
    paused = GlobalStateValue(abi.Bool)                  # Pause feature
    metadata_url = GlobalStateValue(abi.String)          # IPFS or metadata link

    # Helper to check creator
    @Subroutine
    def only_creator() -> None:
        return assert Txn.sender == Global.creator_address, "Only creator"

    # Initialization (one-time only)
    @abi.method
    def create_token(
        self,
        name: abi.String,
        unit_name: abi.String,
        decimals: abi.Uint64,
        total: abi.Uint64,
        metadata: abi.String
    ):
        only_creator()
        assert self.asset_id.get() == 0, "Asset already created"

        created_asset_id = itxn.AssetConfig(
            config_asset_total=total,
            config_asset_decimals=decimals,
            config_asset_unit_name=unit_name,
            config_asset_name=name,
            config_asset_url=metadata.get(),
            config_asset_manager=Txn.sender
        ).submit().created_asset

        self.asset_id.set(created_asset_id)
        self.total_supply.set(total)
        self.metadata_url.set(metadata)

    # Pause/unpause by admin
    @abi.method
    def set_pause(self, state: abi.Bool):
        only_creator()
        self.paused.set(state)

    # Transfer token
    @abi.method
    def transfer_token(self, receiver: abi.Address, amount: abi.Uint64):
        assert not self.paused.get(), "Contract is paused"
        assert self.asset_id.get() != 0, "Asset not initialized"

        itxn.AssetTransfer(
            xfer_asset=self.asset_id.get(),
            asset_receiver=receiver,
            asset_amount=amount
        ).submit()

    # Burn (send to zero address)
    @abi.method
    def burn_token(self, amount: abi.Uint64):
        only_creator()
        assert self.asset_id.get() != 0, "Asset not initialized"

        itxn.AssetTransfer(
            xfer_asset=self.asset_id.get(),
            asset_receiver=Global.zero_address,
            asset_amount=amount
        ).submit()
