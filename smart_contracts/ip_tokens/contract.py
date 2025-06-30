from algopy import ARC4Contract, abi, itxn, Global, GlobalStateValue

class FractionalTokenApp(ARC4Contract):
    # Global state
    total_supply = GlobalStateValue(abi.Uint64)

    @abi.method
    def create_token(self, name: abi.String, unit_name: abi.String, decimals: abi.Uint64, total: abi.Uint64):
        assert self.sender == Global.creator_address, "Only creator"
        self.asset_id.set(
            itxn.AssetConfig(
                config_asset_total=total,
                config_asset_decimals=decimals,
                config_asset_unit_name=unit_name,
                config_asset_name=name,
                config_asset_url="ipfs://...",
                config_asset_manager=self.sender
            ).submit().created_asset
        )
        self.total_supply.set(total)

    @abi.method
    def transfer_token(self, receiver: abi.Address, amount: abi.Uint64):
        assert self.asset_id.get() != 0, "Asset not initialized"
        itxn.AssetTransfer(
            xfer_asset=self.asset_id.get(),
            asset_receiver=receiver,
            asset_amount=amount
        ).submit()

    @abi.method
    def burn(self, amount: abi.Uint64):
        assert self.asset_id.get() != 0, "Asset not initialized"
        itxn.AssetTransfer(
            xfer_asset=self.asset_id.get(),
            asset_receiver=Global.zero_address,
            asset_amount=amount
        ).submit()

